from agir.groups.models import SupportGroup
from agir.groups.utils.certification import check_certification_criteria
from django.shortcuts import get_object_or_404, render


def group_criteria_view(request, pk):
    group = SupportGroup.objects.get(pk=pk)
    criteria = check_certification_criteria(group, with_labels=True)
    return render(
        request, "admin/supportgroups/criteria.html", {"criterion": criteria.items()}
    )
