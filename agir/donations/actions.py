import datetime

import pandas as pd
from dateutil.relativedelta import relativedelta
from django.conf import settings
from django.utils import timezone

from agir.payments.models import Subscription, Payment
from agir.people.models import Person


def monthly_to_single_time_contribution(
    data,
):
    # on considère un an de paiement pour un paiement mensuel
    multiplier = 12
    data["amount"] *= 12
    if data.get("allocations"):
        data["allocations"] = [
            {**allocation, "amount": allocation["amount"] * 12}
            for allocation in data.get("allocations")
        ]

    return data


def single_time_to_monthly_contribution(data, from_date):
    # The multiplier is the number of month ends between today and the end date
    multiplier = len(
        pd.date_range(
            start=from_date,
            end=data.get("endDate"),
            freq="MS",
        )
    )
    data["amount"] /= multiplier
    if data.get("allocations"):
        data["allocations"] = [
            {**allocation, "amount": allocation["amount"] / multiplier}
            for allocation in data.get("allocations")
        ]

    return data


def existing_monthly_payment(person_or_email=None):
    from agir.donations.apps import DonsConfig

    MONTHLY_DONATIONS_TYPE = [
        DonsConfig.MONTHLY_DONATION_TYPE,
        DonsConfig.CONTRIBUTION_TYPE,
    ]

    if isinstance(person_or_email, str):
        try:
            person_or_email = Person.objects.get_by_natural_key(email=person_or_email)
        except Person.DoesNotExist:
            person_or_email = None

    if not person_or_email:
        return None

    # on renvoie la moins chère des souscriptions actives
    return (
        Subscription.objects.active()
        .filter(person=person_or_email, type__in=MONTHLY_DONATIONS_TYPE)
        .order_by("price")
        .first()
    )


def get_contribution_end_date(contribution):
    end_date = None

    if isinstance(contribution, Subscription):
        end_date = contribution.end_date

    if isinstance(contribution, Payment):
        end_date = contribution.meta.get("end_date", None)
        end_date = end_date and datetime.datetime.strptime(end_date, "%Y-%m-%d").date()

    return end_date


def is_renewable_contribution(contribution):
    renewal_start = (
        timezone.now()
        + relativedelta(months=settings.CONTRIBUTION_MONTHS_BEFORE_END_RENEWAL_START)
    ).date()

    end_date = get_contribution_end_date(contribution)

    if not end_date:
        return False

    return end_date <= renewal_start


def is_waiting_contribution(contribution):
    return (
        isinstance(contribution, Payment)
        and contribution.status == Payment.STATUS_WAITING
    )


def can_make_contribution(email=None, person=None):
    if not email and not person:
        return False

    if not person:
        try:
            person = Person.objects.get_by_natural_key(email)
        except Person.DoesNotExist:
            return True

    active_contribution = existing_monthly_payment(person)

    return active_contribution is None or is_renewable_contribution(active_contribution)
