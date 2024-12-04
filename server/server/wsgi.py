"""
WSGI config for server project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.1/howto/deployment/wsgi/
"""

import os
import sys
from pathlib import Path

print("Python path:", sys.path)

project_base_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(project_base_dir))
sys.path.insert(0, str(project_base_dir.parent))

print("Project directory:", project_base_dir)
print("Updated Python path:", sys.path)

from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'server.settings')

application = get_wsgi_application()
