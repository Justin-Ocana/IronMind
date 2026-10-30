from datetime import datetime, timezone
from django.db.models import Max, Sum, F
from rest_framework import viewsets, status, generics
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import WorkoutSession, SetLog, PersonalRecord
from .serializers import (
    WorkoutSessionSerializer, WorkoutSessionCreateSerializer,
    WorkoutCompleteSerializer, SetLogSerializer, ExerciseHistorySerializer,
)


class WorkoutSessionViewSet(viewsets.ModelViewSet):
    def get_queryset(self):
        return WorkoutSession.objects.filter(user=self.request.user).prefetch_related(
            "sets__exercise", "personal_records__exercise"
        )

    def get_serializer_class(self):
        if self.action == "create":
            return WorkoutSessionCreateSerializer
        return WorkoutSessionSerializer

    def create(self, request, *args, **kwargs):
        serializer = WorkoutSessionCreateSerializer(
            data=request.data, context=self.get_serializer_context()
        )
        serializer.is_valid(raise_exception=True)
        session = serializer.save()
        return Response(
            WorkoutSessionSerializer(session).data,
            status=status.HTTP_201_CREATED,
        )

    @action(detail=True, methods=["post"])
    def complete(self, request, pk=None):
        session = self.get_object()
        serializer = WorkoutCompleteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        session.feeling = serializer.validated_data["feeling"]
        session.notes = serializer.validated_data.get("notes", "")
        session.completed_at = datetime.now(timezone.utc)
        session.is_completed = True
        session.save()

        self._check_personal_records(session)

        return Response(WorkoutSessionSerializer(session).data)

    def _check_personal_records(self, session: WorkoutSession):
        from apps.exercises.models import Exercise
        exercises = Exercise.objects.filter(set_logs__workout_session=session).distinct()

        for exercise in exercises:
            session_sets = session.sets.filter(exercise=exercise)
            best_set = session_sets.order_by("-weight_kg", "-reps").first()
            if not best_set:
                continue

            current_pr = PersonalRecord.objects.filter(
                user=session.user, exercise=exercise, pr_type="weight"
            ).order_by("-weight_kg").first()

            if not current_pr or best_set.weight_kg > current_pr.weight_kg:
                PersonalRecord.objects.create(
                    user=session.user,
                    exercise=exercise,
                    pr_type="weight",
                    weight_kg=best_set.weight_kg,
                    reps=best_set.reps,
                    achieved_at=session.completed_at,
                    workout_session=session,
                )

    @action(detail=False, methods=["get"])
    def active(self, request):
        session = WorkoutSession.objects.filter(user=request.user, is_completed=False).first()
        if not session:
            return Response(None)
        return Response(WorkoutSessionSerializer(session).data)

    @action(detail=False, methods=["get"])
    def history(self, request):
        sessions = self.get_queryset().filter(is_completed=True)
        return Response(WorkoutSessionSerializer(sessions, many=True).data)

    @action(detail=False, methods=["get"], url_path="exercise-history/(?P<exercise_id>[^/.]+)")
    def exercise_history(self, request, exercise_id=None):
        set_logs = SetLog.objects.filter(
            workout_session__user=request.user,
            exercise_id=exercise_id,
            workout_session__is_completed=True,
        ).select_related("workout_session").order_by("workout_session__started_at")

        prs = set(
            PersonalRecord.objects.filter(
                user=request.user,
                exercise_id=exercise_id,
            ).values_list("workout_session_id", flat=True)
        )

        sessions_map = {}
        for sl in set_logs:
            sid = sl.workout_session_id
            if sid not in sessions_map:
                sessions_map[sid] = {
                    "date": sl.workout_session.started_at.date(),
                    "weight_kg": sl.weight_kg,
                    "reps": sl.reps,
                    "sets": 0,
                    "total_volume": 0,
                    "is_pr": sid in prs,
                }
            sessions_map[sid]["sets"] += 1
            sessions_map[sid]["total_volume"] += float(sl.weight_kg) * sl.reps
            if sl.weight_kg > sessions_map[sid]["weight_kg"]:
                sessions_map[sid]["weight_kg"] = sl.weight_kg
                sessions_map[sid]["reps"] = sl.reps

        data = list(sessions_map.values())
        return Response(ExerciseHistorySerializer(data, many=True).data)


class SetLogViewSet(viewsets.ModelViewSet):
    serializer_class = SetLogSerializer

    def get_queryset(self):
        return SetLog.objects.filter(
            workout_session__user=self.request.user
        ).select_related("exercise")

    def perform_create(self, serializer):
        serializer.save()
