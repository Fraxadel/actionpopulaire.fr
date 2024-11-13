from .. import models
from django.contrib import admin

from ...lib.admin.utils import display_link


@admin.register(models.MembershipRemoveRequest)
class MembershipRemoveRequestAdmin(admin.ModelAdmin):
    list_display = ["created", "created_by", "group_link", "solved"]
    readonly_fields = (
        "created",
        "created_by",
        "details",
        "reason_type",
        "supportgroup"
    )

    @admin.display(description="Groupe", ordering="group")
    def group_link(self, obj):
        return display_link(obj.supportgroup)
