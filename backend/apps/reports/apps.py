from django.apps import AppConfig


class ReportsConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "apps.reports"

    def ready(self):
        self._setup_celery_beat()

    def _setup_celery_beat(self):
        try:
            from django_celery_beat.models import PeriodicTask, CrontabSchedule
            schedule, _ = CrontabSchedule.objects.get_or_create(
                minute="0", hour="20", day_of_week="0",
                day_of_month="*", month_of_year="*",
            )
            PeriodicTask.objects.get_or_create(
                crontab=schedule,
                name="weekly-reports-sunday",
                defaults={"task": "apps.reports.tasks.schedule_weekly_reports"},
            )
        except Exception:
            pass
