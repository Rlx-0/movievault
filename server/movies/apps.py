from django.apps import AppConfig
import os


class MoviesConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'server.movies' if os.getenv('RENDER') else 'movies'
