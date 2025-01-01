from django.urls import path, include
from .views import EventViewSet
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register(r'events', EventViewSet, basename='event')

urlpatterns = [
    path('', include(router.urls)),
    path('email-preview/', EventViewSet.as_view({'get': 'preview_email'}), name='email-preview'),
]

""" 
Email Previews

/api/events/email-preview/?template=event_invitation
/api/events/email-preview/?template=event_confirmation&status=accepted
/api/events/email-preview/?template=event_confirmation&status=declined
"""