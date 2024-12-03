from django.db.models import Q
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.core.mail import send_mail
from django.conf import settings

from movies.models import Movie
from movies.serializers import MovieSerializer
from .models import Event, MovieVote, EventInvitation
from .serializers import EventSerializer, MovieVoteSerializer, EventInvitationSerializer

class EventViewSet(viewsets.ModelViewSet):
    queryset = Event.objects.all()
    serializer_class = EventSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Event.objects.filter(
            Q(host=self.request.user) |
            Q(guests__contains=[self.request.user.email])
        )

    def perform_create(self, serializer):
        serializer.save(host=self.request.user)

    @action(detail=True, methods=['post'])
    def vote(self, request, pk=None):
        """
        Submit a vote for a movie in an event
        POST /api/events/{event_id}/vote/
        """
        event = self.get_object()
        movie_id = request.data.get('movie_id')
        vote_value = request.data.get('vote')

        user_email = request.user.email
        if not (request.user == event.host or user_email in event.guests):
            return Response(
                {'error': 'Only event host and guests can vote'}, 
                status=status.HTTP_403_FORBIDDEN
            )

        if not event.movie_options.filter(id=movie_id).exists():
            return Response(
                {'error': 'Movie is not in event options'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        vote, created = MovieVote.objects.update_or_create(
            event=event,
            movie_id=movie_id,
            user=request.user,
            defaults={'vote': vote_value}
        )

        return Response(MovieVoteSerializer(vote).data)

    @action(detail=True, methods=['get'])
    def vote_results(self, request, pk=None):
        """
        Get voting results for an event
        GET /api/events/{event_id}/vote_results/
        """
        event = self.get_object()
        results = {}
        
        for movie in event.movie_options.all():
            votes = MovieVote.objects.filter(event=event, movie=movie)
            results[movie.id] = {
                'movie_title': movie.title,
                'yes_votes': votes.filter(vote=True).count(),
                'no_votes': votes.filter(vote=False).count(),
                'pending_votes': votes.filter(vote=None).count(),
                'total_votes': votes.count()
            }
        
        return Response(results)

    @action(detail=True, methods=['post'])
    def invite_guests(self, request, pk=None):
        """
        Invite new guests to the event
        POST /api/events/{event_id}/invite_guests/
        """
        event = self.get_object()
        if event.host != request.user:
            return Response(
                {'error': 'Only the host can invite guests'}, 
                status=status.HTTP_403_FORBIDDEN
            )

        emails = request.data.get('emails', [])
        invitations = []

        for email in emails:
            invitation, created = EventInvitation.objects.get_or_create(
                event=event,
                email=email,
                defaults={'status': 'pending'}
            )
            if created:
                send_mail(
                    f'Invitation to {event.title}',
                    f'You have been invited to {event.title}. Please RSVP.',
                    settings.DEFAULT_FROM_EMAIL,
                    [email],
                    fail_silently=True,
                )
            invitations.append(invitation)

        return Response(EventInvitationSerializer(invitations, many=True).data)

    @action(detail=True, methods=['post'])
    def respond_to_invitation(self, request, pk=None):
        """
        Respond to an event invitation
        POST /api/events/{event_id}/respond_to_invitation/
        """
        event = self.get_object()
        status = request.data.get('status')
        
        if status not in ['accepted', 'declined']:
            return Response(
                {'error': 'Invalid status. Must be "accepted" or "declined".'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        invitation = EventInvitation.objects.filter(
            event=event,
            email=request.user.email
        ).first()

        if not invitation:
            return Response(
                {'error': 'No invitation found for this user'}, 
                status=status.HTTP_404_NOT_FOUND
            )

        invitation.status = status
        invitation.save()

        if status == 'accepted' and request.user.email not in event.guests:
            event.guests = event.guests + [request.user.email]
            event.save()

        return Response(EventInvitationSerializer(invitation).data)

    @action(detail=True, methods=['get'])
    def movie_suggestions(self, request, pk=None):
        """
        Get personalized movie suggestions for the event
        GET /api/events/{event_id}/movie_suggestions/
        """
        event = self.get_object()
        current_genres = set()
        for movie in event.movie_options.all():
            current_genres.update(movie.genres.all())

        suggested_movies = Movie.objects.filter(
            genres__in=current_genres
        ).exclude(
            id__in=event.movie_options.all()
        ).distinct()[:5]

        return Response(MovieSerializer(suggested_movies, many=True).data)

    @action(detail=True, methods=['get'])
    def event_summary(self, request, pk=None):
        """
        Get a summary of the event including voting results and attendance
        GET /api/events/{event_id}/event_summary/
        """
        event = self.get_object()
        
        voting_results = {}
        for movie in event.movie_options.all():
            votes = MovieVote.objects.filter(event=event, movie=movie)
            voting_results[movie.title] = {
                'yes_votes': votes.filter(vote=True).count(),
                'no_votes': votes.filter(vote=False).count(),
                'pending_votes': votes.filter(vote=None).count()
            }

        invitations = EventInvitation.objects.filter(event=event)
        attendance = {
            'accepted': invitations.filter(status='accepted').count(),
            'declined': invitations.filter(status='declined').count(),
            'pending': invitations.filter(status='pending').count(),
            'total_invited': invitations.count()
        }

        winning_movie = max(
            voting_results.items(), 
            key=lambda x: x[1]['yes_votes']
        )[0] if voting_results else None

        return Response({
            'event_details': EventSerializer(event).data,
            'voting_results': voting_results,
            'attendance': attendance,
            'winning_movie': winning_movie
        })

    @action(detail=True, methods=['post'])
    def finalize_movie(self, request, pk=None):
        """
        Finalize the movie selection for the event
        POST /api/events/{event_id}/finalize_movie/
        """
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

        for email in event.guests:
            send_mail(
                f'Movie Selected for {event.title}',
                f'The movie has been selected for {event.title}!',
                settings.DEFAULT_FROM_EMAIL,
                [email],
                fail_silently=True,
            )

        return Response({'status': 'Movie selection finalized'})

# POST /events/: Create a new event (only accessible to authenticated users).
# GET /events/: List all events created by the current authenticated user.
# GET /events/<id>/: Retrieve details of a specific event.
# PUT /events/<id>/: Update an event (restricted to the host).
# DELETE /events/<id>/: Delete an event (restricted to the host).