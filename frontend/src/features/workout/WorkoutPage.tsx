import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useToday } from "@/hooks/useToday";
import { useWorkoutStore } from "@/stores/workoutStore";
import { api } from "@/lib/api";
import { useMutation } from "@tanstack/react-query";
import type { WorkoutSession } from "@/types";

export default function WorkoutPage() {
  const navigate = useNavigate();
  const activeWorkout = useWorkoutStore((s) => s.activeWorkout);
  const startWorkout = useWorkoutStore((s) => s.startWorkout);
  const { data: today } = useToday();

  const { mutate: createSession, isPending } = useMutation({
    mutationFn: () =>
      api.post<WorkoutSession>("/workouts/sessions/", {
        training_day: today?.training_day?.id,
        started_at: new Date().toISOString(),
      }).then((r) => r.data),
    onSuccess: (session) => {
      if (today?.training_day) {
        startWorkout(session.id, today.training_day);
        navigate("/workout/active");
      }
    },
  });

  if (activeWorkout) {
    return (
      <div className="px-5 pt-14 pb-6 max-w-lg mx-auto">
        <div className="mb-8">
          <p className="text-muted-foreground text-sm">En curso</p>
          <h1 className="text-3xl font-bold text-white">{activeWorkout.training_day_name}</h1>
        </div>
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate("/workout/active")}
          className="w-full bg-white text-black rounded-3xl py-6 text-xl font-bold"
        >
          Continuar entrenamiento
        </motion.button>
      </div>
    );
  }

  if (!today?.has_workout || !today.training_day) {
    return (
      <div className="px-5 pt-14 pb-6 max-w-lg mx-auto">
        <div className="mb-8">
          <p className="text-muted-foreground text-sm">Hoy</p>
          <h1 className="text-3xl font-bold text-white">Descanso</h1>
        </div>
        <p className="text-muted-foreground">Hoy toca descansar. Aprovecha para recuperarte.</p>
      </div>
    );
  }

  const { training_day, routine_name, week_number } = today;

  return (
    <div className="px-5 pt-14 pb-6 max-w-lg mx-auto animate-fade-in">
      <div className="mb-8">
        <p className="text-muted-foreground text-sm">{routine_name} · Semana {week_number}</p>
        <h1 className="text-4xl font-bold text-white">{training_day.name}</h1>
      </div>

      <div className="space-y-2 mb-8">
        {training_day.exercises.map((re, i) => (
          <div key={re.id} className="bg-card border border-border rounded-2xl px-5 py-4 flex items-center justify-between">
            <div>
              <p className="font-semibold text-white">{re.exercise.name}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {re.sets}×{re.rep_min}–{re.rep_max} · {re.rest_seconds / 60} min descanso
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-white">
                {re.target?.target_weight_kg ? `${re.target.target_weight_kg} kg` : "—"}
              </p>
            </div>
          </div>
        ))}
      </div>

      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={() => createSession()}
        disabled={isPending}
        className="w-full bg-white text-black rounded-3xl py-6 text-xl font-bold disabled:opacity-60 transition-opacity"
      >
        {isPending ? "Iniciando..." : "Comenzar entrenamiento"}
      </motion.button>
    </div>
  );
}
