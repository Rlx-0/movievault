from django.contrib import admin
from .models import Event, EventInvitation, MovieVote

@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ('title', 'host', 'date', 'location', 'created_at')
    search_fields = ('title', 'description')
    list_filter = ('created_at',)
    readonly_fields = ('created_at', 'updated_at')

@admin.register(EventInvitation)
class EventInvitationAdmin(admin.ModelAdmin):
    list_display = ('email', 'event', 'status', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('email',)
    readonly_fields = ('created_at', 'updated_at')

@admin.register(MovieVote)
class MovieVoteAdmin(admin.ModelAdmin):
    list_display = ('event', 'movie', 'user', 'vote')
    list_filter = ('vote',)
