from django.db import models
from django.conf import settings
from django.utils import timezone
from movies.models import Movie

class Event(models.Model):
    host = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    title = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    date = models.DateTimeField()
    location = models.CharField(max_length=200)
    movie_options = models.JSONField(default=list)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title

    class Meta:
        ordering = ['-created_at']

class EventInvitation(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('declined', 'Declined')
    ]
    
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='invitations')
    email = models.EmailField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['event', 'email']

    def __str__(self):
        return f"{self.email} - {self.event.title}"

class MovieVote(models.Model):
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='movie_votes')
    movie = models.ForeignKey(Movie, on_delete=models.CASCADE)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    vote = models.BooleanField(default=None, null=True)
    
    class Meta:
        unique_together = ['event', 'movie', 'user']

    def __str__(self):
        return f"{self.user.email} - {self.movie} - {self.vote}"