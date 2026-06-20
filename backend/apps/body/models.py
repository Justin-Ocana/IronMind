from django.db import models
from django.conf import settings
from common.models import TimeStampedModel


class BodyWeight(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="body_weights")
    date = models.DateField()
    weight_kg = models.DecimalField(max_digits=5, decimal_places=2)
    notes = models.TextField(blank=True)

    class Meta:
        db_table = "body_weights"
        unique_together = [("user", "date")]
        indexes = [models.Index(fields=["user", "-date"])]
        ordering = ["-date"]

    def __str__(self):
        return f"{self.user.email} — {self.date}: {self.weight_kg} kg"


class BodyMeasurement(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="measurements")
    date = models.DateField()
    arm_cm = models.DecimalField(max_digits=4, decimal_places=1, null=True, blank=True)
    chest_cm = models.DecimalField(max_digits=4, decimal_places=1, null=True, blank=True)
    waist_cm = models.DecimalField(max_digits=4, decimal_places=1, null=True, blank=True)
    leg_cm = models.DecimalField(max_digits=4, decimal_places=1, null=True, blank=True)
    shoulder_cm = models.DecimalField(max_digits=4, decimal_places=1, null=True, blank=True)
    notes = models.TextField(blank=True)

    class Meta:
        db_table = "body_measurements"
        unique_together = [("user", "date")]
        indexes = [models.Index(fields=["user", "-date"])]
        ordering = ["-date"]

    def __str__(self):
        return f"{self.user.email} — {self.date}"


class BodyPhoto(TimeStampedModel):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="body_photos")
    date = models.DateField()
    photo = models.ImageField(upload_to="body_photos/%Y/%m/")
    notes = models.TextField(blank=True)

    class Meta:
        db_table = "body_photos"
        indexes = [models.Index(fields=["user", "-date"])]
        ordering = ["-date"]

    def __str__(self):
        return f"{self.user.email} — {self.date}"
