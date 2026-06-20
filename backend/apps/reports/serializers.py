from rest_framework import serializers
from .models import WeeklyReport


class WeeklyReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = WeeklyReport
        fields = ["id", "week_number", "year", "generated_at", "data"]
        read_only_fields = ["id", "generated_at"]
