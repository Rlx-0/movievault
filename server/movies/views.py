from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import Movie, Genre
from .serializers import MovieSerializer
import requests
import os
import logging
from django.conf import settings

logger = logging.getLogger(__name__)

class MovieViewSet(viewsets.ModelViewSet):
    queryset = Movie.objects.all()
    serializer_class = MovieSerializer
    permission_classes = [AllowAny]
    
    def get_permissions(self):
        """
        Instantiates and returns the list of permissions that this view requires.
        """
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [IsAuthenticated]
        else:
            permission_classes = [AllowAny]
        return [permission() for permission in permission_classes]
    
    def get_tmdb_url(self, endpoint):
        return f'https://api.themoviedb.org/3/{endpoint}'
    
    def get_tmdb_params(self, additional_params=None):
        params = {'api_key': os.getenv('TMDB_API_KEY')}
        if additional_params:
            params.update(additional_params)
        return params

    @action(detail=False, methods=['get'])
    def popular(self, request):
        try:
            response = requests.get(
                self.get_tmdb_url('movie/popular'),
                params=self.get_tmdb_params()
            )
            response.raise_for_status()

            return Response({
                'page': 1,
                'results': response.json()['results'],
                'total_pages': 1,
                'total_results': len(response.json()['results'])
            })
            
        except requests.exceptions.RequestException as e:
            return Response(
                {'error': f'TMDB API error: {str(e)}'},
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )

    @action(detail=False, methods=['get'])
    def search(self, request):
        query = request.query_params.get('query', '')
        if not query:
            return Response(
                {'error': 'Query parameter is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            response = requests.get(
                self.get_tmdb_url('search/movie'),
                params=self.get_tmdb_params({
                    'query': query,
                    'language': 'en-US',
                    'page': 1,
                    'include_adult': False
                }),
                timeout=10
            )
            response.raise_for_status()
            return Response(response.json())
        except requests.RequestException as e:
            logger.error(f"TMDB API error: {str(e)}")
            return Response(
                {'error': 'Failed to fetch movies from TMDB'},
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )

    @action(detail=True, methods=['get'])
    def details(self, request, pk=None):
        """Fetch detailed movie information from TMDB"""
        movie = self.get_object()
        try:
            response = requests.get(
                self.get_tmdb_url(f'movie/{movie.tmdb_id}'),
                params=self.get_tmdb_params()
            )
            response.raise_for_status()

            movie_data = response.json()
            movie.overview = movie_data.get('overview', movie.overview)
            movie.vote_average = movie_data.get('vote_average', movie.vote_average)
            movie.save()
            
            return Response(movie_data)
            
        except requests.exceptions.RequestException as e:
            return Response(
                {'error': f'TMDB API error: {str(e)}'},
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )

    @action(detail=False, methods=['get'])
    def upcoming(self, request):
        """Fetch upcoming movies from TMDB"""
        try:
            response = requests.get(
                self.get_tmdb_url('movie/upcoming'),
                params=self.get_tmdb_params()
            )
            response.raise_for_status()
            
            movies_data = response.json()['results']
            stored_movies = []
            
            for movie_data in movies_data:
                movie, created = Movie.objects.get_or_create(
                    tmdb_id=movie_data['id'],
                    defaults={
                        'title': movie_data['title'],
                        'overview': movie_data['overview'],
                        'poster_path': movie_data['poster_path'],
                        'release_date': movie_data.get('release_date'),
                        'vote_average': movie_data['vote_average']
                    }
                )
                
                if created and movie_data.get('genre_ids'):
                    for genre_id in movie_data['genre_ids']:
                        genre = Genre.objects.filter(id=genre_id).first()
                        if genre:
                            movie.genres.add(genre)
                
                stored_movies.append(self.serializer_class(movie).data)
            
            return Response(stored_movies)
            
        except requests.exceptions.RequestException as e:
            return Response(
                {'error': f'TMDB API error: {str(e)}'},
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )

    @action(detail=False, methods=['get'])
    def discover(self, request):
        """Get a mix of movies from different categories"""
        try:
            local_movies = Movie.objects.all().order_by('-vote_average')[:20]

            if local_movies.count() < 20:
                response = requests.get(
                    self.get_tmdb_url('movie/discover'),
                    params=self.get_tmdb_params({
                        'sort_by': 'popularity.desc',
                        'page': 1
                    })
                )
                response.raise_for_status()
                
                movies_data = response.json()['results']
                for movie_data in movies_data:
                    movie, created = Movie.objects.get_or_create(
                        tmdb_id=movie_data['id'],
                        defaults={
                            'title': movie_data['title'],
                            'overview': movie_data['overview'],
                            'poster_path': movie_data['poster_path'],
                            'release_date': movie_data.get('release_date'),
                            'vote_average': movie_data['vote_average']
                        }
                    )
                    
                    if created and movie_data.get('genre_ids'):
                        for genre_id in movie_data['genre_ids']:
                            genre = Genre.objects.filter(id=genre_id).first()
                            if genre:
                                movie.genres.add(genre)
                
                    local_movies = Movie.objects.all().order_by('-vote_average')[:20]
            
            return Response(self.serializer_class(local_movies, many=True).data)
            
        except requests.exceptions.RequestException as e:
            return Response(
                {'error': f'TMDB API error: {str(e)}'},
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )

    @action(detail=False, methods=['get'], url_path='tmdb/(?P<tmdb_id>[^/.]+)')
    def tmdb_details(self, request, tmdb_id=None):
        """Fetch movie details directly from TMDB"""
        try:
            response = requests.get(
                self.get_tmdb_url(f'movie/{tmdb_id}'),
                params=self.get_tmdb_params()
            )
            response.raise_for_status()
            return Response(response.json())
        except requests.RequestException as e:
            logger.error(f"TMDB API error: {str(e)}")
            return Response(
                {'error': 'Failed to fetch movie details from TMDB'},
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )

    @action(detail=False, methods=['get'], url_path='tmdb/(?P<tmdb_id>[^/.]+)/credits')
    def tmdb_credits(self, request, tmdb_id=None):
        """Fetch movie credits directly from TMDB"""
        try:
            response = requests.get(
                self.get_tmdb_url(f'movie/{tmdb_id}/credits'),
                params=self.get_tmdb_params()
            )
            response.raise_for_status()
            return Response(response.json())
        except requests.RequestException as e:
            logger.error(f"TMDB API error: {str(e)}")
            return Response(
                {'error': 'Failed to fetch movie credits from TMDB'},
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )