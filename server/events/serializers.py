from rest_framework import serializers
from .models import Event, MovieVote, EventInvitation
from django.utils import timezone
from datetime import datetime
from django.core.validators import EmailValidator

class MovieVoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = MovieVote
        fields = ['id', 'event', 'movie', 'user', 'vote']

class EventInvitationSerializer(serializers.ModelSerializer):
    class Meta:
        model = EventInvitation
        fields = ['id', 'event', 'email', 'status', 'created_at']
        read_only_fields = ['created_at']

class EventSerializer(serializers.ModelSerializer):
    movie_votes = MovieVoteSerializer(many=True, read_only=True)
    movie_options = serializers.ListField(
        child=serializers.IntegerField(),
        required=True,
        min_length=1,
        max_length=5
    )
    guests = serializers.ListField(
        child=serializers.EmailField(),
        write_only=True,
        required=True
    )
    title = serializers.CharField(max_length=100, required=True)
    description = serializers.CharField(max_length=1000, required=False, allow_blank=True)
    date = serializers.DateTimeField(required=True)

    class Meta:
        model = Event
        fields = ['id', 'title', 'description', 'date', 'location', 
                 'guests', 'host', 'movie_options', 'movie_votes']
        read_only_fields = ['host']

    def validate(self, data):
        request = self.context.get('request')
        if request and request.data:
            date = request.data.get('date')
            time = request.data.get('time')
            if date and time:
                try:
                    data['date'] = datetime.strptime(f"{date}T{time}", "%Y-%m-%dT%H:%M")
                except ValueError:
                    raise serializers.ValidationError({"date": "Invalid date/time format"})

        if data.get('date') and data['date'] < timezone.now():
            raise serializers.ValidationError({"date": "Event date must be in the future"})

        if data.get('host') and data.get('guests'):
            if data['host'].email in data['guests']:
                raise serializers.ValidationError(
                    {"guests": "Host cannot be included in the guest list"}
                )
        
        return data

    def validate_movie_options(self, value):
        if not isinstance(value, list):
            raise serializers.ValidationError("Movie options must be a list")
        
        if len(value) < 1:
            raise serializers.ValidationError("Must select at least one movie")
        if len(value) > 5:
            raise serializers.ValidationError("Cannot select more than 5 movies")

        try:
            return [int(movie_id) for movie_id in value]
        except (ValueError, TypeError):
            raise serializers.ValidationError("All movie IDs must be integers")

    def validate_guests(self, value):
        if len(value) < 1:
            raise serializers.ValidationError("Must invite at least one guest")

        seen = set()
        unique_guests = []
        for email in value:
            if email.lower() not in seen:
                seen.add(email.lower())
                unique_guests.append(email)
        
        return unique_guests

    def create(self, validated_data):
        guests = validated_data.pop('guests', [])
        
        request = self.context.get('request')
        if not request or not request.user:
            raise serializers.ValidationError("Authentication required")
        
        validated_data['host'] = request.user
        
        event = Event.objects.create(**validated_data)
        
        for email in guests:
            EventInvitation.objects.create(
                event=event,
                email=email.lower(),
                status='pending'
            )
        
        return event