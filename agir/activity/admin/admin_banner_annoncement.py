from django.urls import reverse
from django.utils.html import format_html

from agir.activity.admin.forms import BannerAnnouncementForm
from agir.activity.models_banner_announcement import (
    BannerAnnouncement,
    AnnouncementAnswer,
)
from django.contrib import admin


@admin.register(AnnouncementAnswer)
class AnswerAdmin(admin.ModelAdmin):
    list_display = ("name",)
    search_fields = ("name",)


@admin.register(BannerAnnouncement)
class BannerAnnouncementAdmin(admin.ModelAdmin):
    form = BannerAnnouncementForm
    fieldsets = (
        (
            None,
            {
                "fields": (
                    "title",
                    "description",
                    "question",
                    "after_message",
                    "answers",
                    "_associated_tags",
                    "start_date",
                    "end_date",
                    "segment",
                )
            },
        ),
    )
    readonly_fields = ("_associated_tags",)
    list_display = ("title", "start_date", "end_date")
    autocomplete_fields = ("segment", "answers")

    @admin.display(description="Tags associés")
    def _associated_tags(self, instance):
        if (
            instance.associated_answers_tags is None
            or instance.associated_answers_tags.count() == 0
        ):
            return "Les tags seront crées en même temps que l'annonce, en fonction des réponses choisies."
        tags = []
        for associated in instance.associated_answers_tags.all():
            tags.append(
                f'<a href="{reverse("admin:people_persontag_change", args=[associated.tag.id])}">'
                f"{associated.tag.label}</a><br/>"
            )

        return format_html(f"<span>{''.join(tags)}</span>")
