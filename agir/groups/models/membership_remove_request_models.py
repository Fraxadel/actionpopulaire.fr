from numpy.ma.core import absolute

from agir.lib.models import BaseAPIResource
from django.db import models
from django.utils.translation import gettext_lazy as _
from agir.lib.utils import front_url
from django.urls import reverse
from django.conf import settings

__all__ = ["MembershipRemoveRequest"]


class MembershipRemoveRequest(BaseAPIResource):
    REASON_NE_MILITE_PLUS_A_LA_FI = "milite_plus_lfi"
    REASON_JAMAIS_PARTICIPEE_GROUPE = "jamais_participee"
    REASON_CHANGE_GROUPE = "change_groupe"
    REASON_DEMANDE_SUPPRESSION_GROUPE = "demande_suppression"
    REQUEST_REASON_CHOICES = (
        (
            REASON_NE_MILITE_PLUS_A_LA_FI,
            "Cette personne ne milite plus à la France Insoumise",
        ),
        (
            REASON_JAMAIS_PARTICIPEE_GROUPE,
            "Cette personne n'a jamais participé au groupe d'action",
        ),
        (REASON_CHANGE_GROUPE, "Cette personne a changé de groupe"),
        (
            REASON_DEMANDE_SUPPRESSION_GROUPE,
            "Cette personne a demandé sa suppression du groupe",
        ),
    )

    class Status(models.TextChoices):
        AWAIT_PEER_REVIEW = "P", "En attente de vérification par une autre personne"
        AWAIT_ADMIN_REVIEW = (
            "A",
            "En attente de vérification par le pôle des groupes d'action",
        )
        DONE = "D", "Terminé"
        REFUSED = "R", "Cette demande a été refusée"

        @property
        def choice(self):
            return self.value, self.label

    supportgroup = models.ForeignKey(
        "SupportGroup",
        on_delete=models.CASCADE,
        related_name="membership_remove_requests",
        editable=False,
    )
    person = models.ForeignKey(
        "people.Person",
        related_name="membership_remove_requests",
        editable=False,
        on_delete=models.CASCADE,
        verbose_name="Personne à supprimer",
    )
    created_by = models.ForeignKey(
        "people.Person",
        blank=True,
        null=True,
        default=None,
        on_delete=models.CASCADE,
        verbose_name="Créateur·ice de la demande",
    )
    details = models.TextField(verbose_name="Details", max_length=1000)
    reason_type = models.CharField(
        "Raison de la suppression",
        max_length=20,
        choices=REQUEST_REASON_CHOICES,
        blank=False,
        default=REASON_DEMANDE_SUPPRESSION_GROUPE,
    )
    status = models.CharField(
        _("Status"),
        max_length=1,
        default=Status.AWAIT_PEER_REVIEW,
        choices=Status.choices,
        blank=False,
        null=False,
    )
    resolved_date = models.DateTimeField(
        blank=True,
        null=True,
        default=None,
        verbose_name="Date de résolution, quand la personne a été supprimée",
    )

    def front_url(self):
        return front_url(
            "view_group_membership_remove_request",
            kwargs={"pk": self.supportgroup_id, "request_pk": self.pk},
            absolute=True,
        )

    def admin_url(self):
        return settings.API_DOMAIN + reverse(
            "admin:groups_membershipremoverequest_change", args=[self.id]
        )

    class Meta:
        verbose_name = "Requête suppression de membre"
        verbose_name_plural = "Requêtes de suppression de membre"
