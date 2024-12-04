from django.apps import AppConfig
import os


class EventsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'server.events' if os.getenv('RENDER') else 'events'
