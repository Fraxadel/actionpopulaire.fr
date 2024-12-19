from rest_framework.generics import RetrieveUpdateAPIView

from .. import serializers, models, permissions
from ...events.models import Event
from ...events.views.api_views import EventListAPIView
from ...lib.rest_framework_permissions import (
    IsPersonPermission,
)
from agir.event_requests.tasks import (
    send_speaker_answered_request_notification_to_admin,
)

__all__ = [
    "EventSpeakerRetrieveUpdateAPIView",
    "EventSpeakerRequestRetrieveUpdateAPIView",
    "EventSpeakerEventListAPIView",
]


class EventSpeakerRetrieveUpdateAPIView(RetrieveUpdateAPIView):
    permission_classes = (
        IsPersonPermission,
        permissions.EventSpeakerAPIPermissions,
    )
    queryset = models.EventSpeaker.objects.all().with_serializer_prefetch()
    lookup_field = "person_id"
    serializer_class = serializers.EventSpeakerSerializer

    def get_object(self):
        self.kwargs[self.lookup_field] = self.request.user.person.id
        return super().get_object()


class EventSpeakerRequestRetrieveUpdateAPIView(RetrieveUpdateAPIView):
    permission_classes = (
        IsPersonPermission,
        permissions.EventSpeakerRequestAPIPermissions,
    )
    queryset = models.EventSpeakerRequest.objects.all().select_related(
        "event_request", "event_speaker"
    )
    serializer_class = serializers.EventSpeakerRequestSerializer

    def patch(self, request, *args, **kwargs):
        response = super().patch(request, *args, **kwargs)
        event_speaker_request = self.get_object()
        is_available = request.data.get("available", False)
        if event_speaker_request.is_answerable and is_available:
            if request.user.person == event_speaker_request.event_speaker.person:
                send_speaker_answered_request_notification_to_admin.delay(
                    event_speaker_request.pk
                )

        return response


class EventSpeakerEventListAPIView(EventListAPIView):
    queryset = Event.objects.exclude(visibility=Event.VISIBILITY_ADMIN).upcoming()

    def get_queryset(self):
        return (
            super()
            .get_queryset()
            .filter(event_speakers__person_id=self.request.user.person.id)
        )
