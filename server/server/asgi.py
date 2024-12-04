"""
ASGI config for server project.
"""
import os
import sys
from pathlib import Path
from django.core.asgi import get_asgi_application

# Add the server directory to Python path
server_dir = Path(__file__).resolve().parent.parent
sys.path.append(str(server_dir))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'server.settings')

application = get_asgi_application()
