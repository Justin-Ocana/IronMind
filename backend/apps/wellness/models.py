from django.db import models
from django.conf import settings


class WellnessLog(models.Model):
    ENERGY_CHOICES = [
        (1, "Agotado 😵"),
        (2, "Normal 😐"),
        (3, "Bien 😀"),
        (4, "En llamas 🔥"),
    ]
    PAIN_CHOICES = [
        ("none", "Sin dolor"),
        ("shoulder", "Hombro"),
        ("elbow", "Codo"),
        ("knee", "Rodilla"),
        ("back", "Espalda"),
        ("other", "Otro"),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="wellness_logs")
    date = models.DateField()
    sleep_hours = models.DecimalField(max_digits=3, decimal_places=1, null=True, blank=True)
    energy_level = models.IntegerField(choices=ENERGY_CHOICES, null=True, blank=True)
    pain_area = models.CharField(max_length=20, choices=PAIN_CHOICES, default="none")
    pain_intensity = models.PositiveIntegerField(default=0)
    notes = models.TextField(blank=True)

    class Meta:
        db_table = "wellness_logs"
        unique_together = [("user", "date")]
        indexes = [models.Index(fields=["user", "-date"])]
        ordering = ["-date"]

    def __str__(self):
        return f"{self.user.email} — {self.date}"
