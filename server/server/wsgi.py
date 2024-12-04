"""
WSGI config for server project.
"""

import os
import sys
from pathlib import Path

project_root = Path(__file__).resolve().parent.parent.parent
server_dir = project_root / 'server'

sys.path.insert(0, str(project_root))
sys.path.insert(0, str(server_dir))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'server.settings')

from django.core.wsgi import get_wsgi_application
application = get_wsgi_application()
