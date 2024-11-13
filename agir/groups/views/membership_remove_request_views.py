from agir.lib.rest_framework_permissions import IsPersonPermission
from agir.people.serializers import PersonSerializer
from django.views.generic.detail import BaseDetailView
from rest_framework.generics import (
    CreateAPIView,
    ListAPIView,
    get_object_or_404,
    RetrieveAPIView,
)
from rest_framework import serializers
from rest_framework import status

from agir.authentication.view_mixins import (
    HardLoginRequiredMixin,
    GlobalOrObjectPermissionRequiredMixin,
)
from agir.groups.models import MembershipRemoveRequest
from agir.groups.models import SupportGroup
from agir.groups.serializers import SupportGroupSerializer
from agir.people.models import Person
from agir.lib.rest_framework_permissions import (
    GlobalOrObjectPermissions,
    IsPersonPermission,
)

__all__ = [
    "MembershipRemoveRequestCreateAPIView",
    "MembershipRemoveRequestDetailAPIView",
]


class MembershipRemoveRequestSerializer(serializers.ModelSerializer):
    supportgroup = serializers.PrimaryKeyRelatedField(
        label="Groupe d'action",
        queryset=SupportGroup.objects.active(),
        write_only=True,
    )
    person = serializers.PrimaryKeyRelatedField(
        label="Membre",
        queryset=Person.objects.all(),
        write_only=True,
    )

    def create(self, validated_data):
        validated_data["created_by"] = self.context["request"].user.person
        return super().create(validated_data)

    class Meta:
        model = MembershipRemoveRequest
        fields = [
            "supportgroup",
            "person",
            "details",
            "reason_type",
            "solved",
        ]


class MembershipRemoveRequestCreatePermissions(GlobalOrObjectPermissions):
    perms_map = {
        "OPTIONS": [],
        "POST": [],
    }
    object_perms_map = {
        "OPTIONS": [],
        "POST": ["groups.add_membership_remove_request"],
    }


class MembershipRemoveRequestCreateAPIView(CreateAPIView):
    permission_classes = (IsPersonPermission, MembershipRemoveRequestCreatePermissions)
    queryset = MembershipRemoveRequest.objects.all()
    model = MembershipRemoveRequest
    serializer_class = MembershipRemoveRequestSerializer


class MembershipRemoveRequestDetailAPIView(RetrieveAPIView, HardLoginRequiredMixin):
    queryset = MembershipRemoveRequest.objects.all()
    model = MembershipRemoveRequest
    serializer_class = MembershipRemoveRequestSerializer
