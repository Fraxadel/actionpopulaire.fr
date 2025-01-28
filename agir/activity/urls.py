from django.urls import path

from . import views
from .views_banner_announcement import (
    BannerAnnouncementView,
    BannerAnnouncementViewEdit,
    person_closed_banner_announcement,
)

app_name = "activity"

urlpatterns = [
    path(
        "api/activity/bulk/update-status/",
        views.ActivityStatusUpdateView.as_view(),
        name="api_activity_update_status",
    ),
    path(
        "api/activity/bulk/mark-all-read/",
        views.ActivityStatusUpdateAllReadView.as_view(),
        name="api_activity_update_status_all_read",
    ),
    path(
        "api/activity/<int:pk>/", views.ActivityAPIView.as_view(), name="api_activity"
    ),
    path(
        "api/user/activities/",
        views.UserActivitiesAPIView.as_view(),
        name="api_user_activities",
    ),
    path(
        "api/user/activities/unread-count/",
        views.get_unread_activity_count,
        name="api_user_unread_activity_count",
    ),
    path(
        "api/announcements/",
        views.AnnouncementsAPIView.as_view(),
        name="api_user_announcements",
    ),
    path(
        "api/user/announcements/custom/<str:custom_display>/",
        views.UserCustomAnnouncementAPIView.as_view(),
        name="api_user_custom_announcement",
    ),
    path(
        "annonce/<uuid:pk>/lien/",
        views.AnnouncementLinkView.as_view(),
        name="announcement_link",
    ),
    path(
        "activite/<int:pk>/lien/",
        views.follow_activity_link,
        name="activity_link",
    ),
    path(
        "push/<uuid:pk>/lien/",
        views.PushAnnouncementLinkView.as_view(),
        name="push_announcement_link",
    ),
    path(
        "api/activite/bannerannouncements/",
        BannerAnnouncementView.as_view(),
        name="api_banner_announcements_list",
    ),
    path(
        "api/activite/bannerannouncements/<uuid:pk>/answer/<int:answerId>",
        BannerAnnouncementViewEdit.as_view(),
        name="api_banner_announcements_edit",
    ),
    path(
        "api/activite/bannerannouncements/<uuid:pk>/close",
        person_closed_banner_announcement,
        name="api_banner_annoucements_close",
    ),
]
