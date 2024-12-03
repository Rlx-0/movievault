from django.db import models

class Genre(models.Model):
    id = models.IntegerField(primary_key=True)
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name

class Movie(models.Model):
    tmdb_id = models.IntegerField(unique=True)
    title = models.CharField(max_length=255)
    overview = models.TextField()
    poster_path = models.CharField(max_length=255, null=True)
    release_date = models.DateField(null=True)
    genres = models.ManyToManyField(Genre)
    vote_average = models.FloatField(default=0)
    
    def __str__(self):
        return self.title