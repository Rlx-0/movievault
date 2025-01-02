from django.contrib import admin
from django.urls import path, include
from django.http import HttpResponse
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework.routers import DefaultRouter
from users.views import CreateUserView
from movies.views import MovieViewSet
from events.views import EventViewSet
from users.custom_auth import CustomTokenObtainPairView
from .api.views.contact import contact_form

router = DefaultRouter()
router.register(r'events', EventViewSet, basename='event')
router.register(r'movies', MovieViewSet, basename='movie')

def health_check(request):
    return HttpResponse("OK")

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', health_check),
    path('api/user/register/', CreateUserView.as_view(), name='register'),
    path('api/token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api-auth/', include('rest_framework.urls')),
    path('api/', include(router.urls)),
    path('api/', include('movies.urls')),
    path('api/', include('events.urls')),
    path('api/contact/', contact_form, name='contact_form'),
]

"""
API Endpoints Documentation:

Authentication Endpoints:
-----------------------
POST /api/user/register/
    - Register a new user
    - Public access
    - Required fields:
        - username (string)
        - password (string)
        - email (string)
    - Returns: User object (id, username, email)

POST /api/token/
    - Obtain JWT token pair
    - Public access
    - Required fields:
        - username (string)
        - password (string)
    - Returns:
        - access (string): JWT access token
        - refresh (string): JWT refresh token

POST /api/token/refresh/
    - Refresh JWT token
    - Public access
    - Required fields:
        - refresh (string): Refresh token
    - Returns:
        - access (string): New JWT access token

Movie Endpoints:
--------------
GET /api/movies/
    - List all movies in database
    - Requires authentication
    - Optional query params:
        - page (integer)
        - search (string)
    - Returns: Paginated list of movies

POST /api/movies/
    - Add new movie to database
    - Requires authentication
    - Required fields:
        - title (string)
        - overview (string)
        - release_date (date)
    - Returns: Created movie object

GET /api/movies/{id}/
    - Retrieve specific movie details
    - Requires authentication
    - Returns: Single movie object with full details

GET /api/movies/popular/
    - Get popular movies from TMDb
    - Requires authentication
    - Optional query params:
        - page (integer)
    - Returns: List of popular movies
    - Automatically caches results in database

GET /api/movies/search/
    - Search movies using TMDb
    - Requires authentication
    - Required query params:
        - query (string)
    - Returns: Search results from TMDb

GET /api/movies/upcoming/
    - Get upcoming movies from TMDb
    - Requires authentication
    - Returns: List of upcoming movies
    - Automatically caches results in database

Event Endpoints:
--------------
GET /api/events/
    - List all events for authenticated user
    - Requires authentication
    - Returns: List of events where user is host or guest

POST /api/events/
    - Create new event
    - Requires authentication
    - Required fields:
        - title (string)
        - description (string)
        - date (datetime)
        - location (string)
        - movie_options (array of movie IDs)
    - Returns: Created event object

GET /api/events/{id}/
    - Retrieve specific event details
    - Requires authentication
    - Access: Event host or guests only
    - Returns: Full event details including guest list and movie options

PUT /api/events/{id}/
    - Update event details
    - Requires authentication
    - Access: Event host only
    - Required fields: Same as POST /api/events/
    - Returns: Updated event object

DELETE /api/events/{id}/
    - Delete event
    - Requires authentication
    - Access: Event host only
    - Returns: 204 No Content

Event Voting Endpoints:
--------------------
POST /api/events/{id}/vote/
    - Submit vote for movie in event
    - Requires authentication
    - Access: Event host or guests only
    - Required fields:
        - movie_id (integer)
        - vote (boolean or null): true for yes, false for no, null to reset
    - Returns: Updated vote object

GET /api/events/{id}/vote_results/
    - Get voting results for event
    - Requires authentication
    - Access: Event host or guests only
    - Returns:
        - movie_id (integer)
        - yes_votes (integer)
        - no_votes (integer)
        - total_votes (integer)

Guest Management:
---------------
POST /api/events/{id}/invite_guests/
    - Invite guests to event
    - Requires authentication
    - Access: Event host only
    - Required fields:
        - emails (array of strings)
    - Returns: List of created invitations

POST /api/events/{id}/respond_to_invitation/
    - Respond to event invitation
    - Requires authentication
    - Required fields:
        - status (string): "accepted" or "declined"
    - Returns: Updated invitation object

Additional Event Features:
-----------------------
GET /api/events/{id}/movie_suggestions/
    - Get movie suggestions based on current options
    - Requires authentication
    - Access: Event host or guests only
    - Returns: List of suggested movies based on genres

POST /api/events/{id}/finalize_movie/
    - Finalize movie selection for event
    - Requires authentication
    - Access: Event host only
    - Required fields:
        - movie_id (integer)
    - Returns: Updated event object
    - Side effect: Notifies all guests via email
"""