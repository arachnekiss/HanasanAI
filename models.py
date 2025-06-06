from app import db
from datetime import datetime
from sqlalchemy import Text, DateTime, Integer, String, Boolean
from flask_login import UserMixin
import uuid

class User(UserMixin, db.Model):
    """Model for user accounts and subscriptions"""
    id = db.Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email = db.Column(String(120), unique=True, nullable=False)
    name = db.Column(String(100), nullable=False)
    avatar_url = db.Column(String(255))
    provider = db.Column(String(20), default='google')  # 'google', 'microsoft'
    provider_id = db.Column(String(100), unique=True, nullable=False)
    created_at = db.Column(DateTime, default=datetime.utcnow)
    last_login = db.Column(DateTime, default=datetime.utcnow)
    
    # Subscription fields
    subscription_status = db.Column(String(20), default='free')  # 'free', 'premium'
    subscription_start_date = db.Column(DateTime)
    subscription_end_date = db.Column(DateTime)
    stripe_customer_id = db.Column(String(100))
    stripe_subscription_id = db.Column(String(100))
    
    # Usage tracking
    monthly_message_count = db.Column(Integer, default=0)
    last_message_reset = db.Column(DateTime, default=datetime.utcnow)
    
    # User preferences and settings
    theme_preference = db.Column(String(20), default='dark')  # 'dark', 'light', 'auto'
    language_preference = db.Column(String(10), default='en')  # 'en', 'ja', 'ko'
    voice_language = db.Column(String(10), default='en')  # Voice language preference
    notifications_enabled = db.Column(Boolean, default=True)
    email_notifications = db.Column(Boolean, default=True)
    push_notifications = db.Column(Boolean, default=False)
    sound_notifications = db.Column(Boolean, default=True)
    
    # OpenAI API key for user's own API usage
    openai_api_key = db.Column(String(255))  # User's personal OpenAI API key
    
    # Custom instructions
    custom_instructions_about = db.Column(Text)  # What would you like ChatGPT to know about you
    custom_instructions_style = db.Column(Text)  # How would you like ChatGPT to respond
    
    # Chat history setting
    save_chat_history = db.Column(Boolean, default=True)  # Whether to save chat history
    
    # Relationships
    chat_sessions = db.relationship('ChatSession', backref='user', lazy=True)

class ChatSession(db.Model):
    """Model for storing chat sessions"""
    id = db.Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(String(36), db.ForeignKey('user.id'), nullable=True)  # Nullable for guest sessions
    created_at = db.Column(DateTime, default=datetime.utcnow)
    last_activity = db.Column(DateTime, default=datetime.utcnow)
    session_type = db.Column(String(20), default='main')  # 'main' or 'messenger'
    character_emotion = db.Column(String(20), default='neutral')
    
    # Relationship to messages
    messages = db.relationship('ChatMessage', backref='session', lazy=True, cascade='all, delete-orphan')

class ChatMessage(db.Model):
    """Model for storing individual chat messages"""
    id = db.Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    session_id = db.Column(String(36), db.ForeignKey('chat_session.id'), nullable=False)
    content = db.Column(Text, nullable=False)
    role = db.Column(String(10), nullable=False)  # 'user' or 'assistant'
    timestamp = db.Column(DateTime, default=datetime.utcnow)
    message_type = db.Column(String(20), default='text')  # 'text', 'image', 'voice'
    emotion_data = db.Column(Text)  # JSON string for emotion analysis
    tokens_used = db.Column(Integer, default=0)
    model_used = db.Column(String(50))

class RateLimitRecord(db.Model):
    """Model for tracking API rate limits"""
    id = db.Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    endpoint = db.Column(String(50), nullable=False)  # 'chat', 'whisper', 'vision', etc.
    requests_count = db.Column(Integer, default=0)
    tokens_count = db.Column(Integer, default=0)
    window_start = db.Column(DateTime, default=datetime.utcnow)
    last_request = db.Column(DateTime, default=datetime.utcnow)

class ProactiveMessage(db.Model):
    """Model for storing proactive message scheduling in messenger mode"""
    id = db.Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    session_id = db.Column(String(36), db.ForeignKey('chat_session.id'), nullable=False)
    scheduled_time = db.Column(DateTime, nullable=False)
    sent = db.Column(Boolean, default=False)
    content = db.Column(Text)
    context_summary = db.Column(Text)  # Summary of conversation context
