import ics
from django.http import HttpResponse
from django.views.generic import DetailView
from rest_framework.generics import RetrieveAPIView, ListAPIView

from agir.events.calendar_serializers import CalendarSerializer
from agir.events.models import Calendar, Event, EventSubtype
from agir.events.serializers import EventListSerializer


class CalendarDetailAPIView(RetrieveAPIView):
    permission_classes = ()
    queryset = Calendar.objects.not_archived()
    serializer_class = CalendarSerializer
    lookup_field = "slug"

    def get_query(self):
        return super().get_queryset().get(slug=self.kwargs["slug"])


class CalendarEventListAPIView(ListAPIView):
    permission_classes = ()
    serializer_class = EventListSerializer
    queryset = Event.objects.public()

    def get_queryset(self):
        return (
            super()
            .get_queryset()
            .filter(calendars__slug=self.kwargs["slug"], calendars__archived=False)
            .order_by("start_time")
            .upcoming()
        )

    def get_serializer(self, *args, **kwargs):
        return super().get_serializer(
            *args,
            fields=EventListSerializer.EVENT_CARD_FIELDS,
            **kwargs,
        )


class CalendarIcsView(DetailView):
    model = Calendar

    def render_to_response(self, context, **response_kwargs):
        calendar = ics.Calendar(
            events=[
                event.to_ics()
                for event in self.object.events.filter(
                    visibility=Event.VISIBILITY_PUBLIC
                )
            ]
        ).serialize()

        return HttpResponse(calendar, content_type="text/calendar")


class EventSubtypeIcsView(CalendarIcsView):
    model = EventSubtype
    queryset = EventSubtype.objects.exclude(visibility=EventSubtype.VISIBILITY_NONE)
