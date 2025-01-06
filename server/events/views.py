from django.db.models import Q
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.core.mail import send_mail, EmailMultiAlternatives
from django.conf import settings
from django.utils import timezone
from django.core.signing import Signer
from django.http import HttpResponse
from django.shortcuts import redirect, render
from django.template.loader import render_to_string
from django.urls import reverse
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.db import models
import requests

from movies.models import Movie
from movies.serializers import MovieSerializer
from .models import Event, MovieVote, EventInvitation
from .serializers import EventSerializer, MovieVoteSerializer, EventInvitationSerializer

class EventViewSet(viewsets.ModelViewSet):
    queryset = Event.objects.all()
    serializer_class = EventSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_permissions(self):
        if self.action == 'preview_email':
            return []
        return [permission() for permission in self.permission_classes]

    def get_queryset(self):
        user = self.request.user
        base_query = Event.objects.all()
        
        if self.action == 'respond_to_invitation':
            return base_query
        
        if user.is_anonymous:
            return Event.objects.none()
        
        return base_query.filter(
            models.Q(host=user) |
            models.Q(invitations__email=user.email)
        ).prefetch_related('invitations').distinct()

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    @action(detail=True, methods=['POST'])
    def vote(self, request, pk=None):
        """Submit a vote for a movie in an event"""
        event = self.get_object()
        movie_id = request.data.get('movie_id')
        vote_value = request.data.get('vote')

        if movie_id is None or vote_value is None:
            return Response(
                {'error': 'movie_id and vote are required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if movie_id not in event.movie_options:
            return Response(
                {'error': 'Invalid movie ID for this event'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            movie = Movie.objects.get(tmdb_id=movie_id)
        except Movie.DoesNotExist:
            movie = Movie.objects.create(
                tmdb_id=movie_id,
                title=f'Movie {movie_id}',
                id=movie_id
            )

        vote, created = MovieVote.objects.update_or_create(
            event=event,
            movie=movie,
            user=request.user,
            defaults={'vote': vote_value}
        )

        return Response(MovieVoteSerializer(vote).data)

    @action(detail=True, methods=['post'])
    def invite_guests(self, request, pk=None):
        """Invite additional guests to an event"""
        event = self.get_object()
        emails = request.data.get('emails', [])

        if event.host != request.user:
            return Response(
                {'error': 'Only the host can invite guests'}, 
                status=status.HTTP_403_FORBIDDEN
            )

        for email in emails:
            invitation, created = EventInvitation.objects.get_or_create(
                event=event,
                email=email.lower(),
                defaults={'status': 'pending'}
            )
            
            if created:
                signer = Signer()
                token = signer.sign(f"{event.id}:{email.lower()}")
                
                context = {
                    'event': {
                        'title': event.title,
                        'date': event.date.strftime('%B %d, %Y at %I:%M %p'),
                        'location': event.location,
                        'description': event.description,
                    },
                    'recipient_name': email.split('@')[0],
                    'host_name': event.host.username,
                    'rsvp_yes_url': request.build_absolute_uri(
                        reverse('event-respond-to-invitation', kwargs={'pk': event.id}) + f'?token={token}&status=yes'
                    ),
                    'rsvp_no_url': request.build_absolute_uri(
                        reverse('event-respond-to-invitation', kwargs={'pk': event.id}) + f'?token={token}&status=no'
                    ),
                    'site_name': 'MovieVault',
                    'contact_email': settings.DEFAULT_FROM_EMAIL,
                }
                
                html_message = render_to_string('emails/event_invitation.html', context)
                plain_message = f"""
                You've been invited to {event.title} by {event.host.username}
                Date: {event.date}
                Location: {event.location}
                
                Please visit {context['rsvp_yes_url']} to accept
                or {context['rsvp_no_url']} to decline.
                """
                
                email_message = EmailMultiAlternatives(
                    subject=f'Invitation to {event.title}',
                    body=plain_message,
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    to=[email]
                )
                email_message.attach_alternative(html_message, "text/html")
                email_message.mixed_subtype = 'related'
                email_message.send(fail_silently=False)

        return Response({'status': 'Invitations sent'})

    @action(detail=True, methods=['GET'])
    def vote_results(self, request, pk=None):
        """
        Get voting results for an event
        """
        event = self.get_object()
        results = {}

        for tmdb_id in event.movie_options:
            try:
                movie = Movie.objects.get(tmdb_id=tmdb_id)
                upvotes = MovieVote.objects.filter(
                    event=event,
                    movie=movie,
                    vote=True
                ).count()
                downvotes = MovieVote.objects.filter(
                    event=event,
                    movie=movie,
                    vote=False
                ).count()

                results[tmdb_id] = {
                    'upvotes': upvotes,
                    'downvotes': downvotes
                }
            except Movie.DoesNotExist:
                results[tmdb_id] = {
                    'upvotes': 0,
                    'downvotes': 0
                }

        return Response(results)

    @method_decorator(csrf_exempt)
    @action(detail=True, methods=['get', 'post'], permission_classes=[AllowAny])
    def respond_to_invitation(self, request, pk=None):
        """Respond to an event invitation"""
        event = self.get_object()
        
        # Handle GET requests from email links
        if request.method == 'GET':
            token = request.GET.get('token')
            response_status = request.GET.get('status')
        else:
            # Handle POST requests from API
            token = request.data.get('token')
            response_status = request.data.get('status')

        if token:
            try:
                signer = Signer()
                decoded = signer.unsign(token)
                event_id, email = decoded.split(':')
                
                if int(event_id) != event.id:
                    return Response(
                        {'error': 'Invalid event'}, 
                        status=status.HTTP_400_BAD_REQUEST
                    )
                    
                invitation = EventInvitation.objects.filter(
                    event=event,
                    email=email
                ).first()
                
            except Exception:
                return Response(
                    {'error': 'Invalid or expired token'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
        else:
            invitation = EventInvitation.objects.filter(
                event=event,
                email=request.user.email
            ).first()
        if not invitation:
            return Response(
                {'error': 'No invitation found'}, 
                status=status.HTTP_404_NOT_FOUND
            )

        status_mapping = {
            'yes': 'accepted',
            'no': 'declined'
        }
        invitation.status = status_mapping.get(response_status, response_status)
        invitation.save()

        context = {
            'event': {
                'title': event.title,
                'date': event.date.strftime('%B %d, %Y at %I:%M %p'),
                'location': event.location,
                'description': event.description,
            },
            'recipient_name': invitation.email.split('@')[0],
            'status': invitation.status,
            'site_name': 'MovieVault',
            'contact_email': settings.DEFAULT_FROM_EMAIL,
            'site_url': settings.SITE_URL,
        }
        
        html_message = render_to_string('emails/event_confirmation.html', context)
        plain_message = f"You have {invitation.status} the invitation to {event.title}"
        
        email = EmailMultiAlternatives(
            subject=f'RSVP Confirmation for {event.title}',
            body=plain_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[invitation.email]
        )
        email.attach_alternative(html_message, "text/html")
        email.mixed_subtype = 'related'
        email.send(fail_silently=False)

        if request.method == 'GET':
            context = {
                'event': {
                    'title': event.title,
                    'date': event.date.strftime('%B %d, %Y at %I:%M %p'),
                    'location': event.location,
                    'description': event.description,
                },
                'status': invitation.status
            }
            return render(request, 'events/rsvp_response.html', context)

        return Response(EventInvitationSerializer(invitation).data)

    @action(detail=True, methods=['get'])
    def movie_suggestions(self, request, pk=None):
        """Get movie suggestions based on votes"""
        event = self.get_object()
        votes = MovieVote.objects.filter(event=event)
        
        movie_scores = {}
        for vote in votes:
            if vote.movie_id not in movie_scores:
                movie_scores[vote.movie_id] = 0
            movie_scores[vote.movie_id] += 1 if vote.vote else -1

        suggested_movies = []
        if movie_scores:
            top_movies = sorted(
                movie_scores.items(), 
                key=lambda x: x[1], 
                reverse=True
            )[:3]
            suggested_movies = Movie.objects.filter(
                id__in=[movie_id for movie_id, _ in top_movies]
            )

        return Response(MovieSerializer(suggested_movies, many=True).data)

    @action(detail=True, methods=['post'])
    def finalize_movie(self, request, pk=None):
        """Finalize the movie selection for an event"""
        event = self.get_object()
        movie_id = request.data.get('movie_id')

        if event.host != request.user:
            return Response(
                {'error': 'Only the host can finalize the movie'}, 
                status=status.HTTP_403_FORBIDDEN
            )

        if not event.movie_options.filter(id=movie_id).exists():
            return Response(
                {'error': 'Selected movie is not in event options'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        event.selected_movie_id = movie_id
        event.save()

        invitations = EventInvitation.objects.filter(event=event)
        for invitation in invitations:
            send_mail(
                f'Movie Selected for {event.title}',
                f'The movie has been selected for {event.title}!',
                settings.DEFAULT_FROM_EMAIL,
                [invitation.email],
                fail_silently=True,
            )

        return Response({'status': 'Movie selection finalized'})

    @action(detail=False, methods=['get'])
    def preview_email(self, request):
        """Preview email templates"""
        template_name = request.GET.get('template', 'event_invitation')
        
        context = {
            'event': {
                'title': 'Sample Movie Night',
                'date': 'September 15, 2024 at 7:00 PM',
                'location': '123 Movie Street',
                'description': 'Join us for a fun movie night with snacks and drinks!',
            },
            'recipient_name': 'John',
            'host_name': 'Sarah',
            'status': request.GET.get('status', 'accepted'),
            'site_name': 'MovieVault',
            'contact_email': settings.DEFAULT_FROM_EMAIL,
            'rsvp_yes_url': '#',
            'rsvp_no_url': '#',
        }
        
        template = f'emails/{template_name}.html'
        return render(request, template, context)
