from django.db import models
from django.conf import settings
from common.models import TimeStampedModel


class WorkoutSession(TimeStampedModel):
    FEELING_CHOICES = [(1, "Muy mal"), (2, "Mal"), (3, "Normal"), (4, "Bien"), (5, "Excelente")]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="sessions")
    training_day = models.ForeignKey(
        "routines.TrainingDay", on_delete=models.SET_NULL, null=True, blank=True, related_name="sessions"
    )
    routine = models.ForeignKey(
        "routines.Routine", on_delete=models.SET_NULL, null=True, blank=True, related_name="sessions"
    )
    started_at = models.DateTimeField()
    completed_at = models.DateTimeField(null=True, blank=True)
    feeling = models.IntegerField(choices=FEELING_CHOICES, null=True, blank=True)
    notes = models.TextField(blank=True)
    is_completed = models.BooleanField(default=False)

    class Meta:
        db_table = "workout_sessions"
        indexes = [models.Index(fields=["user", "-started_at"])]
        ordering = ["-started_at"]

    def __str__(self):
        return f"{self.training_day} — {self.started_at.date()}"

    @property
    def duration_seconds(self):
        if self.completed_at and self.started_at:
            return int((self.completed_at - self.started_at).total_seconds())
        return None

    @property
    def total_volume_kg(self):
        return sum(s.weight_kg * s.reps for s in self.sets.all())

    @property
    def total_sets(self):
        return self.sets.count()


class SetLog(TimeStampedModel):
    FEELING_CHOICES = [
        ("easy", "Fácil"),
        ("correct", "Correcto"),
        ("hard", "Muy difícil"),
    ]

    workout_session = models.ForeignKey(WorkoutSession, on_delete=models.CASCADE, related_name="sets")
    routine_exercise = models.ForeignKey(
        "routines.RoutineExercise", on_delete=models.SET_NULL, null=True, blank=True, related_name="set_logs"
    )
    exercise = models.ForeignKey("exercises.Exercise", on_delete=models.PROTECT, related_name="set_logs")
    set_number = models.PositiveIntegerField()
    weight_kg = models.DecimalField(max_digits=6, decimal_places=2)
    reps = models.PositiveIntegerField()
    feeling = models.CharField(max_length=10, choices=FEELING_CHOICES, null=True, blank=True)
    completed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "set_logs"
        indexes = [
            models.Index(fields=["workout_session", "exercise"]),
            models.Index(fields=["exercise", "-completed_at"]),
        ]
        ordering = ["set_number"]

    def __str__(self):
        return f"{self.exercise.name} — Serie {self.set_number}: {self.weight_kg}kg × {self.reps}"


class PersonalRecord(models.Model):
    PR_TYPES = [
        ("weight", "Peso máximo"),
        ("volume", "Volumen máximo en sesión"),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="personal_records")
    exercise = models.ForeignKey("exercises.Exercise", on_delete=models.CASCADE, related_name="personal_records")
    pr_type = models.CharField(max_length=10, choices=PR_TYPES)
    weight_kg = models.DecimalField(max_digits=6, decimal_places=2)
    reps = models.PositiveIntegerField()
    achieved_at = models.DateTimeField()
    workout_session = models.ForeignKey(WorkoutSession, on_delete=models.CASCADE, related_name="personal_records")

    class Meta:
        db_table = "personal_records"
        indexes = [models.Index(fields=["user", "exercise", "pr_type"])]
        ordering = ["-achieved_at"]

    def __str__(self):
        return f"PR {self.exercise.name}: {self.weight_kg}kg × {self.reps}"
