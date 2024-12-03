from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Movie, Genre
from .serializers import MovieSerializer
import requests
import os

class MovieViewSet(viewsets.ModelViewSet):
    queryset = Movie.objects.all()
    serializer_class = MovieSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_tmdb_headers(self):
        return {
            'Authorization': f'Bearer {os.getenv("TMDB_API_KEY")}',
            'Content-Type': 'application/json;charset=utf-8'
        }

    @action(detail=False, methods=['get'])
    def popular(self, requests):
        url = 'https://api.themoviedb.org/3/movie/popular'
        response = requests.get(url, headers=self.get_tmdb_headers())
        
        if response.status_code == 200:
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
                if created:
                    for genre_id in movie_data['genre_ids']:
                        genre = Genre.objects.get(id=genre_id)
                        movie.genres.add(genre)
            
            return Response(movies_data)
        return Response(status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'])
    def search(self, request):
        query = request.query_params.get('query', '')
        if not query:
            return Response(
                {'error': 'Query parameter is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        url = f'https://api.themoviedb.org/3/search/movie'
        params = {'query': query}
        response = requests.get(
            url, 
            headers=self.get_tmdb_headers(), 
            params=params
        )
        
        if response.status_code == 200:
            return Response(response.json())
        return Response(status=status.HTTP_400_BAD_REQUEST)