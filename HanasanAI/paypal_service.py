import os
import requests
import json
from datetime import datetime, timedelta

class PayPalService:
    def __init__(self):
        self.client_id = "ATurw-yuDl3X9wdmlXBPXd9rFv_jy83_iiqp36ugTU1wzSRbfspXZbuIj_E4YE-evtQnG4dTy-9ETOdC"
        self.client_secret = "EFMzQh9r3VUTSb2DQ9MMW_HZXmzvsLaheMAeOu6qjaR4e3SHft7ik_SLjmCgUz72isAkE1Lu8nLtciiB"
        self.base_url = "https://api-m.sandbox.paypal.com"  # Use sandbox for testing
        self.access_token = None
        
    def get_access_token(self):
        """Get PayPal access token"""
        if self.access_token:
            return self.access_token
            
        url = f"{self.base_url}/v1/oauth2/token"
        headers = {
            "Accept": "application/json",
            "Accept-Language": "en_US",
        }
        data = "grant_type=client_credentials"
        
        response = requests.post(
            url, 
            headers=headers, 
            data=data,
            auth=(self.client_id, self.client_secret)
        )
        
        if response.status_code == 200:
            self.access_token = response.json()["access_token"]
            return self.access_token
        else:
            raise Exception(f"Failed to get PayPal access token: {response.text}")
    
    def create_subscription_plan(self):
        """Create a subscription plan for $20/month"""
        access_token = self.get_access_token()
        
        url = f"{self.base_url}/v1/billing/plans"
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {access_token}",
            "Accept": "application/json",
            "PayPal-Request-Id": f"PLAN-{datetime.now().strftime('%Y%m%d%H%M%S')}",
            "Prefer": "return=representation"
        }
        
        plan_data = {
            "product_id": self.create_product(),
            "name": "HanasanAI Premium",
            "description": "Monthly subscription for HanasanAI Premium features",
            "status": "ACTIVE",
            "billing_cycles": [
                {
                    "frequency": {
                        "interval_unit": "MONTH",
                        "interval_count": 1
                    },
                    "tenure_type": "REGULAR",
                    "sequence": 1,
                    "total_cycles": 0,
                    "pricing_scheme": {
                        "fixed_price": {
                            "value": "20.00",
                            "currency_code": "USD"
                        }
                    }
                }
            ],
            "payment_preferences": {
                "auto_bill_outstanding": True,
                "setup_fee": {
                    "value": "0.00",
                    "currency_code": "USD"
                },
                "setup_fee_failure_action": "CONTINUE",
                "payment_failure_threshold": 3
            },
            "taxes": {
                "percentage": "0.00",
                "inclusive": False
            }
        }
        
        response = requests.post(url, headers=headers, json=plan_data)
        
        if response.status_code == 201:
            return response.json()["id"]
        else:
            raise Exception(f"Failed to create subscription plan: {response.text}")
    
    def create_product(self):
        """Create a product for the subscription"""
        access_token = self.get_access_token()
        
        url = f"{self.base_url}/v1/catalogs/products"
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {access_token}",
            "Accept": "application/json",
            "PayPal-Request-Id": f"PRODUCT-{datetime.now().strftime('%Y%m%d%H%M%S')}",
        }
        
        product_data = {
            "name": "HanasanAI Premium",
            "description": "Premium AI chat service with advanced models and features",
            "type": "SERVICE",
            "category": "SOFTWARE"
        }
        
        response = requests.post(url, headers=headers, json=product_data)
        
        if response.status_code == 201:
            return response.json()["id"]
        else:
            raise Exception(f"Failed to create product: {response.text}")
    
    def verify_subscription(self, subscription_id):
        """Verify a subscription status"""
        access_token = self.get_access_token()
        
        url = f"{self.base_url}/v1/billing/subscriptions/{subscription_id}"
        headers = {
            "Authorization": f"Bearer {access_token}",
            "Accept": "application/json",
        }
        
        response = requests.get(url, headers=headers)
        
        if response.status_code == 200:
            subscription_data = response.json()
            return {
                "status": subscription_data["status"],
                "subscriber": subscription_data.get("subscriber", {}),
                "billing_info": subscription_data.get("billing_info", {})
            }
        else:
            raise Exception(f"Failed to verify subscription: {response.text}")
    
    def cancel_subscription(self, subscription_id, reason="User requested cancellation"):
        """Cancel a subscription"""
        access_token = self.get_access_token()
        
        url = f"{self.base_url}/v1/billing/subscriptions/{subscription_id}/cancel"
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {access_token}",
            "Accept": "application/json",
        }
        
        cancel_data = {
            "reason": reason
        }
        
        response = requests.post(url, headers=headers, json=cancel_data)
        
        return response.status_code == 204