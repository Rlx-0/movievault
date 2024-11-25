"""
This module contains a centralized input validation and sanitization class.
"""

import re
import html

class InputValidator:
    """Centralized input validation for all user-supplied data"""
    
    def __init__(self):
        # Common patterns for validation
        self.patterns = {
            'username': r'^[a-zA-Z0-9_]{3,32}$',
            'email': r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$',
            'url': r'^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)$'
        }
        
    def sanitize_input(self, value: str, max_length: int = 255) -> str:
        """Basic sanitization for string inputs"""
        if not isinstance(value, str):
            raise ValueError("Input must be a string")
            
        # Trim whitespace
        value = value.strip()
        
        # Limit length
        if len(value) > max_length:
            value = value[:max_length]
            
        # Replace potentially dangerous characters
        value = html.escape(value)
        
        return value
        
    def validate_pattern(self, value: str, pattern_name: str) -> bool:
        """Validate input against predefined patterns"""
        if pattern_name not in self.patterns:
            raise ValueError(f"Unknown pattern: {pattern_name}")
            
        return bool(re.match(self.patterns[pattern_name], value))