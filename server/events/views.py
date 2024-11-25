from rest_framework import viewsets, permissions
from .models import Event
from .serializers import EventSerializer

class EventViewSet(viewsets.ModelViewSet):
    queryset = Event.objects.all()
    serializer_class = EventSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Event.objects.filter(host=self.request.user)

    def perform_create(self, serializer):
            serializer.save(host=self.request.user)

# POST /events/: Create a new event (only accessible to authenticated users).
# GET /events/: List all events created by the current authenticated user.
# GET /events/<id>/: Retrieve details of a specific event.
# PUT /events/<id>/: Update an event (restricted to the host).
# DELETE /events/<id>/: Delete an event (restricted to the host).