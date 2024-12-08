from django.core.management.base import BaseCommand
from movies.models import Movie, Genre
import requests
import os
from datetime import datetime

class Command(BaseCommand):
    help = 'Seed movies from TMDB API'

    def get_tmdb_url(self, endpoint):
        return f'https://api.themoviedb.org/3/{endpoint}'
    
    def get_tmdb_params(self, additional_params=None):
        params = {'api_key': os.getenv('TMDB_API_KEY')}
        if additional_params:
            params.update(additional_params)
        return params

    def fetch_and_store_movies(self, endpoint):
        try:
            response = requests.get(
                self.get_tmdb_url(endpoint),
                params=self.get_tmdb_params({'page': 1})  # You can add more pages if needed
            )
            response.raise_for_status()
            
            movies_data = response.json()['results']
            for movie_data in movies_data:
                movie, created = Movie.objects.get_or_create(
                    tmdb_id=movie_data['id'],
                    defaults={
                        'title': movie_data['title'],
                        'overview': movie_data['overview'],
                        'poster_path': movie_data['poster_path'],
                        'release_date': movie_data.get('release_date'),
                        'vote_average': movie_data['vote_average']
                    }
                )
                
                if created and movie_data.get('genre_ids'):
                    for genre_id in movie_data['genre_ids']:
                        genre = Genre.objects.filter(id=genre_id).first()
                        if genre:
                            movie.genres.add(genre)
                    self.stdout.write(f'Created movie: {movie.title}')

        except requests.exceptions.RequestException as e:
            self.stdout.write(self.style.ERROR(f'Error fetching movies: {str(e)}'))

    def handle(self, *args, **kwargs):
        # Fetch from multiple endpoints
        endpoints = [
            'movie/popular',
            'movie/top_rated',
            'movie/now_playing',
            'movie/upcoming'
        ]
        
        for endpoint in endpoints:
            self.stdout.write(f'Fetching {endpoint}...')
            self.fetch_and_store_movies(endpoint)
            
        self.stdout.write(self.style.SUCCESS('Successfully seeded movies'))