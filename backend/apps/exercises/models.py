from django.db import models
from django.conf import settings
from common.models import TimeStampedModel


class MuscleGroup(models.Model):
    GROUPS = [
        ("chest", "Pecho"),
        ("shoulders", "Hombros"),
        ("triceps", "Tríceps"),
        ("back", "Espalda"),
        ("biceps", "Bíceps"),
        ("quads", "Cuádriceps"),
        ("hamstrings", "Isquiotibiales"),
        ("glutes", "Glúteos"),
        ("calves", "Pantorrillas"),
        ("abs", "Abdominales"),
        ("adductors", "Aductores"),
        ("abductors", "Abductores"),
    ]
    name = models.CharField(max_length=50)
    slug = models.SlugField(unique=True)

    class Meta:
        db_table = "muscle_groups"
        ordering = ["name"]

    def __str__(self):
        return self.name


class Exercise(TimeStampedModel):
    EQUIPMENT = [
        ("barbell", "Barra"),
        ("dumbbell", "Mancuernas"),
        ("cable", "Polea"),
        ("machine", "Máquina"),
        ("bodyweight", "Peso corporal"),
        ("other", "Otro"),
    ]

    name = models.CharField(max_length=150)
    muscle_group = models.ForeignKey(MuscleGroup, on_delete=models.PROTECT, related_name="exercises")
    secondary_muscles = models.ManyToManyField(MuscleGroup, blank=True, related_name="secondary_exercises")
    equipment = models.CharField(max_length=20, choices=EQUIPMENT, default="barbell")
    is_custom = models.BooleanField(default=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="custom_exercises",
    )
    notes = models.TextField(blank=True)

    class Meta:
        db_table = "exercises"
        indexes = [
            models.Index(fields=["muscle_group"]),
            models.Index(fields=["user"]),
        ]
        ordering = ["name"]

    def __str__(self):
        return self.name
