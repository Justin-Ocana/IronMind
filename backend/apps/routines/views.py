from datetime import date
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Routine, TrainingDay, RoutineExercise
from .serializers import RoutineSerializer, TrainingDaySerializer, RoutineExerciseSerializer, TodayScheduleSerializer
from apps.workouts.models import WorkoutSession


class RoutineViewSet(viewsets.ModelViewSet):
    serializer_class = RoutineSerializer

    def get_queryset(self):
        return Routine.objects.filter(user=self.request.user).prefetch_related(
            "days__exercises__exercise__muscle_group",
            "days__exercises__target",
        )

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=["post"])
    def activate(self, request, pk=None):
        routine = self.get_object()
        routine.activate()
        return Response(RoutineSerializer(routine).data)

    @action(detail=False, methods=["get"])
    def today(self, request):
        routine = Routine.objects.filter(user=request.user, is_active=True).prefetch_related(
            "days__exercises__exercise__muscle_group",
            "days__exercises__target",
        ).first()

        if not routine:
            data = {"has_workout": False, "training_day": None, "routine_name": None, "week_number": 0}
            return Response(TodayScheduleSerializer(data).data)

        today_weekday = date.today().weekday()
        training_day = routine.days.filter(day_of_week=today_weekday).first()
        week_number = date.today().isocalendar()[1]

        if not training_day or training_day.is_rest:
            data = {
                "has_workout": False,
                "completed_today": False,
                "training_day": TrainingDaySerializer(training_day).data if training_day else None,
                "routine_name": routine.name,
                "week_number": week_number,
            }
        else:
            completed_today = WorkoutSession.objects.filter(
                user=request.user,
                training_day=training_day,
                is_completed=True,
                started_at__date=date.today(),
            ).exists()
            data = {
                "has_workout": True,
                "completed_today": completed_today,
                "training_day": TrainingDaySerializer(training_day).data,
                "routine_name": routine.name,
                "week_number": week_number,
            }

        return Response(TodayScheduleSerializer(data).data)


class RoutineExerciseViewSet(viewsets.ModelViewSet):
    serializer_class = RoutineExerciseSerializer

    def get_queryset(self):
        return RoutineExercise.objects.filter(
            training_day__routine__user=self.request.user
        ).select_related("exercise", "target")
