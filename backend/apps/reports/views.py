from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import WeeklyReport
from .serializers import WeeklyReportSerializer
from .tasks import generate_weekly_report


class WeeklyReportViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = WeeklyReportSerializer

    def get_queryset(self):
        return WeeklyReport.objects.filter(user=self.request.user)

    @action(detail=False, methods=["post"])
    def generate(self, request):
        generate_weekly_report.delay(request.user.id)
        return Response({"status": "Generando informe..."})
