import reversion
from django.core.exceptions import FieldDoesNotExist
from django.utils.html import format_html
from django.utils.translation import ngettext
from glom import glom, T, Coalesce

from agir.donations.allocations import (
    get_supportgroup_balance,
    get_account_name_for_group,
    SPENDING_ACCOUNT,
)
from agir.donations.models import SpendingRequest, AccountOperation
from agir.donations.tasks import (
    spending_request_notify_admin,
    spending_request_notify_group_managers,
)
from agir.lib.display import display_price


def group_formatter(group):
    return format_html(
        '<a href="{group_link}">{group_name}</a> ({group_balance})<br><a href="mailto:{group_email}">{group_email}</a><br>{group_phone}',
        group_name=group.name,
        group_email=group.contact_email,
        group_phone=group.contact_phone,
        group_link=group.front_url(),
        group_balance=display_price(get_supportgroup_balance(group)),
    )


def bank_account_rib_formatter(rib):
    if not rib:
        return "-"

    return format_html(
        '<a download={name} href="{url}">💾 Télécharger le RIB</a>',
        name=rib.name,
        url=rib.url,
    )


def admin_summary(spending_request):
    spec = {
        "id": "id",
        "title": "title",
        "created": "created",
        "status": T.get_status_display(),
        "campaign": "campaign",
        "timing": T.get_timing_display(),
        "spending_date": "spending_date",
        "amount": ("amount", display_price),
        "category": T.get_category_display(),
        "category_precisions": "category_precisions",
        "explanation": "explanation",
        "contact_name": "contact_name",
        "contact_phone": "contact_phone",
        "group": ("group", group_formatter),
        "event": Coalesce("event", default=""),
        "bank_account_full_name": "bank_account_full_name",
        "bank_account_iban": "bank_account_iban",
        "bank_account_bic": "bank_account_bic",
        "bank_account_rib": ("bank_account_rib", bank_account_rib_formatter),
    }

    values = glom(spending_request, spec)

    return [
        {"label": get_spending_request_field_label(key), "value": values[key] or "-"}
        for key in spec
    ]


STATUS_EXPLANATION = {
    SpendingRequest.Status.DRAFT: "Une fois votre demande complétée, vous pourrez l'envoyer pour validation par un⋅e autre gestionnaire.",
    SpendingRequest.Status.AWAITING_PEER_REVIEW: "Vous avez déjà validé cette demande. Avant sa transmission à l'équipe de suivi des questions financières, elle doit tout d'abord être validée par un⋅e autre gestionnaire.",
    SpendingRequest.Status.AWAITING_ADMIN_REVIEW: "Votre demande est en cours d'évaluation par l'équipe de suivi des questions financières. Vous serez prévenus une fois celle-ci traitée.",
    SpendingRequest.Status.AWAITING_SUPPLEMENTARY_INFORMATION: "Lorsque vous aurez intégré les modifications demandées, vous pourrez de nouveau transmettre cette demande à l'équipe de suivi.",
    SpendingRequest.Status.VALIDATED: "Votre groupe ne dispose pas d'une allocation suffisante pour obtenir le réglement de cette demande pour le moment. Dès que votre allocation sera suffisante, vous pourrez demander le paiement de cette demande avec ce formulaire.",
    SpendingRequest.Status.TO_PAY: "Votre demande est en attente de paiement par l'équipe de suivi. Cela ne devrait pas tarder !",
    SpendingRequest.Status.PAID: "Votre demande a été correctement réglée.",
    SpendingRequest.Status.REFUSED: "Votre demande a été refusée car elle ne rentrait pas dans le cadre des demandes de dépense.",
}

NOT_READY_FOR_REVIEW_STATUS_EXPLANATION = {
    SpendingRequest.Status.DRAFT: "Avant de pouvoir être envoyée pour validation, votre demande doit être complète.",
    SpendingRequest.Status.AWAITING_PEER_REVIEW: "Cette demande a déjà été validée par une personne. Pour permettre sa transmission, elle doit encore être validée par un·e deuxième gestionnaire. Attention : avant de pouvoir être validée, votre demande doit être complète.",
    SpendingRequest.Status.AWAITING_SUPPLEMENTARY_INFORMATION: "Lorsque vous aurez intégré les modifications demandées, vous pourrez de nouveau transmettre cette demande à l'équipe de suivi.",
}

NEXT_STATUS_EXPLANATION = {
    SpendingRequest.Status.AWAITING_PEER_REVIEW: "Une fois votre brouillon terminé, vous pouvez le valider ci-dessous. Avant qu'il ne soit transmis à l'équipe de suivi des questions financières, il devra d'abord être validé par un·e autre gestionnaire financier de votre groupe.",
    SpendingRequest.Status.AWAITING_ADMIN_REVIEW: {
        SpendingRequest.Status.AWAITING_PEER_REVIEW: "Cette demande a déjà été validée par une personne. Pour permettre sa transmission, elle doit encore être validée par un·e deuxième gestionnaire.",
        SpendingRequest.Status.AWAITING_SUPPLEMENTARY_INFORMATION: "Lorsque vous aurez intégré les modifications demandées, vous pourrez de nouveau transmettre cette demande à l'équipe de suivi.",
    },
    SpendingRequest.Status.TO_PAY: "L'allocation de votre groupe est maintenant suffisante pour permettre le paiement de cette demande.",
}

NEXT_STATUS_ACTION = {
    SpendingRequest.Status.AWAITING_PEER_REVIEW: "Valider",
    SpendingRequest.Status.AWAITING_ADMIN_REVIEW: "Transmettre",
    SpendingRequest.Status.TO_PAY: "Demander le paiement",
}


