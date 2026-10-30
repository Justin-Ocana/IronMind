from decimal import Decimal
from rest_framework import serializers
from .models import WorkoutSession, SetLog, PersonalRecord
from apps.exercises.serializers import ExerciseSerializer
from apps.progression.engine import ExerciseResult, SetResult, evaluate


class SetLogSerializer(serializers.ModelSerializer):
    exercise = ExerciseSerializer(read_only=True)
    exercise_id = serializers.IntegerField(write_only=True)
    routine_exercise_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    workout_session_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = SetLog
        fields = [
            "id", "exercise", "exercise_id", "routine_exercise_id",
            "workout_session_id", "set_number", "weight_kg", "reps", "feeling", "completed_at",
        ]
        read_only_fields = ["id", "completed_at"]

    def create(self, validated_data):
        set_log = SetLog.objects.create(**validated_data)
        if set_log.feeling:
            self._run_progression(set_log)
        return set_log

    def _run_progression(self, set_log: SetLog):
        from apps.routines.models import ExerciseTarget, RoutineExercise
        if not set_log.routine_exercise_id:
            return
        try:
            re = RoutineExercise.objects.get(pk=set_log.routine_exercise_id)
        except RoutineExercise.DoesNotExist:
            return

        session_sets = SetLog.objects.filter(
            workout_session=set_log.workout_session,
            routine_exercise=re,
        ).order_by("set_number")

        target, _ = ExerciseTarget.objects.get_or_create(
            routine_exercise=re,
            defaults={"target_weight_kg": set_log.weight_kg},
        )

        result = ExerciseResult(
            sets=[SetResult(reps=s.reps, weight_kg=Decimal(str(s.weight_kg))) for s in session_sets],
            feeling=set_log.feeling,
            rep_min=re.rep_min,
            rep_max=re.rep_max,
            current_weight_kg=target.target_weight_kg,
            increment_kg=re.increment_kg,
            sessions_at_current_weight=target.sessions_at_current_weight,
        )

        decision = evaluate(result)
        target.target_weight_kg = decision.next_weight_kg
        target.sessions_at_current_weight = decision.sessions_at_current_weight
        target.stagnation_flag = decision.stagnation_detected
        target.save()


class PersonalRecordSerializer(serializers.ModelSerializer):
    exercise = ExerciseSerializer(read_only=True)

    class Meta:
        model = PersonalRecord
        fields = ["id", "exercise", "pr_type", "weight_kg", "reps", "achieved_at"]


class WorkoutSessionSerializer(serializers.ModelSerializer):
    sets = SetLogSerializer(many=True, read_only=True)
    personal_records = PersonalRecordSerializer(many=True, read_only=True)
    duration_seconds = serializers.ReadOnlyField()
    total_volume_kg = serializers.ReadOnlyField()
    total_sets = serializers.ReadOnlyField()
    training_day_name = serializers.CharField(source="training_day.name", read_only=True, allow_null=True)

    class Meta:
        model = WorkoutSession
        fields = [
            "id", "training_day", "training_day_name", "started_at", "completed_at",
            "feeling", "notes", "is_completed", "sets", "personal_records",
            "duration_seconds", "total_volume_kg", "total_sets",
        ]
        read_only_fields = ["id"]


class WorkoutSessionCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkoutSession
        fields = ["id", "training_day", "started_at"]
        read_only_fields = ["id"]

    def create(self, validated_data):
        validated_data["user"] = self.context["request"].user
        if "training_day" in validated_data and validated_data["training_day"]:
            validated_data["routine"] = validated_data["training_day"].routine
        return super().create(validated_data)


class WorkoutCompleteSerializer(serializers.Serializer):
    feeling = serializers.IntegerField(min_value=1, max_value=5)
    notes = serializers.CharField(required=False, allow_blank=True)


class ExerciseHistorySerializer(serializers.Serializer):
    date = serializers.DateField()
    weight_kg = serializers.DecimalField(max_digits=6, decimal_places=2)
    reps = serializers.IntegerField()
    sets = serializers.IntegerField()
    total_volume = serializers.DecimalField(max_digits=10, decimal_places=2)
    is_pr = serializers.BooleanField()
