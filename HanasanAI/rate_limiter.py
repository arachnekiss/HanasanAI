import time
from datetime import datetime, timedelta
from collections import defaultdict
import logging

class RateLimiter:
    """Rate limiter for OpenAI API calls based on the provided limits"""
    
    def __init__(self):
        # Rate limits based on the provided OpenAI documentation
        self.limits = {
            'chat': {
                'gpt-4o': {'rpm': 500, 'tpm': 30000},
                'gpt-3.5-turbo': {'rpm': 3500, 'tpm': 90000}
            },
            'whisper': {'rpm': 50, 'tpm': 1000000},
            'vision': {'rpm': 500, 'tpm': 30000},  # Same as GPT-4o
            'dalle': {'rpm': 50, 'tpm': None},
            'embedding': {'rpm': 600, 'tpm': 1000000}
        }
        
        # Track usage per endpoint
        self.usage = {}
    
    def check_rate_limit(self, endpoint, model=None):
        """Check if request is within rate limits"""
        try:
            current_time = datetime.utcnow()
            
            # Get limits for endpoint
            if endpoint == 'chat' and model:
                limits = self.limits['chat'].get(model, self.limits['chat']['gpt-4o'])
            else:
                limits = self.limits.get(endpoint, {'rpm': 100, 'tpm': 10000})
            
            # Initialize endpoint tracking if not exists
            if endpoint not in self.usage:
                self.usage[endpoint] = {
                    'requests': [],
                    'tokens': [],
                    'window_start': current_time
                }
            
            usage_data = self.usage[endpoint]
            
            # Clean old entries (older than 1 minute)
            minute_ago = current_time - timedelta(minutes=1)
            usage_data['requests'] = [t for t in usage_data['requests'] if t > minute_ago]
            usage_data['tokens'] = [(t, count) for t, count in usage_data['tokens'] if t > minute_ago]
            
            # Check RPM limit
            if len(usage_data['requests']) >= limits['rpm']:
                logging.warning(f"RPM limit exceeded for {endpoint}: {len(usage_data['requests'])}/{limits['rpm']}")
                return False
            
            # Check TPM limit (if applicable)
            if limits.get('tpm'):
                total_tokens = sum(count for _, count in usage_data['tokens'])
                if total_tokens >= limits['tpm']:
                    logging.warning(f"TPM limit exceeded for {endpoint}: {total_tokens}/{limits['tpm']}")
                    return False
            
            return True
            
        except Exception as e:
            logging.error(f"Rate limit check error: {e}")
            return True  # Allow request if check fails
    
    def update_usage(self, endpoint, tokens_used=0):
        """Update usage statistics after making a request"""
        try:
            current_time = datetime.utcnow()
            
            # Initialize endpoint tracking if not exists
            if endpoint not in self.usage:
                self.usage[endpoint] = {
                    'requests': [],
                    'tokens': [],
                    'window_start': current_time
                }
            
            usage_data = self.usage[endpoint]
            
            # Record request
            usage_data['requests'].append(current_time)
            
            # Record tokens if applicable
            if tokens_used > 0:
                usage_data['tokens'].append((current_time, tokens_used))
            
        except Exception as e:
            logging.error(f"Usage update error: {e}")
    
    def get_usage_stats(self, endpoint):
        """Get current usage statistics for an endpoint"""
        try:
            current_time = datetime.utcnow()
            minute_ago = current_time - timedelta(minutes=1)
            
            # Initialize endpoint tracking if not exists
            if endpoint not in self.usage:
                self.usage[endpoint] = {
                    'requests': [],
                    'tokens': [],
                    'window_start': current_time
                }
            
            usage_data = self.usage[endpoint]
            
            # Count recent requests
            recent_requests = [t for t in usage_data['requests'] if t > minute_ago]
            recent_tokens = [(t, count) for t, count in usage_data['tokens'] if t > minute_ago]
            
            return {
                'requests_last_minute': len(recent_requests),
                'tokens_last_minute': sum(count for _, count in recent_tokens),
                'next_reset': minute_ago + timedelta(minutes=1)
            }
            
        except Exception as e:
            logging.error(f"Usage stats error: {e}")
            return {'requests_last_minute': 0, 'tokens_last_minute': 0}
    
    def get_wait_time(self, endpoint, model=None):
        """Get recommended wait time before next request"""
        try:
            if self.check_rate_limit(endpoint, model):
                return 0
            
            # Find oldest request in current window
            current_time = datetime.utcnow()
            
            # Initialize endpoint tracking if not exists
            if endpoint not in self.usage:
                self.usage[endpoint] = {
                    'requests': [],
                    'tokens': [],
                    'window_start': current_time
                }
            
            usage_data = self.usage[endpoint]
            
            if usage_data['requests']:
                oldest_request = min(usage_data['requests'])
                wait_time = 60 - (current_time - oldest_request).total_seconds()
                return max(0, wait_time)
            
            return 60  # Default wait time
            
        except Exception as e:
            logging.error(f"Wait time calculation error: {e}")
            return 5  # Conservative wait time