def get_missing_field_error_message(spending_request):
    missing_fields = get_spending_request_field_labels(spending_request.missing_fields)

    if not missing_fields and spending_request.is_valid_amount:
        return None

    message = ""

    if not spending_request.is_valid_amount:
        message += "Il n'est possible d'effectuer une demande que pour un montant inférieur ou égal au solde disponible. "

    if missing_fields:
        message = ngettext(
            f"Le champ suivant est obligatoire pour la validation : {missing_fields[0]}.",
            f"Les champs suivants sont obligatoires pour la validation : {', '.join(missing_fields)}.",
            len(missing_fields),
        )

    return message.strip()


def get_revision_comment(from_status, to_status=None, person=None):
    """Renvoie un commentaire qui décrit le type d'opération en fonction des seuls statuts de départ et d'arrivée

    Cette fonction est destinée à être utilisée pour de l'affichage dans l'admin.
    """
    # cas spécifique : si on revient à "attente d'informations supplémentaires suite à une modification par un non admin
    # c'est forcément une modification
    if (
        person
        and to_status == SpendingRequest.Status.AWAITING_SUPPLEMENTARY_INFORMATION
    ):
        return "Mise à jour de la demande"

    if not to_status or from_status == to_status:
        return "Mise à jour de la demande"

    # some couples (from_status, to_status)
    if (from_status, to_status) in SpendingRequest.HISTORY_MESSAGES:
        return SpendingRequest.HISTORY_MESSAGES[(from_status, to_status)]

    return SpendingRequest.HISTORY_MESSAGES.get(
        to_status, "[Modification non identifiée]"
    )


def get_action_label(spending_request, user):
    next_status = spending_request.next_status(user)

    if not next_status:
        return None

    return NEXT_STATUS_ACTION.get(next_status, None)


def get_status_explanation(spending_request, user):
    current_status = spending_request.status
    next_status = spending_request.next_status(user)

    if next_status and NEXT_STATUS_EXPLANATION.get(next_status, None):
        if isinstance(NEXT_STATUS_EXPLANATION[next_status], dict):
            if NEXT_STATUS_EXPLANATION[next_status].get(current_status, None):
                return NEXT_STATUS_EXPLANATION[next_status][current_status]
        else:
            return NEXT_STATUS_EXPLANATION[next_status]

    explanation = ""
    if not spending_request.ready_for_review:
        explanation = NOT_READY_FOR_REVIEW_STATUS_EXPLANATION.get(current_status, "")

    if not explanation and STATUS_EXPLANATION.get(current_status, None):
        explanation = STATUS_EXPLANATION[current_status]

    if (
        spending_request.timing == SpendingRequest.Timing.UPCOMING
        and spending_request.status
        in [SpendingRequest.Status.TO_PAY, SpendingRequest.Status.PAID]
    ):
        explanation = (
            f"{explanation}\n\n⚠ Attention : une fois le paiement effectué, vous devrez ajouter la facture aux pièces "
            f"justificatives de la demande pour la finaliser."
        )

    if spending_request.missing_fields:
        explanation = (
            f"{explanation}\n\n✎ {get_missing_field_error_message(spending_request)}"
        )

    return explanation


def get_spending_request_field_label(field):
    if field in ("attachments", "documents"):
        return "Pièces justificatives"

    if field == "bank_account_full_name":
        return "Titulaire du compte bancaire"

    try:
        model_field = SpendingRequest._meta.get_field(field)
    except FieldDoesNotExist:
        return field

    if field == "category_precision":
        return f"{model_field.verbose_name} (champ obsolète)"

    label = str(model_field.verbose_name if model_field else field)
    return label[0].upper() + label[1:]


def get_spending_request_field_labels(fields, join=False):
    fields = [get_spending_request_field_label(field) for field in fields]
    if not join:
        return fields
    return ", ".join(fields)


def schedule_validation_notifications(spending_request, user=None, **kwargs):
    person_pk = (
        user.person.pk
        if user and user.is_authenticated and user.person is not None
        else None
    )

    spending_request_notify_group_managers.delay(
        spending_request.pk,
        person_pk=person_pk,
        **kwargs,
    )

    if spending_request.status == SpendingRequest.Status.AWAITING_ADMIN_REVIEW:
        spending_request_notify_admin.delay(
            spending_request.pk,
            person_pk=person_pk,
            **kwargs,
        )


def validate_action(spending_request, user):
    """Valide la requête pour vérification pour l'administration, ou confirme la demande de paiement

    :param spending_request:
    :param user:
    :return: whether the spending request was successfully sent for review
    """
    current_status = spending_request.status
    next_status = spending_request.next_status(user)

    if not next_status:
        return False

    with reversion.create_revision(atomic=True):
        reversion.set_comment(
            get_revision_comment(spending_request.status, next_status, user.person)
        )
        reversion.set_user(user)

        spending_request.status = next_status
        spending_request.save()
        if spending_request.status == SpendingRequest.Status.TO_PAY:
            # si les fonds ne sont pas disponibles, on ne peut pas progresser vers ce statut
            if spending_request.amount > get_supportgroup_balance(
                spending_request.group
            ):
                return False

            # l'argent est engagé, on crée l'opération.
            spending_request.account_operation = AccountOperation.objects.create(
                amount=-spending_request.amount,
                source=get_account_name_for_group(spending_request.group),
                destination=SPENDING_ACCOUNT,
            )

        schedule_validation_notifications(
            spending_request,
            to_status=next_status,
            from_status=current_status,
            user=user,
        )

        return True
