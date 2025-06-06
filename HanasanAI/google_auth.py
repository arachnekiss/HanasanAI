import json
import os
import requests
from app import db
from flask import Blueprint, redirect, request, url_for, session
from flask_login import login_user, logout_user, current_user
from models import User
from oauthlib.oauth2 import WebApplicationClient
from datetime import datetime

GOOGLE_CLIENT_ID = os.environ["GOOGLE_OAUTH_CLIENT_ID"]
GOOGLE_CLIENT_SECRET = os.environ["GOOGLE_OAUTH_CLIENT_SECRET"]
GOOGLE_DISCOVERY_URL = "https://accounts.google.com/.well-known/openid-configuration"

# Make sure to use this redirect URL. It has to match the one in the whitelist
DEV_REDIRECT_URL = f'https://{os.environ.get("REPLIT_DEV_DOMAIN", "localhost:5000")}/google_login/callback'

print(f"""To make Google authentication work:
1. Go to https://console.cloud.google.com/apis/credentials
2. Create a new OAuth 2.0 Client ID
3. Add {DEV_REDIRECT_URL} to Authorized redirect URIs

For detailed instructions, see:
https://docs.replit.com/additional-resources/google-auth-in-flask#set-up-your-oauth-app--client
""")

client = WebApplicationClient(GOOGLE_CLIENT_ID)

google_auth = Blueprint("google_auth", __name__)


@google_auth.route("/google_login")
def login():
    google_provider_cfg = requests.get(GOOGLE_DISCOVERY_URL).json()
    authorization_endpoint = google_provider_cfg["authorization_endpoint"]

    request_uri = client.prepare_request_uri(
        authorization_endpoint,
        redirect_uri=request.base_url.replace("http://", "https://") + "/callback",
        scope=["openid", "email", "profile"],
    )
    return redirect(request_uri)


@google_auth.route("/google_login/callback")
def callback():
    code = request.args.get("code")
    google_provider_cfg = requests.get(GOOGLE_DISCOVERY_URL).json()
    token_endpoint = google_provider_cfg["token_endpoint"]

    token_url, headers, body = client.prepare_token_request(
        token_endpoint,
        authorization_response=request.url.replace("http://", "https://"),
        redirect_url=request.base_url.replace("http://", "https://"),
        code=code,
    )
    token_response = requests.post(
        token_url,
        headers=headers,
        data=body,
        auth=(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET),
    )

    client.parse_request_body_response(json.dumps(token_response.json()))

    userinfo_endpoint = google_provider_cfg["userinfo_endpoint"]
    uri, headers, body = client.add_token(userinfo_endpoint)
    userinfo_response = requests.get(uri, headers=headers, data=body)

    userinfo = userinfo_response.json()
    if userinfo.get("email_verified"):
        users_email = userinfo["email"]
        users_name = userinfo["name"]
        users_avatar = userinfo.get("picture", "")
        provider_id = userinfo["sub"]
    else:
        return "User email not available or not verified by Google.", 400

    # Check if user exists
    user = User.query.filter_by(provider_id=provider_id).first()
    if not user:
        # Create new user
        user = User(
            email=users_email,
            name=users_name,
            avatar_url=users_avatar,
            provider='google',
            provider_id=provider_id,
            subscription_status='free'
        )
        db.session.add(user)
        db.session.commit()
    else:
        # Update existing user info
        user.last_login = datetime.utcnow()
        user.name = users_name
        user.avatar_url = users_avatar
        db.session.commit()

    login_user(user, remember=True)
    return redirect(url_for("index"))


@google_auth.route("/logout")
def logout():
    logout_user()
    session.clear()
    return redirect(url_for("index"))