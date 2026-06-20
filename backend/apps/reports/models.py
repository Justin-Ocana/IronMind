from django.db import models
from django.conf import settings


class WeeklyReport(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="weekly_reports")
    week_number = models.PositiveIntegerField()
    year = models.PositiveIntegerField()
    generated_at = models.DateTimeField(auto_now_add=True)
    data = models.JSONField()

    class Meta:
        db_table = "weekly_reports"
        unique_together = [("user", "week_number", "year")]
        ordering = ["-year", "-week_number"]

    def __str__(self):
        return f"Semana {self.week_number}/{self.year}"
