from rest_framework import serializers
from .models import Event, MovieVote, EventInvitation
from movies.serializers import MovieSerializer

class MovieVoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = MovieVote
        fields = ['movie', 'user', 'vote']

class EventSerializer(serializers.ModelSerializer):
    movie_votes = MovieVoteSerializer(many=True, read_only=True)
    movie_options = MovieSerializer(many=True, read_only=True)

    class Meta:
        model = Event
        fields = ['id', 'title', 'description', 'date', 'location', 
                 'guests', 'host', 'movie_options', 'movie_votes']
        read_only_fields = ['host']

class EventInvitationSerializer(serializers.ModelSerializer):
    class Meta:
        model = EventInvitation
        fields = ['id', 'event', 'email', 'status', 'created_at']
