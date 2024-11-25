"""
This module contains a rate limiting implementation.
"""

class RateLimiter:
    """Rate limiting implementation"""
    
    def __init__(self, redis_client):
        self.redis = redis_client
        self.default_limits = {
            'default': (100, 3600),  # 100 requests per hour
            'auth': (5, 300),        # 5 attempts per 5 minutes
            'api': (1000, 3600)      # 1000 requests per hour
        }
        
    def is_allowed(self, key: str, limit_type: str = 'default') -> bool:
        """Check if request is allowed based on rate limits"""
        max_requests, window = self.default_limits[limit_type]
        
        # Get current count
        current = self.redis.get(key)
        if not current:
            # First request
            self.redis.setex(key, window, 1)
            return True
            
        current = int(current)
        if current >= max_requests:
            return False
            
        # Increment counter
        self.redis.incr(key)
        return True