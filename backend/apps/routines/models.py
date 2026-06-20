from django.db import models
from django.conf import settings
from django.db.models import Q, UniqueConstraint
from common.models import TimeStampedModel


class Routine(TimeStampedModel):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="routines")
    name = models.CharField(max_length=100)
    is_active = models.BooleanField(default=False)

    class Meta:
        db_table = "routines"
        constraints = [
            UniqueConstraint(
                fields=["user"],
                condition=Q(is_active=True),
                name="unique_active_routine_per_user",
            )
        ]

    def __str__(self):
        return f"{self.name} ({'activa' if self.is_active else 'inactiva'})"

    def activate(self):
        Routine.objects.filter(user=self.user, is_active=True).update(is_active=False)
        self.is_active = True
        self.save(update_fields=["is_active"])


class TrainingDay(models.Model):
    DAY_CHOICES = [
        (0, "Lunes"), (1, "Martes"), (2, "Miércoles"),
        (3, "Jueves"), (4, "Viernes"), (5, "Sábado"), (6, "Domingo"),
    ]

    routine = models.ForeignKey(Routine, on_delete=models.CASCADE, related_name="days")
    day_of_week = models.IntegerField(choices=DAY_CHOICES)
    name = models.CharField(max_length=50)
    is_rest = models.BooleanField(default=False)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        db_table = "training_days"
        unique_together = [("routine", "day_of_week")]
        ordering = ["day_of_week"]

    def __str__(self):
        return f"{self.get_day_of_week_display()} — {self.name}"


class RoutineExercise(TimeStampedModel):
    PROGRESSION_TYPES = [
        ("double", "Doble progresión"),
        ("linear", "Lineal"),
        ("percentage", "Porcentaje"),
    ]

    training_day = models.ForeignKey(TrainingDay, on_delete=models.CASCADE, related_name="exercises")
    exercise = models.ForeignKey("exercises.Exercise", on_delete=models.PROTECT, related_name="routine_uses")
    order = models.PositiveIntegerField(default=0)
    sets = models.PositiveIntegerField()
    rep_min = models.PositiveIntegerField()
    rep_max = models.PositiveIntegerField()
    rir_target = models.PositiveIntegerField(default=2)
    rest_seconds = models.PositiveIntegerField(default=120)
    progression_type = models.CharField(max_length=20, choices=PROGRESSION_TYPES, default="double")
    increment_kg = models.DecimalField(max_digits=4, decimal_places=1, default=2.5)
    notes = models.TextField(blank=True)

    class Meta:
        db_table = "routine_exercises"
        unique_together = [("training_day", "order")]
        ordering = ["order"]

    def __str__(self):
        return f"{self.exercise.name} {self.sets}x{self.rep_min}-{self.rep_max}"


class ExerciseTarget(models.Model):
    """Cache del motor de progresión — peso objetivo calculado para la próxima sesión."""

    routine_exercise = models.OneToOneField(
        RoutineExercise, on_delete=models.CASCADE, related_name="target"
    )
    target_weight_kg = models.DecimalField(max_digits=6, decimal_places=2, default=0)
    sessions_at_current_weight = models.PositiveIntegerField(default=0)
    stagnation_flag = models.BooleanField(default=False)
    computed_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "exercise_targets"

    def __str__(self):
        return f"{self.routine_exercise} → {self.target_weight_kg} kg"
