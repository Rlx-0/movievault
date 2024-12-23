from django.db import models

class Genre(models.Model):
    id = models.IntegerField(primary_key=True)
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name

class Movie(models.Model):
    id = models.IntegerField(primary_key=True)
    title = models.CharField(max_length=255)
    tmdb_id = models.IntegerField(unique=True)
    
    def __str__(self):
        return self.title