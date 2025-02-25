from django.http import HttpResponse
from django.utils.safestring import mark_safe

from agir.groups.models import SupportGroup
from agir.groups.utils.certification import check_certification_criteria
from django.shortcuts import get_object_or_404, render

from django.urls import reverse

from django.utils.html import format_html, escape, format_html_join


def group_criteria_view(request, pk):
    group = SupportGroup.objects.get(pk=pk)
    criteria = check_certification_criteria(group, with_labels=True)
    return render(
        request, "admin/supportgroups/criteria.html", {"criterion": criteria.items()}
    )


def warning_date_view(request, pk):
    group = SupportGroup.objects.get(pk=pk)
    warning_date = group.uncertifiable_warning_date
    content = "-"
    if warning_date:
        content = group.uncertifiable_warning_date.strftime("%-d %B %Y")

    return HttpResponse(content, content_type="text/plain")


def group_referents_view(request, pk):
    group = SupportGroup.objects.get(pk=pk)
    referents = group.referents

    content = "-"

    if referents:
        content = mark_safe(
            "<br/>".join(
                [
                    '<a style="white-space: nowrap;" href="%s" title="%s">%s %s</a>'
                    % (
                        reverse("admin:people_person_change", args=(person.id,)),
                        escape(person.display_name),
                        escape(person.email),
                        f"({person.gender})" if person.gender else "",
                    )
                    for person in referents
                ]
            )
        )
    return HttpResponse(content, content_type="text/plain")
