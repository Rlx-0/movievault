"""
This module contains utilities for XSS protection.
"""

from bs4 import BeautifulSoup
from urllib.parse import urlparse

class XSSProtection:
    """XSS protection utilities"""
    
    def __init__(self):
        self.allowed_tags = {
            'p': ['class'],
            'a': ['href', 'title'],
            'b': [],
            'i': [],
            'br': [],
        }
        
    def clean_html(self, content: str) -> str:
        """Clean HTML content to prevent XSS"""
        # Use an HTML parser to sanitize content
        soup = BeautifulSoup(content, 'html.parser')
        
        # Remove all script tags and their contents
        for script in soup.find_all('script'):
            script.decompose()
            
        # Remove all style tags and their contents
        for style in soup.find_all('style'):
            style.decompose()
            
        # Remove all on* attributes
        for tag in soup.find_all(True):
            for attr in list(tag.attrs):
                if attr.startswith('on'):
                    del tag[attr]
                    
        return str(soup)
        
    def sanitize_url(self, url: str) -> str:
        """Sanitize URLs to prevent javascript: and data: URLs"""
        parsed = urlparse(url)
        if parsed.scheme in ('http', 'https', 'mailto'):
            return url
        return '#'