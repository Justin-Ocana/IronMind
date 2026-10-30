from rest_framework import serializers
from .models import Routine, TrainingDay, RoutineExercise, ExerciseTarget
from apps.exercises.serializers import ExerciseSerializer


class ExerciseTargetSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExerciseTarget
        fields = ["target_weight_kg", "sessions_at_current_weight", "stagnation_flag", "computed_at"]


class RoutineExerciseSerializer(serializers.ModelSerializer):
    exercise = ExerciseSerializer(read_only=True)
    exercise_id = serializers.IntegerField(write_only=True)
    target = ExerciseTargetSerializer(read_only=True)

    class Meta:
        model = RoutineExercise
        fields = [
            "id", "exercise", "exercise_id", "order", "sets",
            "rep_min", "rep_max", "rir_target", "rest_seconds",
            "progression_type", "increment_kg", "notes", "target",
        ]


class TrainingDaySerializer(serializers.ModelSerializer):
    exercises = RoutineExerciseSerializer(many=True, read_only=True)

    class Meta:
        model = TrainingDay
        fields = ["id", "day_of_week", "name", "is_rest", "order", "exercises"]


class RoutineSerializer(serializers.ModelSerializer):
    days = TrainingDaySerializer(many=True, read_only=True)

    class Meta:
        model = Routine
        fields = ["id", "name", "is_active", "days", "created_at"]
        read_only_fields = ["id", "created_at"]


class TodayScheduleSerializer(serializers.Serializer):
    has_workout = serializers.BooleanField()
    completed_today = serializers.BooleanField(default=False)
    training_day = TrainingDaySerializer(allow_null=True)
    routine_name = serializers.CharField(allow_null=True)
    week_number = serializers.IntegerField()
