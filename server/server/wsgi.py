"""
WSGI config for server project.
"""

import os
import sys
from pathlib import Path
from django.core.wsgi import get_wsgi_application

server_dir = Path(__file__).resolve().parent.parent
project_root = server_dir.parent
sys.path.append(str(project_root))
sys.path.append(str(server_dir))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'server.settings')

application = get_wsgi_application()
