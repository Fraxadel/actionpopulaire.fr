from agir.api.settings import BLACK_LIST_DF
from django.core.exceptions import ValidationError


class BlackListFieldMixin:
    def clean(self):
        class_name = self.__class__.__name__
        for field in self._meta.fields:
            field_name = field.name
            if not field_allowed(
                class_name, field_name, str(getattr(self, field_name, "")).lower()
            ):
                raise ValidationError(
                    "Une erreur s'est produite lors de l'enregistrement.",
                    code="wrong",
                )


def clear_nan(df):
    for column in df.columns:
        df[column].dropna()


def field_allowed(model, field, value):
    attribute = f"{model}.{field}".lower()
    if attribute in BLACK_LIST_DF:
        result = BLACK_LIST_DF.loc[
            BLACK_LIST_DF[attribute].apply(lambda word: str(word).lower() in value)
        ]
        return len(result.index) == 0
    return True


clear_nan(BLACK_LIST_DF)
