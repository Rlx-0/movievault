from django.core.management.base import BaseCommand
import requests
import os
from movies.models import Genre

class Command(BaseCommand):
    help = 'Fetch movie genres from TMDB API'

    def handle(self, *args, **kwargs):
        try:
            response = requests.get(
                'https://api.themoviedb.org/3/genre/movie/list',
                params={'api_key': os.getenv('TMDB_API_KEY')}
            )
            response.raise_for_status()
            
            genres = response.json()['genres']
            for genre_data in genres:
                Genre.objects.get_or_create(
                    id=genre_data['id'],
                    defaults={'name': genre_data['name']}
                )
            
            self.stdout.write(self.style.SUCCESS('Successfully fetched genres'))
            
        except requests.exceptions.RequestException as e:
            self.stdout.write(self.style.ERROR(f'Error fetching genres: {str(e)}'))
