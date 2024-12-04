from django.contrib import admin
from django.urls import path, include
from django.http import HttpResponse
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework.routers import DefaultRouter
from users.views import CreateUserView
from movies.views import MovieViewSet
from events.views import EventViewSet

# Create a router and register our viewsets
router = DefaultRouter()
router.register(r'events', EventViewSet, basename='event')
router.register(r'movies', MovieViewSet, basename='movie')

def health_check(request):
    return HttpResponse("OK")

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', health_check),
    path('api/user/register/', CreateUserView.as_view(), name='register'),
    path('api/token/', TokenObtainPairView.as_view(), name='get_token'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='refresh_token'),
    path('api-auth/', include('rest_framework.urls')),
    path('api/', include(router.urls)),
]

"""
API Endpoints Documentation:

Authentication Endpoints:
-----------------------
POST /api/user/register/
    - Register a new user
    - Public access
    - Required fields in body:
        - username (string)
        - password (string)
        - email (string)

POST /api/token/
    - Obtain JWT token
    - Public access
    - Required fields in body:
        - username (string)
        - password (string)
    - Returns: access and refresh tokens

POST /api/token/refresh/
    - Refresh JWT token
    - Public access
    - Required field in body:
        - refresh (string)
    - Returns: new access token

Movie Endpoints:
--------------
GET /api/movies/
    - List all movies in database
    - Requires authentication
    - Returns: List of movies with details

GET /api/movies/{id}/
    - Retrieve specific movie details
    - Requires authentication
    - Returns: Single movie details

GET /api/movies/popular/
    - Get popular movies from TMDb
    - Requires authentication
    - Automatically stores movies in database
    - Returns: List of popular movies

GET /api/movies/search/
    - Search movies using TMDb
    - Requires authentication
    - Query parameters:
        - query (string): Search term
    - Returns: Search results from TMDb

Event Endpoints:
--------------
GET /api/events/
    - List all events where user is host or guest
    - Requires authentication
    - Returns: List of user's events

POST /api/events/
    - Create new event
    - Requires authentication
    - Required fields in body:
        - title (string)
        - description (string)
        - date (datetime)
        - location (string)
        - movie_options (array of movie IDs)

GET /api/events/{id}/
    - Retrieve specific event details
    - Requires authentication
    - Only accessible to event host or guests
    - Returns: Single event details

PUT /api/events/{id}/
    - Update specific event
    - Requires authentication
    - Only accessible to event host
    - Required fields: Same as POST /api/events/

DELETE /api/events/{id}/
    - Delete specific event
    - Requires authentication
    - Only accessible to event host

Event Voting Endpoints:
--------------------
POST /api/events/{id}/vote/
    - Submit vote for movie in event
    - Requires authentication
    - Only accessible to event host and guests
    - Required fields in body:
        - movie_id (integer)
        - vote (boolean or null): true for yes, false for no, null for reset

GET /api/events/{id}/vote_results/
    - Get voting results for event
    - Requires authentication
    - Returns: Voting statistics per movie

Event Guest Management:
--------------------
POST /api/events/{id}/invite_guests/
    - Invite guests to event
    - Requires authentication
    - Only accessible to event host
    - Required fields in body:
        - emails (array of strings)

POST /api/events/{id}/respond_to_invitation/
    - Respond to event invitation
    - Requires authentication
    - Required fields in body:
        - status (string): "accepted" or "declined"

Event Movie Management:
--------------------
GET /api/events/{id}/movie_suggestions/
    - Get movie suggestions based on current options
    - Requires authentication
    - Returns: List of suggested movies

GET /api/events/{id}/event_summary/
    - Get comprehensive event summary
    - Requires authentication
    - Returns:
        - event details
        - voting results
        - attendance information
        - winning movie

POST /api/events/{id}/finalize_movie/
    - Finalize movie selection
    - Requires authentication
    - Only accessible to event host
    - Required fields in body:
        - movie_id (integer)
    - Automatically notifies all guests
"""