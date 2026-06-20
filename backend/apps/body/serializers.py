from rest_framework import serializers
from .models import BodyWeight, BodyMeasurement, BodyPhoto


class BodyWeightSerializer(serializers.ModelSerializer):
    class Meta:
        model = BodyWeight
        fields = ["id", "date", "weight_kg", "notes"]
        read_only_fields = ["id"]

    def create(self, validated_data):
        validated_data["user"] = self.context["request"].user
        instance, _ = BodyWeight.objects.update_or_create(
            user=validated_data["user"],
            date=validated_data["date"],
            defaults={"weight_kg": validated_data["weight_kg"], "notes": validated_data.get("notes", "")},
        )
        return instance


class BodyWeightStatsSerializer(serializers.Serializer):
    current = serializers.DecimalField(max_digits=5, decimal_places=2, allow_null=True)
    change_7d = serializers.DecimalField(max_digits=5, decimal_places=2, allow_null=True)
    change_30d = serializers.DecimalField(max_digits=5, decimal_places=2, allow_null=True)
    weekly_avg = serializers.DecimalField(max_digits=5, decimal_places=2, allow_null=True)
    monthly_avg = serializers.DecimalField(max_digits=5, decimal_places=2, allow_null=True)


class BodyMeasurementSerializer(serializers.ModelSerializer):
    class Meta:
        model = BodyMeasurement
        fields = ["id", "date", "arm_cm", "chest_cm", "waist_cm", "leg_cm", "shoulder_cm", "notes"]
        read_only_fields = ["id"]

    def create(self, validated_data):
        validated_data["user"] = self.context["request"].user
        instance, _ = BodyMeasurement.objects.update_or_create(
            user=validated_data["user"],
            date=validated_data["date"],
            defaults={k: v for k, v in validated_data.items() if k not in ("user", "date")},
        )
        return instance


class BodyPhotoSerializer(serializers.ModelSerializer):
    photo_url = serializers.SerializerMethodField()

    class Meta:
        model = BodyPhoto
        fields = ["id", "date", "photo", "photo_url", "notes"]
        read_only_fields = ["id", "photo_url"]
        extra_kwargs = {"photo": {"write_only": True}}

    def get_photo_url(self, obj):
        request = self.context.get("request")
        if obj.photo and request:
            return request.build_absolute_uri(obj.photo.url)
        return None

    def create(self, validated_data):
        validated_data["user"] = self.context["request"].user
        return super().create(validated_data)
