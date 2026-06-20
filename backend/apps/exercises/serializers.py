from rest_framework import serializers
from .models import MuscleGroup, Exercise


class MuscleGroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = MuscleGroup
        fields = ["id", "name", "slug"]


class ExerciseSerializer(serializers.ModelSerializer):
    muscle_group = MuscleGroupSerializer(read_only=True)
    muscle_group_id = serializers.PrimaryKeyRelatedField(
        queryset=MuscleGroup.objects.all(), source="muscle_group", write_only=True
    )

    class Meta:
        model = Exercise
        fields = ["id", "name", "muscle_group", "muscle_group_id", "equipment", "is_custom", "notes"]
        read_only_fields = ["id", "is_custom"]

    def create(self, validated_data):
        validated_data["user"] = self.context["request"].user
        validated_data["is_custom"] = True
        return super().create(validated_data)
