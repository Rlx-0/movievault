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
from django.shortcuts import redirect
from django.template.loader import render_to_string
from django.urls import reverse
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator

from movies.models import Movie
from movies.serializers import MovieSerializer
from .models import Event, MovieVote, EventInvitation
from .serializers import EventSerializer, MovieVoteSerializer, EventInvitationSerializer

class EventViewSet(viewsets.ModelViewSet):
    queryset = Event.objects.all()
    serializer_class = EventSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.action == 'respond_to_invitation':
            return Event.objects.all()
        
        return Event.objects.filter(
            Q(host=self.request.user) |
            Q(invitations__email=self.request.user.email)
        )

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

        # Validate that the movie is in the event's options
        if movie_id not in event.movie_options:
            return Response(
                {'error': 'Invalid movie ID for this event'},
                status=status.HTTP_400_BAD_REQUEST
            )

        movie, _ = Movie.objects.get_or_create(
            id=movie_id,
            defaults={
                'title': 'Temporary Title',
                'tmdb_id': movie_id
            }
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
                    'site_name': 'Movie Night',
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

        for movie_id in event.movie_options:
            upvotes = MovieVote.objects.filter(
                event=event,
                movie_id=movie_id,
                vote=True
            ).count()
            downvotes = MovieVote.objects.filter(
                event=event,
                movie_id=movie_id,
                vote=False
            ).count()

            results[movie_id] = {
                'upvotes': upvotes,
                'downvotes': downvotes
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

        # Map RSVP response to invitation status
        status_mapping = {
            'yes': 'accepted',
            'no': 'declined'
        }
        invitation.status = status_mapping.get(response_status, response_status)
        invitation.save()

        # Send confirmation email
        context = {
            'event': {
                'title': event.title,
                'date': event.date.strftime('%B %d, %Y at %I:%M %p'),
                'location': event.location,
                'description': event.description,
            },
            'recipient_name': invitation.email.split('@')[0],
            'host_name': event.host.username,
        }
        
        html_message = render_to_string('emails/event_invitation.html', context)
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

        # For GET requests, return a user-friendly HTML response
        if request.method == 'GET':
            return HttpResponse(
                f"Thank you for your response! You have {invitation.status} "
                f"the invitation to {event.title}."
            )
        
        # For API requests, return JSON
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
