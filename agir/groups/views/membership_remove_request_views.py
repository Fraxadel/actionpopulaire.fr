from agir.groups.admin import MembershipRemoveRequestAdmin
from django.db.models import Q
from django.http import HttpResponseForbidden
from numpy.lib.utils import source
from rest_framework.generics import (
    CreateAPIView,
    RetrieveAPIView,
    ListAPIView,
    UpdateAPIView,
)
from rest_framework import serializers
from django.urls import resolve

from agir.authentication.view_mixins import (
    HardLoginRequiredMixin,
)
from agir.groups.models import MembershipRemoveRequest
from agir.groups.models import SupportGroup
from agir.groups.tasks import (
    send_notifications_remove_request_referent,
    send_email_remove_request_ga,
)
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
    id = serializers.UUIDField(read_only=True)
    supportgroupId = serializers.PrimaryKeyRelatedField(
        source="supportgroup",
        label="Groupe d'action",
        queryset=SupportGroup.objects.all(),
    )
    personId = serializers.PrimaryKeyRelatedField(
        source="person",
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
        partial = True
        fields = [
            "id",
            "supportgroupId",
            "personId",
            "details",
            "reason",
            "status",
            "creator",
        ]


class MembershipRemoveRequestCreatePermissions(GlobalOrObjectPermissions):
    perms_map = {"OPTIONS": [], "POST": [], "PATCH": []}
    object_perms_map = {
        "OPTIONS": [],
        "POST": ["groups.add_membership_remove_request"],
        "PATCH": ["groups.validate_membership_remove_request"],
    }


import logging

logger = logging.getLogger(__name__)


class MembershipRemoveRequestUpdateAPIView(UpdateAPIView):
    queryset = MembershipRemoveRequest.objects.exclude(
        status__exact=MembershipRemoveRequest.Status.DONE
    )
    model = MembershipRemoveRequest
    permission_classes = (IsPersonPermission, MembershipRemoveRequestCreatePermissions)
    serializer_class = MembershipRemoveRequestSerializer

    def patch(self, request, *args, **kwargs):
        # we only allow patch to validate the request from the other referent

        current_url = resolve(request.path_info).url_name
        current_remove_request = self.get_object()

        if request.user == current_remove_request.created_by:
            return HttpResponseForbidden()

        if (
            current_remove_request.status
            == MembershipRemoveRequest.Status.AWAIT_PEER_REVIEW
        ):
            if current_url.endswith("validate"):
                request.data["status"] = (
                    MembershipRemoveRequest.Status.AWAIT_ADMIN_REVIEW
                )
                send_email_remove_request_ga.delay(current_remove_request.id)
            elif current_url.endswith("refuse"):
                request.data["status"] = MembershipRemoveRequest.Status.REFUSED
            return super().partial_update(request, *args, **kwargs)
        return HttpResponseForbidden()


class MembershipRemoveRequestCreateAPIView(CreateAPIView, UpdateAPIView):
    permission_classes = (IsPersonPermission, MembershipRemoveRequestCreatePermissions)
    queryset = MembershipRemoveRequest.objects.all()
    model = MembershipRemoveRequest
    serializer_class = MembershipRemoveRequestSerializer

    def perform_create(self, serializer):
        # super().perform_create(serializer)
        instance = serializer.save()
        current_group = SupportGroup.objects.get(
            pk=self.request.data.get("supportgroupId")
        )
        other_referent = list(
            filter(
                lambda p: p.id != serializer.data.get("created_by"),
                current_group.referents,
            )
        )[0]
        send_notifications_remove_request_referent.delay(
            other_referent.id, current_group.id, instance.id
        )


class MembershipRemoveRequestListAPIView(ListAPIView, HardLoginRequiredMixin):
    permission_classes = (IsPersonPermission,)
    model = MembershipRemoveRequest
    serializer_class = MembershipRemoveRequestSerializer

    def get_queryset(self):
        return MembershipRemoveRequest.objects.filter(
            supportgroup__id=self.kwargs.get("pk")
        ).exclude(
            status__in=[
                MembershipRemoveRequest.Status.DONE,
                MembershipRemoveRequest.Status.REFUSED,
            ]
        )


class MembershipRemoveRequestDetailAPIView(RetrieveAPIView, HardLoginRequiredMixin):
    queryset = MembershipRemoveRequest.objects.all()
    model = MembershipRemoveRequest
    serializer_class = MembershipRemoveRequestSerializer

    def get_queryset(self):
        return MembershipRemoveRequest.objects.filter(
            Q(supportgroup__id=self.kwargs.get("pk"))
            & Q(person__id=self.kwargs.get("person"))
        )
