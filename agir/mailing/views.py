from django.shortcuts import get_object_or_404, render

from agir.mailing.models import Segment


def subscriber_count_view(request, pk):
    segment = get_object_or_404(Segment, id=pk)
    return render(request, "admin/subscriber_count.html", {"segment": segment})


def people_count_view(request, pk):
    segment = get_object_or_404(Segment, id=pk)
    return render(request, "admin/people_count.html", {"segment": segment})
