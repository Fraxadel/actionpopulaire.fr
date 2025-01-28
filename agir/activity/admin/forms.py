from django import forms

from agir.activity.models_banner_announcement import BannerAnnouncementAnswerTag
from agir.people.models import PersonTag


class BannerAnnouncementForm(forms.ModelForm):

    def _save_m2m(self):
        super()._save_m2m()
        associated_answers_tags = self.instance.associated_answers_tags.all()

        ids_to_remove = [
            associated.id
            for associated in associated_answers_tags
            if associated.answer.id
            not in [answer.id for answer in self.cleaned_data.get("answers")]
        ]
        for id_to_remove in ids_to_remove:
            self.instance.associated_answers_tags.remove(id_to_remove)

        answer_ids = [
            associated.answer.id
            for associated in self.instance.associated_answers_tags.all()
        ]
        for answer in self.cleaned_data.get("answers"):
            if answer.id not in answer_ids:
                answer_slug = self.instance.answer_to_slug(answer.name)
                created_tag, _ = PersonTag.objects.get_or_create(label=answer_slug)
                associated_answer_tag, _ = (
                    BannerAnnouncementAnswerTag.objects.get_or_create(
                        answer=answer, tag=created_tag
                    )
                )
                self.instance.associated_answers_tags.add(associated_answer_tag)
