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
        qs = self.get_queryset()
        today = date.today()

        latest = qs.first()
        week_ago = qs.filter(date__lte=today - timedelta(days=7)).first()
        month_ago = qs.filter(date__lte=today - timedelta(days=30)).first()
        weekly_avg = qs.filter(date__gte=today - timedelta(days=7)).aggregate(avg=Avg("weight_kg"))["avg"]
        monthly_avg = qs.filter(date__gte=today - timedelta(days=30)).aggregate(avg=Avg("weight_kg"))["avg"]

        current = Decimal(str(latest.weight_kg)) if latest else None
        data = {
            "current": current,
            "change_7d": (current - Decimal(str(week_ago.weight_kg))) if current and week_ago else None,
            "change_30d": (current - Decimal(str(month_ago.weight_kg))) if current and month_ago else None,
            "weekly_avg": Decimal(str(weekly_avg)).quantize(Decimal("0.01")) if weekly_avg else None,
            "monthly_avg": Decimal(str(monthly_avg)).quantize(Decimal("0.01")) if monthly_avg else None,
        }
        return Response(BodyWeightStatsSerializer(data).data)


class BodyMeasurementViewSet(viewsets.ModelViewSet):
    serializer_class = BodyMeasurementSerializer

    def get_queryset(self):
        return BodyMeasurement.objects.filter(user=self.request.user)


class BodyPhotoViewSet(viewsets.ModelViewSet):
    serializer_class = BodyPhotoSerializer

    def get_queryset(self):
        return BodyPhoto.objects.filter(user=self.request.user)
