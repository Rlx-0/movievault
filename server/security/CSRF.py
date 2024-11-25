"""
This module contains a CSRF protection middleware.
"""

import re
import secrets
import hmac

class CSRFMiddleware:
    """Enhanced CSRF protection middleware"""
    
    def __init__(self, get_response):
        self.get_response = get_response
        self.exempt_urls = [
            r'^/api/public/',  # Public API endpoints
            r'^/webhooks/',    # Webhook endpoints
        ]
        
    def _is_exempt(self, path):
        """Check if the path is exempt from CSRF protection"""
        return any(re.match(pattern, path) for pattern in self.exempt_urls)
        
    def __call__(self, request):
        if not self._is_exempt(request.path):
            # Generate token if not present
            if not request.COOKIES.get('csrftoken'):
                request.COOKIES['csrftoken'] = self._generate_token()
                
            # Verify token for unsafe methods
            if request.method not in ('GET', 'HEAD', 'OPTIONS', 'TRACE'):
                self._verify_csrf_token(request)
                
        response = self.get_response(request)
        return response
        
    def _generate_token(self):
        """Generate a secure CSRF token"""
        return secrets.token_urlsafe(32)
        
    def _verify_csrf_token(self, request):
        """Verify the CSRF token from request"""
        cookie_token = request.COOKIES.get('csrftoken')
        header_token = request.headers.get('X-CSRF-Token')
        
        if not cookie_token or not header_token:
            raise PermissionDenied('CSRF token missing')
            
        if not hmac.compare_digest(cookie_token, header_token):
            raise PermissionDenied('CSRF token invalid')