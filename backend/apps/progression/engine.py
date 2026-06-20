"""
Motor de progresión de IronMind.
Lógica pura — sin modelos Django, completamente testeable en aislamiento.

Reglas:
  SUBIR    → todas las series alcanzan rep_max Y feeling != "hard"
  MANTENER → alguna serie por debajo de rep_max, o feeling == "hard" con reps ok
  BAJAR    → feeling == "hard" Y sets caen por debajo de rep_min (o 3 sesiones sin progresar)
"""

from dataclasses import dataclass
from decimal import Decimal
from typing import List, Literal


Feeling = Literal["easy", "correct", "hard"]
Decision = Literal["increase", "maintain", "decrease"]


@dataclass
class SetResult:
    reps: int
    weight_kg: Decimal


@dataclass
class ExerciseResult:
    sets: List[SetResult]
    feeling: Feeling
    rep_min: int
    rep_max: int
    current_weight_kg: Decimal
    increment_kg: Decimal
    sessions_at_current_weight: int = 0


@dataclass
class ProgressionDecision:
    decision: Decision
    next_weight_kg: Decimal
    reason: str
    stagnation_detected: bool = False
    sessions_at_current_weight: int = 0


STAGNATION_THRESHOLD = 3


def evaluate(result: ExerciseResult) -> ProgressionDecision:
    all_reps = [s.reps for s in result.sets]
    all_hit_max = all(r >= result.rep_max for r in all_reps)
    all_above_min = all(r >= result.rep_min for r in all_reps)
    feeling = result.feeling

    if all_hit_max and feeling in ("easy", "correct"):
        next_weight = result.current_weight_kg + result.increment_kg
        return ProgressionDecision(
            decision="increase",
            next_weight_kg=next_weight,
            reason=f"Completaste {result.rep_max} reps en todas las series con esfuerzo correcto.",
            sessions_at_current_weight=0,
        )

    if not all_above_min and feeling == "hard":
        sessions = result.sessions_at_current_weight + 1
        stagnation = sessions >= STAGNATION_THRESHOLD
        reduction = (result.current_weight_kg * Decimal("0.95")).quantize(Decimal("0.5"))
        return ProgressionDecision(
            decision="decrease",
            next_weight_kg=reduction,
            reason="Dificultad alta y no se alcanzó el mínimo de reps. Reduciendo un 5%.",
            stagnation_detected=stagnation,
            sessions_at_current_weight=sessions,
        )

    sessions = result.sessions_at_current_weight + 1
    stagnation = sessions >= STAGNATION_THRESHOLD

    return ProgressionDecision(
        decision="maintain",
        next_weight_kg=result.current_weight_kg,
        reason=_maintain_reason(all_reps, result.rep_max, feeling, stagnation),
        stagnation_detected=stagnation,
        sessions_at_current_weight=sessions,
    )


def _maintain_reason(reps: List[int], rep_max: int, feeling: Feeling, stagnation: bool) -> str:
    if stagnation:
        return f"Llevas {STAGNATION_THRESHOLD} sesiones sin progresar. Considera un deload o revisa la técnica."
    if feeling == "hard":
        return "Sensación de esfuerzo alta. Mantén el peso hasta que baje la fatiga."
    missed = rep_max - min(reps)
    return f"Faltaron {missed} reps para el techo del rango. Sigue progresando."


def compute_weekly_volume(sets: List[SetResult]) -> Decimal:
    return sum(Decimal(str(s.weight_kg)) * s.reps for s in sets)


def detect_stagnation(history: List[ProgressionDecision]) -> bool:
    if len(history) < STAGNATION_THRESHOLD:
        return False
    last = history[-STAGNATION_THRESHOLD:]
    return all(d.decision == "maintain" for d in last)
