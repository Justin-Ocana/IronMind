from rest_framework import serializers
from .models import WellnessLog


class WellnessLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = WellnessLog
        fields = ["id", "date", "sleep_hours", "energy_level", "pain_area", "pain_intensity", "notes"]
        read_only_fields = ["id"]

    def create(self, validated_data):
        validated_data["user"] = self.context["request"].user
        instance, _ = WellnessLog.objects.update_or_create(
            user=validated_data["user"],
            date=validated_data["date"],
            defaults={k: v for k, v in validated_data.items() if k not in ("user", "date")},
        )
        return instance
