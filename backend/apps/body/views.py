from datetime import date, timedelta
from decimal import Decimal
from django.db.models import Avg
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import BodyWeight, BodyMeasurement, BodyPhoto
from .serializers import (
    BodyWeightSerializer, BodyWeightStatsSerializer,
    BodyMeasurementSerializer, BodyPhotoSerializer,
)


class BodyWeightViewSet(viewsets.ModelViewSet):
    serializer_class = BodyWeightSerializer

    def get_queryset(self):
        return BodyWeight.objects.filter(user=self.request.user)

    @action(detail=False, methods=["get"])
    def stats(self, request):
        qs = self.get_queryset().order_by("-date")

        latest = qs.first()
        previous = qs[1] if qs.count() >= 2 else None

        current = Decimal(str(latest.weight_kg)) if latest else None
        prev_weight = Decimal(str(previous.weight_kg)) if previous else None

        days_since = (latest.date - previous.date).days if latest and previous else None

        data = {
            "current": current,
            "previous": prev_weight,
            "change": (current - prev_weight) if current and prev_weight else None,
            "days_since": days_since,
        }
        return Response(data)


class BodyMeasurementViewSet(viewsets.ModelViewSet):
    serializer_class = BodyMeasurementSerializer

    def get_queryset(self):
        return BodyMeasurement.objects.filter(user=self.request.user)


class BodyPhotoViewSet(viewsets.ModelViewSet):
    serializer_class = BodyPhotoSerializer

    def get_queryset(self):
        return BodyPhoto.objects.filter(user=self.request.user)
