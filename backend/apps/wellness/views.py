from rest_framework import viewsets
from .models import WellnessLog
from .serializers import WellnessLogSerializer


class WellnessLogViewSet(viewsets.ModelViewSet):
    serializer_class = WellnessLogSerializer

    def get_queryset(self):
        return WellnessLog.objects.filter(user=self.request.user)
