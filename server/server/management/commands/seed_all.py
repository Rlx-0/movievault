from django.core.management.base import BaseCommand
from django.core.management import call_command

class Command(BaseCommand):
    help = 'Runs all seeders'

    def handle(self, *args, **kwargs):
        self.stdout.write('Running all seeders...')
        
        # Run movies seeder (includes genres)
        self.stdout.write('Seeding movies and genres...')
        call_command('seed_movies')  # Updated command name
        
        # Run events seeder
        self.stdout.write('Seeding events...')
        call_command('seed_events')
        
        self.stdout.write(self.style.SUCCESS('All seeders completed successfully'))