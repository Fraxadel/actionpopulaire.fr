from django.http import HttpResponseNotFound, HttpResponse
from rest_framework.decorators import permission_classes, api_view
from rest_framework.response import Response
from django.utils import timezone
from rest_framework.generics import ListAPIView, UpdateAPIView, get_object_or_404
from rest_framework import status

from agir.activity.models_banner_announcement import (
    BannerAnnouncement,
    AnnouncementActivity,
)
from agir.activity.serializers_banner_announcement import BannerAnnouncementSerializer
from agir.lib.http import HttpResponseUnauthorized
from agir.lib.rest_framework_permissions import (
    IsPersonPermission,
)


class BannerAnnouncementView(ListAPIView):
    queryset = BannerAnnouncement.objects.all()
    serializer_class = BannerAnnouncementSerializer
    permission_classes = (IsPersonPermission,)

    def list(self, request, *args, **kwargs):
        if self.request.user.is_authenticated and self.request.user.person is not None:
            queryset = (
                self.get_queryset()
                .filter(start_date__lt=timezone.now(), end_date__gt=timezone.now())
                .select_related("segment")
                .prefetch_related("answers")
                .exclude(
                    associated_answers_tags__tag__in=self.request.user.person.tags.all()
                )
                .all()
            )

            announcements_to_return = []
            for announcement in queryset:
                if announcement.show_to_person(self.request.user.person):
                    announcements_to_return.append(announcement)

            serializer = self.get_serializer(announcements_to_return, many=True)
            return Response(serializer.data)
        return Response(None, status=status.HTTP_204_NO_CONTENT)

    def post(self):
        pass


class BannerAnnouncementViewEdit(UpdateAPIView):
    queryset = BannerAnnouncement.objects.filter(
        start_date__lt=timezone.now(), end_date__gt=timezone.now()
    )
    serializer_class = BannerAnnouncementSerializer
    permission_classes = (IsPersonPermission,)

    def patch(self, request, *args, **kwargs):
        pass

    def update(self, request, *args, **kwargs):
        answer_id = self.kwargs.get("answerId")
        current_person = self.request.user.person
        instance = self.get_object()

        selected_associated = next(
            filter(
                lambda associated: associated.answer.id == answer_id,
                instance.associated_answers_tags.all(),
            ),
            None,
        )

        if selected_associated is None:
            return HttpResponseNotFound()
        current_person.tags.add(selected_associated.tag)

        serializer = self.get_serializer(instance, data=request.data)
        serializer.is_valid(raise_exception=True)
        return Response(serializer.data)


@api_view(["GET"])
@permission_classes((IsPersonPermission,))
def person_closed_banner_announcement(request, pk):
    current_person = request.user.person

    announcement = get_object_or_404(BannerAnnouncement, pk=pk)
    if announcement.answers.count() > 0:
        return HttpResponseUnauthorized()
    AnnouncementActivity.objects.update_or_create(
        banner_announcement_id=pk,
        person_id=current_person.id,
        state=AnnouncementActivity.STATE_CLOSED,
    )
    return HttpResponse(status=204)
