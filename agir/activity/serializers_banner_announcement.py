from rest_framework import serializers

from agir.activity.models_banner_announcement import (
    BannerAnnouncement,
    AnnouncementAnswer,
)


class AnnouncementAnswerSerializer(serializers.ModelSerializer):
    name = serializers.CharField()
    id = serializers.IntegerField()

    class Meta:
        model = AnnouncementAnswer
        fields = ["name", "id"]


class BannerAnnouncementSerializer(serializers.ModelSerializer):
    title = serializers.CharField(read_only=True)
    answers = AnnouncementAnswerSerializer(read_only=True, many=True)
    afterMessage = serializers.CharField(source="after_message", read_only=True)

    class Meta:
        model = BannerAnnouncement
        fields = [
            "id",
            "title",
            "description",
            "question",
            "answers",
            "end_date",
            "afterMessage",
        ]
