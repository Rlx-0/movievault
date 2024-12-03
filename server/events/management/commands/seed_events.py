from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from events.models import Event, MovieVote
from movies.models import Movie
from datetime import datetime, timedelta
import pytz
import random

User = get_user_model()

class Command(BaseCommand):
    help = 'Seeds the events database with initial data'

    def handle(self, *args, **kwargs):
        self.stdout.write('Seeding events database...')

        admin_user, _ = User.objects.get_or_create(
            username='admin',
            defaults={
                'email': 'admin@example.com',
                'is_superuser': True,
                'is_staff': True
            }
        )

        users = []
        sample_users = [
            {'username': 'user1', 'email': 'user1@example.com'},
            {'username': 'user2', 'email': 'user2@example.com'},
            {'username': 'user3', 'email': 'user3@example.com'},
        ]

        for user_data in sample_users:
            user, created = User.objects.get_or_create(
                username=user_data['username'],
                defaults={
                    'email': user_data['email']
                }
            )
            if created:
                user.set_password('testpass123')
                user.save()
            users.append(user)

        movies = list(Movie.objects.all()[:5])
        if not movies:
            self.stdout.write('No movies found. Please run seed_movies first.')
            return

        tz = pytz.UTC
        locations = [
            'Cinema City',
            'Home Theater',
            'Community Center',
            'Local Library',
            'Film Club'
        ]

        events_data = [
            {
                'title': 'Weekly Movie Night',
                'description': 'Join us for our weekly movie night featuring classic films',
                'date': datetime.now(tz) + timedelta(days=7),
                'location': random.choice(locations),
                'guests': [user.email for user in users],
                'host': admin_user,
                'movie_options': random.sample(movies, min(3, len(movies)))
            },
            {
                'title': 'Summer Movie Marathon',
                'description': 'Three movies back to back!',
                'date': datetime.now(tz) + timedelta(days=30),
                'location': random.choice(locations),
                'guests': [users[0].email, users[1].email],
                'host': admin_user,
                'movie_options': random.sample(movies, min(4, len(movies)))
            }
        ]

        for event_data in events_data:
            movie_options = event_data.pop('movie_options')
            event, created = Event.objects.get_or_create(
                title=event_data['title'],
                host=event_data['host'],
                defaults={
                    'description': event_data['description'],
                    'date': event_data['date'],
                    'location': event_data['location'],
                    'guests': event_data['guests']
                }
            )
            
            if created:
                self.stdout.write(f'Created event: {event.title}')
                event.movie_options.set(movie_options)

                for movie in movie_options:
                    for user in [admin_user] + users:
                        if user.email in event_data['guests'] or user == admin_user:
                            MovieVote.objects.create(
                                event=event,
                                movie=movie,
                                user=user,
                                vote=random.choice([True, False, None])
                            )

        self.stdout.write(self.style.SUCCESS('Successfully seeded events database'))