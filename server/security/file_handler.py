"""
This module contains a secure file upload and download handling class.
"""

import magic

class SecureFileHandler:
    """Secure file upload and download handling"""
    
    def __init__(self):
        self.allowed_extensions = {'pdf', 'doc', 'docx', 'txt'}
        self.max_file_size = 10 * 1024 * 1024  # 10MB
        
    def validate_file(self, file) -> tuple[bool, str]:
        """Validate uploaded file"""
        # Check file size
        if file.size > self.max_file_size:
            return False, "File too large"
            
        # Check file extension
        ext = file.filename.rsplit('.', 1)[1].lower()
        if ext not in self.allowed_extensions:
            return False, "File type not allowed"
            
        # Check file content type
        if not self._verify_mime_type(file):
            return False, "Invalid file content"
            
        return True, "File is valid"
        
    def _verify_mime_type(self, file) -> bool:
        """Verify file MIME type matches extension"""
        mime = magic.from_buffer(file.read(1024), mime=True)
        file.seek(0)  # Reset file pointer
        
        # Map of allowed MIME types
        mime_types = {
            'pdf': 'application/pdf',
            'doc': 'application/msword',
            'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'txt': 'text/plain'
        }
        
        ext = file.filename.rsplit('.', 1)[1].lower()
        return mime == mime_types.get(ext)