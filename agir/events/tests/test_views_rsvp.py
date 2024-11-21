from unittest import mock

from django.contrib import messages
from django.test import TestCase
from django.utils import timezone
from rest_framework import status
from rest_framework.reverse import reverse

from agir.lib.utils import front_url
from agir.payments.actions.payments import complete_payment, redirect_to_payment
from agir.payments.models import Payment
from agir.people.models import Person, PersonForm, PersonFormSubmission, PersonTag
from ..models import (
    Event,
    RSVP,
)
from ..views import notification_listener as event_notification_listener


class RSVPTestCase(TestCase):
    # TODO: refactor this test case... too big
    def setUp(self):
        self.person = Person.objects.create_insoumise("test@test.com", create_role=True)
        self.already_rsvped = Person.objects.create_insoumise(
            "test2@test.com", create_role=True
        )

        self.now = now = timezone.now().astimezone(timezone.get_default_timezone())
        day = timezone.timedelta(days=1)
        hour = timezone.timedelta(hours=1)

        self.simple_event = Event.objects.create(
            name="Simple Event",
            start_time=now + 3 * day,
            end_time=now + 3 * day + 4 * hour,
        )

        person_form_kwargs = {
            "title": "Formulaire événement",
            "slug": "formulaire-evenement",
            "description": "Ma description complexe",
            "confirmation_note": "Ma note de fin",
            "main_question": "QUESTION PRINCIPALE",
            "custom_fields": [
                {
                    "title": "Détails",
                    "fields": [
                        {
                            "id": "custom-field",
                            "type": "short_text",
                            "label": "Mon label",
                            "person_field": True,
                        },
                        {
                            "id": "price",
                            "type": "integer",
                            "label": "Prix",
                            "required": False,
                        },
                    ],
                }
            ],
        }
        self.subscription_form = PersonForm.objects.create(**person_form_kwargs)
        self.subscription_form2 = PersonForm.objects.create(
            **{**person_form_kwargs, "slug": "formulaire-evenement2"}
        )
        self.form_event = Event.objects.create(
            name="Other event",
            start_time=now + 3 * day,
            end_time=now + 3 * day + 4 * hour,
            subscription_form=self.subscription_form,
        )

        self.simple_paying_event = Event.objects.create(
            name="Paying event",
            start_time=now + 10 * day,
            end_time=now + 10 * day + 4 * hour,
            payment_parameters={"price": 1000},
        )

        self.form_paying_event = Event.objects.create(
            name="Paying event",
            start_time=now + 10 * day,
            end_time=now + 10 * day + 4 * hour,
            payment_parameters={"price": 1000},
            subscription_form=self.subscription_form2,
        )

        RSVP.objects.create(person=self.already_rsvped, event=self.simple_event)
        RSVP.objects.create(
            person=self.already_rsvped,
            event=self.form_event,
            form_submission=PersonFormSubmission.objects.create(
                person=self.already_rsvped,
                form=self.subscription_form,
                data={"custom-field": "custom value"},
            ),
        )
        RSVP.objects.create(person=self.already_rsvped, event=self.simple_paying_event)
        RSVP.objects.create(
            person=self.already_rsvped,
            event=self.form_paying_event,
            form_submission=PersonFormSubmission.objects.create(
                person=self.already_rsvped,
                form=self.subscription_form,
                data={"custom-field": "custom value"},
            ),
        )

        self.billing_information = {
            "first_name": "Marc",
            "last_name": "Frank",
            "location_address1": "4 rue de Chaume",
            "location_address2": "",
            "location_zip": "33000",
            "location_city": "Bordeaux",
            "location_country": "FR",
            "contact_phone": "06 45 78 98 45",
        }

    @mock.patch("agir.events.actions.rsvps.send_rsvp_notification")
    def test_can_rsvp_not_logged_and_form_allow_anonymous(self, rsvp_notification):
        self.subscription_form.unauthorized_message = "SENTINEL"
        self.subscription_form.allow_anonymous = True
        self.subscription_form.save()

        form_url = reverse(
            "view_person_form", kwargs={"slug": self.subscription_form.slug}
        )

        response = self.client.get(form_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertNotContains(response, "SENTINEL")
        self.assertIn("form", response.context_data)

        response = self.client.post(
            form_url, data={"custom-field": "another custom value"}
        )

        self.assertRedirects(
            response,
            reverse(
                "person_form_confirmation", kwargs={"slug": self.subscription_form.slug}
            ),
        )

    @mock.patch("agir.events.actions.rsvps.send_rsvp_notification")
    def test_can_rsvp_not_logged_and_form_allow_anonymous_from_rsvp_event(
        self, rsvp_notification
    ):
        self.subscription_form.unauthorized_message = "SENTINEL"
        self.subscription_form.allow_anonymous = True
        self.subscription_form.save()

        rsvp_url = reverse("rsvp_event", kwargs={"pk": self.form_event.pk})

        response = self.client.get(rsvp_url)
        self.assertEqual(response.status_code, status.HTTP_302_FOUND)
        redirect_url = response.headers.get("Location")
        self.assertEqual(
            redirect_url,
            reverse("view_person_form", kwargs={"slug": self.subscription_form.slug}),
        )
        response = self.client.get(redirect_url)
        self.assertNotContains(response, "SENTINEL")
        self.assertIn("form", response.context_data)

        response = self.client.post(
            redirect_url, data={"custom-field": "another custom value"}
        )

        self.assertRedirects(
            response,
            reverse(
                "person_form_confirmation", kwargs={"slug": self.subscription_form.slug}
            ),
        )

    @mock.patch("agir.events.actions.rsvps.send_rsvp_notification")
    def test_can_rsvp_logged_and_form_allow_anonymous(self, rsvp_notification):
        self.subscription_form.unauthorized_message = "SENTINEL"
        self.subscription_form.allow_anonymous = True
        self.subscription_form.save()

        self.client.force_login(self.person.role)

        rsvp_url = reverse("rsvp_event", kwargs={"pk": self.form_event.pk})

        response = self.client.get(rsvp_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertNotContains(response, "SENTINEL")
        self.assertIn("form", response.context_data)

        response = self.client.post(
            rsvp_url, data={"custom-field": "another custom value"}
        )

        self.assertRedirects(response, rsvp_url)
        msgs = list(messages.get_messages(response.wsgi_request))
        self.assertEqual(msgs[0].level, messages.SUCCESS)

    def test_can_view_rsvp(self):
        self.client.force_login(self.already_rsvped.role)

        url = reverse("api_event_details", kwargs={"pk": self.simple_event.pk})
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)
        self.assertEqual("CO", response.json()["rsvp"])
        self.assertEqual(1, self.simple_event.participants)

    def test_cannot_rsvp_if_max_participants_reached(self):
        self.client.force_login(self.person.role)

        self.simple_event.max_participants = 1
        self.simple_event.save()

        url = reverse("view_event", kwargs={"pk": self.simple_event.pk})

        # cannot view the RSVP button
        response = self.client.get(url)
        self.assertNotContains(response, "Participer à cet événement")

        # cannot rsvp even when posting the form
        response = self.client.post(
            reverse("rsvp_event", kwargs={"pk": self.simple_event.pk})
        )
        self.assertRedirects(response, url)
        msgs = list(messages.get_messages(response.wsgi_request))
        self.assertEqual(len(msgs), 1)
        self.assertEqual(msgs[0].level, messages.ERROR)
        self.assertIn("complet.", msgs[0].message)

        self.assertEqual(1, self.simple_event.participants)

    @mock.patch("agir.events.actions.rsvps.send_guest_confirmation")
    def test_can_add_guest_to_simple_event(self, guest_notification):
        self.client.force_login(self.already_rsvped.role)
        self.simple_event.allow_guests = True
        self.simple_event.save()

        response = self.client.post(
            reverse("rsvp_event", kwargs={"pk": self.simple_event.pk}),
            data={"guests": 1},
        )
        self.assertRedirects(
            response,
            reverse("rsvp_event", kwargs={"pk": self.simple_event.pk}),
            fetch_redirect_response=False,
        )
        self.assertEqual(2, self.simple_event.participants)

        msgs = list(messages.get_messages(response.wsgi_request))
        self.assertEqual(msgs[0].level, messages.SUCCESS)

        guest_notification.delay.assert_called_once()

        rsvp = RSVP.objects.get(person=self.already_rsvped, event=self.simple_event)
        self.assertEqual(guest_notification.delay.call_args[0][0], rsvp.pk)

    def test_cannot_add_guest_if_forbidden_for_event(self):
        self.client.force_login(self.already_rsvped.role)

        response = self.client.post(
            reverse("rsvp_event", kwargs={"pk": self.simple_event.pk}),
            data={"guests": 1},
        )

        self.assertRedirects(
            response, reverse("view_event", kwargs={"pk": self.simple_event.pk})
        )
        self.assertEqual(1, self.simple_event.participants)

        msgs = list(messages.get_messages(response.wsgi_request))
        self.assertEqual(msgs[0].level, messages.ERROR)

    def test_cannot_add_guest_for_simple_event_if_max_participants_reached(self):
        self.client.force_login(self.already_rsvped.role)

        self.simple_event.allow_guests = True
        self.simple_event.max_participants = 1
        self.simple_event.save()

        response = self.client.post(
            reverse("rsvp_event", kwargs={"pk": self.simple_event.pk}),
            data={"guests": 1},
        )

        self.assertRedirects(
            response, reverse("view_event", kwargs={"pk": self.simple_event.pk})
        )
        self.assertEqual(1, self.simple_event.participants)

        msgs = list(messages.get_messages(response.wsgi_request))
        self.assertEqual(msgs[0].level, messages.ERROR)

    @mock.patch("agir.events.actions.rsvps.send_rsvp_notification")
    def test_can_rsvp_to_form_event(self, rsvp_notification):
        self.client.force_login(self.person.role)

        rsvp_url = reverse("rsvp_event", kwargs={"pk": self.form_event.pk})

        response = self.client.get(rsvp_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        response = self.client.post(
            rsvp_url, data={"custom-field": "another custom value"}
        )
        self.assertRedirects(response, rsvp_url)
        msgs = list(messages.get_messages(response.wsgi_request))
        self.assertEqual(msgs[0].level, messages.SUCCESS)

        self.person.refresh_from_db()
        self.assertIn(self.person, self.form_event.confirmed_attendees)
        self.assertEqual(self.person.meta["custom-field"], "another custom value")
        self.assertEqual(2, self.form_event.participants)

        rsvp_notification.delay.assert_called_once()

        rsvp = RSVP.objects.get(person=self.person, event=self.form_event)
        self.assertEqual(rsvp_notification.delay.call_args[0][0], rsvp.pk)

    def test_can_edit_rsvp_form(self):
        self.client.force_login(self.person.role)

        rsvp_url = reverse("rsvp_event", kwargs={"pk": self.form_event.pk})
        self.client.post(rsvp_url, data={"custom-field": "another custom value"})

        res = self.client.get(rsvp_url)
        self.assertNotContains(res, "Modifier mon inscription")

        self.form_event.subscription_form.editable = True
        self.form_event.subscription_form.save()
        res = self.client.get(rsvp_url)
        self.assertContains(res, "Modifier ces informations")

    @mock.patch("agir.events.actions.rsvps.send_guest_confirmation")
    def test_can_add_guest_to_form_event(self, guest_confirmation):
        self.form_event.allow_guests = True
        self.form_event.save()

        self.form_event.subscription_form.editable = True
        self.form_event.subscription_form.save()

        self.client.force_login(self.already_rsvped.role)

        rsvp_url = reverse("rsvp_event", kwargs={"pk": self.form_event.pk})

        response = self.client.get(rsvp_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        response = self.client.post(
            rsvp_url, data={"custom-field": "another custom value", "is_guest": "yes"}
        )
        self.assertRedirects(response, rsvp_url)
        msgs = list(messages.get_messages(response.wsgi_request))
        self.assertEqual(msgs[0].level, messages.SUCCESS)

        self.assertEqual(2, self.form_event.participants)

        guest_confirmation.delay.assert_called_once()

        rsvp = RSVP.objects.get(person=self.already_rsvped, event=self.form_event)
        self.assertNotEqual(
            rsvp.form_submission_id, rsvp.identified_guests.first().submission_id
        )
        self.assertEqual(guest_confirmation.delay.call_args[0][0], rsvp.pk)

    def test_cannot_add_guest_to_form_event_if_forbidden(self):
        self.client.force_login(self.already_rsvped.role)

        event_url = reverse("view_event", kwargs={"pk": self.form_event.pk})
        rsvp_url = reverse("rsvp_event", kwargs={"pk": self.form_event.pk})

        response = self.client.post(
            rsvp_url, data={"custom-field": "another custom value", "is_guest": "yes"}
        )
        self.assertRedirects(response, event_url)
        msgs = list(messages.get_messages(response.wsgi_request))
        self.assertEqual(msgs[0].level, messages.ERROR)

        self.assertEqual(1, self.form_event.participants)

    @mock.patch("agir.events.actions.rsvps.send_rsvp_notification")
    def test_can_rsvp_to_simple_paying_event(self, send_rsvp_notification):
        self.client.force_login(self.person.role)

        response = self.client.post(
            reverse("rsvp_event", args=[self.simple_paying_event.pk])
        )
        self.assertRedirects(response, reverse("pay_event"))

        response = self.client.get(reverse("pay_event"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertContains(
            response, f'name="event" value="{self.simple_paying_event.pk}"'
        )
        self.assertContains(response, 'name="submission"')
        self.assertNotContains(response, 'name="submission" value')
        self.assertContains(response, f'name="is_guest" value="False"')

        response = self.client.post(
            reverse("pay_event"),
            data={
                "event": self.simple_paying_event.pk,
                "payment_mode": "check_events",
                **self.billing_information,
            },
        )

        payment = Payment.objects.get()
        self.assertRedirects(response, front_url("payment_page", args=(payment.pk,)))

        # fake payment confirmation
        complete_payment(payment)
        event_notification_listener(payment)

        self.assertIn(self.person, self.simple_paying_event.confirmed_attendees)

        send_rsvp_notification.delay.assert_called_once()
        rsvp = RSVP.objects.get(person=self.person, event=self.simple_paying_event)
        self.assertEqual(send_rsvp_notification.delay.call_args[0], (rsvp.pk,))

    @mock.patch("agir.events.actions.rsvps.send_guest_confirmation")
    def test_can_add_guest_to_simple_paying_event(self, send_guest_confirmation):
        self.simple_paying_event.allow_guests = True
        self.simple_paying_event.save()
        self.client.force_login(self.already_rsvped.role)
        session = self.client.session

        response = self.client.post(
            reverse("rsvp_event", args=[self.simple_paying_event.pk])
        )
        # check that the guest status is well transfered
        self.assertEqual(session["is_guest"], True)
        self.assertRedirects(response, reverse("pay_event"))

        response = self.client.get(reverse("pay_event"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertContains(
            response, f'name="event" value="{self.simple_paying_event.pk}"'
        )
        self.assertContains(response, 'name="submission"')
        self.assertNotContains(response, 'name="submission" value')
        self.assertContains(response, f'name="is_guest" value="True"')

        response = self.client.post(
            reverse("pay_event"),
            data={
                "event": self.simple_paying_event.pk,
                "payment_mode": "check_events",
                "is_guest": "yes",
                **self.billing_information,
            },
        )

        payment = Payment.objects.get()
        self.assertRedirects(response, front_url("payment_page", args=(payment.pk,)))

        complete_payment(payment)
        event_notification_listener(payment)

        send_guest_confirmation.delay.assert_called_once()

        rsvp = RSVP.objects.get(
            person=self.already_rsvped, event=self.simple_paying_event
        )
        self.assertEqual(send_guest_confirmation.delay.call_args[0], (rsvp.pk,))

    @mock.patch("agir.events.actions.rsvps.send_rsvp_notification")
    def test_can_rsvp_to_form_paying_event(self, send_rsvp_notification):
        self.client.force_login(self.person.role)

        response = self.client.get(
            reverse("rsvp_event", args=[self.form_paying_event.pk])
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        response = self.client.post(
            reverse("rsvp_event", args=[self.form_paying_event.pk]),
            data={"custom-field": "my own custom value"},
        )
        self.assertRedirects(response, reverse("pay_event"))

        submission = PersonFormSubmission.objects.get(
            person=self.person, form=self.subscription_form2
        )

        response = self.client.get(reverse("pay_event"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertContains(
            response, f'name="event" value="{self.form_paying_event.pk}"'
        )
        self.assertContains(response, f'name="submission" value="{submission.pk}"')
        self.assertContains(response, f'name="is_guest" value="False"')

        response = self.client.post(
            reverse("pay_event"),
            data={
                "event": self.form_paying_event.pk,
                "submission": submission.pk,
                "payment_mode": "check_events",
                **self.billing_information,
            },
        )

        payment = Payment.objects.get()
        self.assertRedirects(response, front_url("payment_page", args=(payment.pk,)))

        # fake payment confirmation
        complete_payment(payment)
        event_notification_listener(payment)
        self.assertIn(self.person, self.form_paying_event.confirmed_attendees)

        send_rsvp_notification.delay.assert_called_once()
        rsvp = RSVP.objects.get(person=self.person, event=self.form_paying_event)
        self.assertEqual(send_rsvp_notification.delay.call_args[0], (rsvp.pk,))

        response = self.client.get(
            reverse("rsvp_event", args=[self.form_paying_event.pk])
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertContains(response, "my own custom value")

    @mock.patch("agir.events.actions.rsvps.send_guest_confirmation")
    def test_can_add_guest_to_form_paying_event(self, send_guest_confirmation):
        self.form_paying_event.allow_guests = True
        self.form_paying_event.save()
        self.client.force_login(self.already_rsvped.role)

        # obligé de faire ça pour que la session soit préservée
        session = self.client.session

        response = self.client.get(
            reverse("rsvp_event", args=[self.form_paying_event.pk])
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        response = self.client.post(
            reverse("rsvp_event", args=[self.form_paying_event.pk]),
            data={"custom-field": "my guest custom value", "is_guest": "yes"},
        )
        self.assertRedirects(response, reverse("pay_event"))

        submission = PersonFormSubmission.objects.filter(
            person=self.already_rsvped
        ).latest("created")

        response = self.client.get(reverse("pay_event"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertContains(
            response, f'name="event" value="{self.form_paying_event.pk}"'
        )
        self.assertContains(response, f'name="submission" value="{submission.pk}"')
        self.assertContains(response, f'name="is_guest" value="True"')

        response = self.client.post(
            reverse("pay_event"),
            data={
                "event": self.form_paying_event.pk,
                "submission": submission.pk,
                "payment_mode": "check_events",
                "is_guest": "yes",
                **self.billing_information,
            },
        )

        payment = Payment.objects.get()
        self.assertRedirects(response, front_url("payment_page", args=(payment.pk,)))

        complete_payment(payment)
        event_notification_listener(payment)

        self.assertEqual(2, self.form_paying_event.participants)

        send_guest_confirmation.delay.assert_called_once()

        rsvp = RSVP.objects.get(
            person=self.already_rsvped, event=self.form_paying_event
        )
        self.assertEqual(send_guest_confirmation.delay.call_args[0], (rsvp.pk,))

        response = self.client.get(
            reverse("rsvp_event", args=[self.form_paying_event.pk])
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertContains(response, "my guest custom value")

    def test_can_retry_payment_on_rsvp(self):
        self.client.force_login(self.person.role)

        self.client.post(reverse("rsvp_event", args=[self.simple_paying_event.pk]))
        response = self.client.post(
            reverse("pay_event"),
            data={
                "event": self.simple_paying_event.pk,
                "payment_mode": "system_pay",
                **self.billing_information,
            },
        )

        payment = Payment.objects.get()
        self.assertRedirects(response, front_url("payment_page", args=[payment.pk]))

        response = self.client.get(reverse("payment_retry", args=[payment.pk]))
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_cannot_rsvp_if_not_authorized_for_form(self):
        tag = PersonTag.objects.create(label="tag")
        self.subscription_form.required_tags.add(tag)
        self.subscription_form.unauthorized_message = "SENTINEL"
        self.subscription_form.save()

        self.client.force_login(self.person.role)

        event_url = reverse("view_event", kwargs={"pk": self.form_event.pk})
        rsvp_url = reverse("rsvp_event", kwargs={"pk": self.form_event.pk})

        response = self.client.get(rsvp_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertContains(response, "SENTINEL")

        response = self.client.post(
            rsvp_url, data={"custom-field": "another custom value"}
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertNotIn("form", response.context_data)

    @mock.patch("agir.events.actions.rsvps.send_rsvp_notification")
    def test_can_rsvp_if_authorized_for_form(self, rsvp_notification):
        tag = PersonTag.objects.create(label="tag")
        self.person.tags.add(tag)
        self.subscription_form.required_tags.add(tag)
        self.subscription_form.unauthorized_message = "SENTINEL"
        self.subscription_form.save()

        self.client.force_login(self.person.role)

        rsvp_url = reverse("rsvp_event", kwargs={"pk": self.form_event.pk})

        response = self.client.get(rsvp_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertNotContains(response, "SENTINEL")
        self.assertIn("form", response.context_data)

        response = self.client.post(
            rsvp_url, data={"custom-field": "another custom value"}
        )
        self.assertRedirects(response, rsvp_url)
        msgs = list(messages.get_messages(response.wsgi_request))
        self.assertEqual(msgs[0].level, messages.SUCCESS)

        self.person.refresh_from_db()
        self.assertIn(self.person, self.form_event.confirmed_attendees)
        self.assertEqual(self.person.meta["custom-field"], "another custom value")
        self.assertEqual(2, self.form_event.participants)

        rsvp_notification.delay.assert_called_once()

        rsvp = RSVP.objects.get(person=self.person, event=self.form_event)
        self.assertEqual(rsvp_notification.delay.call_args[0], (rsvp.pk,))

    def test_cannot_rsvp_if_form_is_closed(self):
        self.client.force_login(self.person.role)
        self.form_event.subscription_form.end_time = (
            timezone.now() - timezone.timedelta(days=1)
        )
        self.form_event.subscription_form.save()

        res = self.client.get(reverse("rsvp_event", kwargs={"pk": self.form_event.pk}))
        self.assertContains(res, "Ce formulaire est maintenant fermé.")

        res = self.client.post(
            reverse("rsvp_event", kwargs={"pk": self.form_event.pk}),
            data={"custom-field": "another custom value"},
        )
        self.assertContains(res, "Ce formulaire est maintenant fermé.")

    def test_cannot_rsvp_if_form_is_yet_to_open(self):
        self.client.force_login(self.person.role)
        self.form_event.subscription_form.start_time = (
            timezone.now() + timezone.timedelta(days=1)
        )
        self.form_event.subscription_form.save()

        res = self.client.get(reverse("rsvp_event", kwargs={"pk": self.form_event.pk}))
        self.assertContains(res, "est pas encore ouvert.")

        res = self.client.post(
            reverse("rsvp_event", kwargs={"pk": self.form_event.pk}),
            data={"custom-field": "another custom value"},
        )
        self.assertContains(res, "est pas encore ouvert.")

    @mock.patch("agir.events.actions.rsvps.send_rsvp_notification")
    def test_not_billed_if_free_pricing_to_zero(self, rsvp_notification):
        self.client.force_login(self.person.role)

        self.form_event.payment_parameters = {"free_pricing": "price"}
        self.form_event.save()

        event_url = reverse("view_event", kwargs={"pk": self.form_event.pk})
        rsvp_url = reverse("rsvp_event", kwargs={"pk": self.form_event.pk})

        response = self.client.get(rsvp_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        response = self.client.post(
            rsvp_url, data={"custom-field": "another custom value", "price": "0"}
        )
        self.assertRedirects(response, rsvp_url)
        msgs = list(messages.get_messages(response.wsgi_request))
        self.assertEqual(msgs[0].level, messages.SUCCESS)

        self.person.refresh_from_db()
        self.assertIn(self.person, self.form_event.confirmed_attendees)
        self.assertEqual(self.person.meta["custom-field"], "another custom value")
        self.assertEqual(2, self.form_event.participants)

        rsvp_notification.delay.assert_called_once()

        rsvp = RSVP.objects.get(person=self.person, event=self.form_event)
        self.assertEqual(rsvp_notification.delay.call_args[0], (rsvp.pk,))
