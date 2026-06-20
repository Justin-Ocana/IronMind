from django.core.management.base import BaseCommand
from apps.exercises.models import MuscleGroup, Exercise


MUSCLE_GROUPS = [
    ("chest", "Pecho"), ("shoulders", "Hombros"), ("triceps", "Tríceps"),
    ("back", "Espalda"), ("biceps", "Bíceps"), ("quads", "Cuádriceps"),
    ("hamstrings", "Isquiotibiales"), ("glutes", "Glúteos"),
    ("calves", "Pantorrillas"), ("abs", "Abdominales"),
    ("adductors", "Aductores"), ("abductors", "Abductores"),
]

EXERCISES = [
    # Pecho
    ("Press inclinado con mancuernas", "chest", "dumbbell"),
    ("Press de banca", "chest", "barbell"),
    ("Cruces en polea baja", "chest", "cable"),
    ("Press plano con mancuernas", "chest", "dumbbell"),
    ("Aperturas en máquina", "chest", "machine"),
    # Hombros
    ("Press militar con mancuernas", "shoulders", "dumbbell"),
    ("Press militar con barra", "shoulders", "barbell"),
    ("Elevación lateral en máquina", "shoulders", "machine"),
    ("Elevación lateral en polea", "shoulders", "cable"),
    ("Face Pull", "shoulders", "cable"),
    ("Elevación frontal", "shoulders", "dumbbell"),
    # Tríceps
    ("Extensión tras nuca con cuerda", "triceps", "cable"),
    ("Pushdown con barra recta", "triceps", "cable"),
    ("Extensión en polea con cuerda", "triceps", "cable"),
    ("Fondos en paralelas", "triceps", "bodyweight"),
    ("Extensión con mancuerna", "triceps", "dumbbell"),
    # Espalda
    ("Dominadas", "back", "bodyweight"),
    ("Dominadas asistidas", "back", "machine"),
    ("Jalón al pecho", "back", "cable"),
    ("Remo en polea baja", "back", "cable"),
    ("Remo en T", "back", "barbell"),
    ("Remo con mancuerna", "back", "dumbbell"),
    ("Pullover en polea", "back", "cable"),
    # Bíceps
    ("Curl predicador", "biceps", "barbell"),
    ("Curl martillo", "biceps", "dumbbell"),
    ("Curl Bayesian", "biceps", "cable"),
    ("Curl con barra", "biceps", "barbell"),
    ("Curl inclinado", "biceps", "dumbbell"),
    # Cuádriceps
    ("Extensión de piernas", "quads", "machine"),
    ("Máquina Hack", "quads", "machine"),
    ("Sentadilla con barra", "quads", "barbell"),
    ("Prensa de piernas", "quads", "machine"),
    ("Zancadas", "quads", "dumbbell"),
    # Isquiotibiales
    ("Curl femoral sentado", "hamstrings", "machine"),
    ("Curl femoral tumbado", "hamstrings", "machine"),
    ("Peso muerto rumano", "hamstrings", "barbell"),
    # Glúteos / Abductores
    ("Máquina de abductores", "abductors", "machine"),
    ("Máquina de aductores", "adductors", "machine"),
    ("Hip thrust", "glutes", "barbell"),
    ("Patada de glúteo en polea", "glutes", "cable"),
    # Pantorrillas
    ("Elevación de gemelos de pie", "calves", "machine"),
    ("Elevación de gemelos sentado", "calves", "machine"),
]


class Command(BaseCommand):
    help = "Seed muscle groups and exercises"

    def handle(self, *args, **options):
        groups = {}
        for slug, name in MUSCLE_GROUPS:
            group, created = MuscleGroup.objects.get_or_create(slug=slug, defaults={"name": name})
            groups[slug] = group
            if created:
                self.stdout.write(f"  + Grupo muscular: {name}")

        for name, group_slug, equipment in EXERCISES:
            exercise, created = Exercise.objects.get_or_create(
                name=name,
                user=None,
                defaults={"muscle_group": groups[group_slug], "equipment": equipment},
            )
            if created:
                self.stdout.write(f"  + Ejercicio: {name}")

        self.stdout.write(self.style.SUCCESS("Seed completado."))
