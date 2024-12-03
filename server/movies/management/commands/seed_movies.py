from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from events.models import Event
from movies.models import Movie, Genre
import requests
import os
from datetime import datetime, timedelta
import pytz

User = get_user_model()

class Command(BaseCommand):
    help = 'Seeds the movies database with initial data'

    def handle(self, *args, **kwargs):
        self.stdout.write('Seeding movies database...')
        
        # Create superuser
        admin_user, created = User.objects.get_or_create(
            username='admin',
            defaults={
                'email': 'admin@example.com',
                'is_superuser': True,
                'is_staff': True
            }
        )
        if created:
            admin_user.set_password('admin123')
            admin_user.save()
            self.stdout.write(self.style.SUCCESS('Superuser created'))

        # Fetch genres from TMDb API
        TMDB_API_KEY = os.getenv('TMDB_API_KEY')
        genres_url = f'https://api.themoviedb.org/3/genre/movie/list'
        headers = {
            'Authorization': f'Bearer {TMDB_API_KEY}',
            'Content-Type': 'application/json;charset=utf-8'
        }

        response = requests.get(genres_url, headers=headers)
        if response.status_code == 200:
            genres_data = response.json()['genres']
            for genre in genres_data:
                Genre.objects.get_or_create(
                    id=genre['id'],
                    name=genre['name']
                )
            self.stdout.write(self.style.SUCCESS('Genres seeded'))

        # Create mock movies
        mock_movies = [
            {
                'tmdb_id': 550,
                'title': 'Fight Club',
                'overview': 'An insomniac office worker and a devil-may-care soapmaker form an underground fight club.',
                'poster_path': '/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg',
                'release_date': '1999-10-15',
                'vote_average': 8.4,
                'genre_ids': [18, 53, 35]  # Drama, Thriller, Comedy
            },
            {
                'tmdb_id': 278,
                'title': 'The Shawshank Redemption',
                'overview': 'Two imprisoned men bond over a number of years, finding solace and eventual redemption.',
                'poster_path': '/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg',
                'release_date': '1994-09-23',
                'vote_average': 8.7,
                'genre_ids': [18, 80]  # Drama, Crime
            },
            {
                'tmdb_id': 238,
                'title': 'The Godfather',
                'overview': 'The aging patriarch of an organized crime dynasty transfers control to his son.',
                'poster_path': '/3bhkrj58Vtu7enYsRolD1fZdja1.jpg',
                'release_date': '1972-03-14',
                'vote_average': 8.7,
                'genre_ids': [18, 80]  # Drama, Crime
            },
            {
                'tmdb_id': 424,
                'title': 'Schindler\'s List',
                'overview': 'In German-occupied Poland during World War II, industrialist Oskar Schindler gradually becomes concerned for his Jewish workforce.',
                'poster_path': '/sF1U4EUQS8YHUYjNl3pMGNIQyr0.jpg',
                'release_date': '1993-12-15',
                'vote_average': 8.6,
                'genre_ids': [18, 36, 10752]  # Drama, History, War
            },
            {
                'tmdb_id': 129,
                'title': 'Spirited Away',
                'overview': 'During her family\'s move to the suburbs, a sullen 10-year-old girl wanders into a world ruled by gods, witches, and spirits.',
                'poster_path': '/39wmItIWsg5sZMyRUHLkWBcuVCM.jpg',
                'release_date': '2001-07-20',
                'vote_average': 8.5,
                'genre_ids': [16, 10751, 14]  # Animation, Family, Fantasy
            }
        ]

        # Create movies in database
        for movie_data in mock_movies:
            movie, created = Movie.objects.get_or_create(
                tmdb_id=movie_data['tmdb_id'],
                defaults={
                    'title': movie_data['title'],
                    'overview': movie_data['overview'],
                    'poster_path': movie_data['poster_path'],
                    'release_date': datetime.strptime(movie_data['release_date'], '%Y-%m-%d').date(),
                    'vote_average': movie_data['vote_average']
                }
            )
            if created:
                # Add genres
                genres = Genre.objects.filter(id__in=movie_data['genre_ids'])
                movie.genres.set(genres)
                self.stdout.write(f'Created movie: {movie.title}')

        self.stdout.write(self.style.SUCCESS('Movies seeded'))