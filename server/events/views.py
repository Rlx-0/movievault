from django.db.models import Q
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.core.mail import send_mail
from django.conf import settings
from django.utils import timezone

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
            Q(invitations__email=self.request.user.email)
        )

    def perform_create(self, serializer):
        try:
            print("Creating event with data:", serializer.validated_data)
            serializer.context['request'] = self.request
            event = serializer.save()
            print("Event created:", event)
            return event
        except Exception as e:
            print(f"Error creating event: {str(e)}")
            raise

    @action(detail=True, methods=['post'])
    def vote(self, request, pk=None):
        """Submit a vote for a movie in an event"""
        event = self.get_object()
        movie_id = request.data.get('movie_id')
        vote_value = request.data.get('vote')

        if not event.movie_options.filter(id=movie_id).exists():
            return Response(
                {'error': 'Invalid movie ID for this event'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        movie_vote, created = MovieVote.objects.get_or_create(
            event=event,
            movie_id=movie_id,
            user=request.user,
            defaults={'vote': vote_value}
        )

        if not created:
            movie_vote.vote = vote_value
            movie_vote.save()

        return Response(MovieVoteSerializer(movie_vote).data)

    @action(detail=True, methods=['get'])
    def vote_results(self, request, pk=None):
        """Get voting results for an event"""
        event = self.get_object()
        votes = MovieVote.objects.filter(event=event)
        
        results = {}
        for vote in votes:
            if vote.movie_id not in results:
                results[vote.movie_id] = {'upvotes': 0, 'downvotes': 0}
            if vote.vote:
                results[vote.movie_id]['upvotes'] += 1
            else:
                results[vote.movie_id]['downvotes'] += 1

        return Response(results)

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
                send_mail(
                    f'Invitation to {event.title}',
                    f'You have been invited to {event.title}. Please RSVP.',
                    settings.DEFAULT_FROM_EMAIL,
                    [email],
                    fail_silently=True,
                )

        return Response({'status': 'Invitations sent'})

    @action(detail=True, methods=['post'])
    def respond_to_invitation(self, request, pk=None):
        """Respond to an event invitation"""
        event = self.get_object()
        status = request.data.get('status')

        invitation = EventInvitation.objects.filter(
            event=event,
            email=request.user.email
        ).first()

        if not invitation:
            return Response(
                {'error': 'No invitation found'}, 
                status=status.HTTP_404_NOT_FOUND
            )

        invitation.status = status
        invitation.save()

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