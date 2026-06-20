from datetime import date, timedelta
from decimal import Decimal
from celery import shared_task
from django.db.models import Avg, Count, Sum


@shared_task
def generate_weekly_report(user_id: int):
    from django.contrib.auth import get_user_model
    from apps.body.models import BodyWeight, BodyMeasurement
    from apps.workouts.models import WorkoutSession, PersonalRecord
    from apps.wellness.models import WellnessLog
    from apps.routines.models import ExerciseTarget
    from .models import WeeklyReport

    User = get_user_model()
    try:
        user = User.objects.get(pk=user_id)
    except User.DoesNotExist:
        return

    today = date.today()
    week_start = today - timedelta(days=today.weekday())
    week_end = week_start + timedelta(days=6)
    week_number = today.isocalendar()[1]
    year = today.year

    sessions = WorkoutSession.objects.filter(
        user=user,
        is_completed=True,
        started_at__date__range=(week_start, week_end),
    )

    weights = BodyWeight.objects.filter(user=user, date__range=(week_start, week_end)).order_by("date")
    weight_change = None
    if weights.count() >= 2:
        weight_change = float(weights.last().weight_kg - weights.first().weight_kg)

    prev_measurement = BodyMeasurement.objects.filter(
        user=user, date__lt=week_start
    ).order_by("-date").first()
    curr_measurement = BodyMeasurement.objects.filter(
        user=user, date__range=(week_start, week_end)
    ).order_by("-date").first()

    measurement_changes = {}
    if prev_measurement and curr_measurement:
        for field in ["arm_cm", "chest_cm", "waist_cm", "leg_cm", "shoulder_cm"]:
            prev_val = getattr(prev_measurement, field)
            curr_val = getattr(curr_measurement, field)
            if prev_val and curr_val:
                measurement_changes[field] = float(curr_val - prev_val)

    new_prs = PersonalRecord.objects.filter(
        user=user,
        achieved_at__date__range=(week_start, week_end),
    ).select_related("exercise")

    wellness = WellnessLog.objects.filter(user=user, date__range=(week_start, week_end))
    avg_sleep = wellness.aggregate(avg=Avg("sleep_hours"))["avg"]

    stagnated = ExerciseTarget.objects.filter(
        routine_exercise__training_day__routine__user=user,
        stagnation_flag=True,
    ).select_related("routine_exercise__exercise")

    recommendations = _build_recommendations(
        sessions=sessions,
        weight_change=weight_change,
        avg_sleep=float(avg_sleep) if avg_sleep else None,
        stagnated_exercises=stagnated,
    )

    data = {
        "week_number": week_number,
        "year": year,
        "weight_change_kg": weight_change,
        "measurement_changes": measurement_changes,
        "sessions_completed": sessions.count(),
        "new_prs": [{"exercise": pr.exercise.name, "weight_kg": float(pr.weight_kg), "reps": pr.reps} for pr in new_prs],
        "stagnated_exercises": [st.routine_exercise.exercise.name for st in stagnated],
        "avg_sleep_hours": float(avg_sleep) if avg_sleep else None,
        "recommendations": recommendations,
        "status": _overall_status(sessions.count(), weight_change),
    }

    WeeklyReport.objects.update_or_create(
        user=user,
        week_number=week_number,
        year=year,
        defaults={"data": data},
    )


def _build_recommendations(sessions, weight_change, avg_sleep, stagnated_exercises):
    recommendations = []

    for st in stagnated_exercises:
        name = st.routine_exercise.exercise.name
        recommendations.append(f"Considera un deload en {name} — llevas varias sesiones sin progresar.")

    if weight_change is not None:
        if weight_change < 0.1:
            recommendations.append("El peso no subió lo esperado. Considera aumentar 100 kcal diarias.")
        elif weight_change > 0.8:
            recommendations.append("El peso subió rápido. Revisa si quieres mantener ese ritmo.")

    if avg_sleep and avg_sleep < 7.0:
        h = int(avg_sleep)
        m = int((avg_sleep - h) * 60)
        recommendations.append(f"Dormiste un promedio de {h}h {m}min. Intenta llegar a 7-8 horas.")

    if not recommendations:
        recommendations.append("Todo en orden. Sigue con el plan actual.")

    return recommendations


def _overall_status(sessions_count: int, weight_change) -> str:
    if sessions_count >= 4:
        return "Excelente semana"
    if sessions_count >= 3:
        return "Buena semana"
    if sessions_count >= 1:
        return "Semana ligera"
    return "Sin entrenamientos esta semana"


@shared_task
def schedule_weekly_reports():
    from django.contrib.auth import get_user_model
    from apps.users.models import UserSettings
    User = get_user_model()
    users = User.objects.filter(
        is_active=True,
        settings__weekly_report_enabled=True,
    )
    for user in users:
        generate_weekly_report.delay(user.id)
