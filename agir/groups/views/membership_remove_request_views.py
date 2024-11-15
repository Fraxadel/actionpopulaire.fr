from django.db.models import Q
from numpy.lib.utils import source
from rest_framework.generics import (
    CreateAPIView,
    RetrieveAPIView,
    ListAPIView,
    UpdateAPIView,
)
from rest_framework import serializers

from agir.authentication.view_mixins import (
    HardLoginRequiredMixin,
)
from agir.groups.models import MembershipRemoveRequest
from agir.groups.models import SupportGroup
from agir.groups.tasks import send_notifications_remove_request_referent
from agir.lib.http import HttpResponseUnauthorized
from agir.people.models import Person
from agir.lib.rest_framework_permissions import (
    GlobalOrObjectPermissions,
    IsPersonPermission,
)

__all__ = [
    "MembershipRemoveRequestCreateAPIView",
    "MembershipRemoveRequestDetailAPIView",
    "MembershipRemoveRequestListAPIView",
    "MembershipRemoveRequestUpdateAPIView",
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
    )
    reason = serializers.CharField(
        source="reason_type", label="Raison", allow_null=False, allow_blank=False
    )
    creator = serializers.CharField(
        source="created_by.id", label="Createur.ice", read_only=True
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
            "reason",
            "status",
            "creator",
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


class MembershipRemoveRequestUpdateAPIView(UpdateAPIView):
    def update(self, request, *args, **kwargs):
        pass

    def patch(self, request, *args, **kwargs):
        # we only allow patch to validate the request from the other referent
        if request.data.status != MembershipRemoveRequest.Status.AWAIT_ADMIN_REVIEW:
            return HttpResponseUnauthorized()
        return super().patch(request, *args, **kwargs)


class MembershipRemoveRequestCreateAPIView(CreateAPIView, UpdateAPIView):
    permission_classes = (IsPersonPermission, MembershipRemoveRequestCreatePermissions)
    queryset = MembershipRemoveRequest.objects.all()
    model = MembershipRemoveRequest
    serializer_class = MembershipRemoveRequestSerializer

    def perform_create(self, serializer):
        super().perform_create(serializer)
        if serializer["status"] == MembershipRemoveRequest.Status.AWAIT_PEER_REVIEW:
            current_group = SupportGroup.objects.get(serializer["supportgroup"])
            other_referent = list(
                filter(
                    lambda p: p.id != serializer["created_by"], current_group.referents
                )
            )[0]
            send_notifications_remove_request_referent.delay(
                other_referent.id,
                current_group.id,
            )


class MembershipRemoveRequestListAPIView(ListAPIView, HardLoginRequiredMixin):
    permission_classes = (IsPersonPermission,)
    model = MembershipRemoveRequest
    serializer_class = MembershipRemoveRequestSerializer

    def get_queryset(self):
        return MembershipRemoveRequest.objects.filter(
            supportgroup__id=self.kwargs.get("pk")
        ).exclude(status__exact=MembershipRemoveRequest.Status.DONE)


class MembershipRemoveRequestDetailAPIView(RetrieveAPIView, HardLoginRequiredMixin):
    queryset = MembershipRemoveRequest.objects.all()
    model = MembershipRemoveRequest
    serializer_class = MembershipRemoveRequestSerializer

    def get_queryset(self):
        return MembershipRemoveRequest.objects.filter(
            Q(supportgroup__id=self.kwargs.get("pk"))
            & Q(person__id=self.kwargs.get("person"))
        )
