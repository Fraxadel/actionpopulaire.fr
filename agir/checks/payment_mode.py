from django.utils.functional import cached_property
from django.views.generic import RedirectView

from agir.checks.views import CheckView
from ..payments.abstract_payment_mode import AbstractPaymentMode
from agir.lib.utils import front_url


class PaymentCheckView(RedirectView):
    def get_redirect_url(self, *args, **kwargs):
        id = getattr(self.kwargs["payment"], "id")
        return front_url("payment_check_page", kwargs={"pk": id})


class AbstractCheckPaymentMode(AbstractPaymentMode):
    can_retry = True
    can_cancel = True
    can_admin = True

    title = "Votre paiement par chèque"
    category = "check"
    label = "Par chèque"
    order = None
    address = None
    additional_information = None
    warnings = [
        "N'oubliez pas d'indiquer le numéro au dos de votre chèque ! Seul celui-ci permettra de traiter votre chèque"
        " dans les meilleurs délais."
    ]

    def __init__(self):
        self.view = CheckView.as_view(
            title=self.title,
            order=self.order,
            address=self.address,
            additional_information=self.additional_information,
            warnings=self.warnings,
        )

    @cached_property
    def payment_view(self):
        return PaymentCheckView.as_view()

    @cached_property
    def retry_payment_view(self):
        return self.view
