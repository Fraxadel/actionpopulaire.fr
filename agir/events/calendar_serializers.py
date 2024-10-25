from rest_framework import serializers

from agir.events.models import Calendar
from agir.lib.serializers import FlexibleFieldsMixin


class CalendarSerializer(serializers.ModelSerializer):

    class Meta:
        model = Calendar
        fields = ["id", "name", "description", "slug"]
