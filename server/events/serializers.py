from rest_framework import serializers
from .models import Event, MovieVote, EventInvitation
from django.utils import timezone
from datetime import datetime
from django.core.validators import EmailValidator
from django.core.mail import send_mail
from django.conf import settings
from django.contrib.auth.models import User
from django.urls import reverse
from django.template.loader import render_to_string
from django.core.mail import EmailMultiAlternatives
from django.core.signing import Signer

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
            invitation = EventInvitation.objects.create(
                event=event,
                email=email.lower(),
                status='pending'
            )
            
            # Create signed token for RSVP
            signer = Signer()
            token = signer.sign(f"{event.id}:{email.lower()}")
            
            # Prepare context for email template
            context = {
                'event': {
                    'title': event.title,
                    'date': event.date.strftime('%B %d, %Y at %I:%M %p'),
                    'location': event.location,
                    'description': event.description,
                },
                'recipient_name': email.split('@')[0],
                'host_name': request.user.username,
                'rsvp_yes_url': request.build_absolute_uri(
                    reverse('event-respond-to-invitation', kwargs={'pk': event.id}) + f'?token={token}&status=yes'
                ),
                'rsvp_no_url': request.build_absolute_uri(
                    reverse('event-respond-to-invitation', kwargs={'pk': event.id}) + f'?token={token}&status=no'
                ),
                'site_name': 'Movie Night',
                'contact_email': settings.DEFAULT_FROM_EMAIL,
            }
            
            # Render email template
            html_message = render_to_string('emails/event_invitation.html', context)
            plain_message = f"""
            You've been invited to {event.title} by {request.user.username}
            Date: {event.date}
            Location: {event.location}
            
            Please visit {context['rsvp_yes_url']} to accept
            or {context['rsvp_no_url']} to decline.
            """
            
            email_message = EmailMultiAlternatives(
                subject=f'Invitation to {event.title}',
                body=plain_message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                to=[email],
            )
            email_message.attach_alternative(html_message, "text/html")
            email_message.mixed_subtype = 'related'
            email_message.send(fail_silently=False)
        
        return event