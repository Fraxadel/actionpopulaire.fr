from agir.lib.models import BaseAPIResource
from django.db import models

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
    solved = models.BooleanField(verbose_name="Résolu", default=False)

    class Meta:
        verbose_name = "Requête suppression de membre"
        verbose_name_plural = "Requêtes de suppression de membre"
