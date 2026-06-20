import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useWorkoutStore } from "@/stores/workoutStore";
import { api } from "@/lib/api";
import type { ActiveExercise, ExerciseHistory } from "@/types";
import { cn } from "@/lib/utils";

interface Props {
  exercise: ActiveExercise;
  exerciseIndex: number;
  sessionId: number;
  onComplete: () => void;
}

export default function ExerciseView({ exercise, exerciseIndex, sessionId, onComplete }: Props) {
  const { logSet, setFeeling, completeExercise, nextExercise, startRestTimer } = useWorkoutStore();
  const re = exercise.routine_exercise;

  const completedSets = exercise.sets.filter((s) => s.completed);
  const currentSetIndex = completedSets.length;
  const currentSet = exercise.sets[currentSetIndex];
  const isLastSet = currentSetIndex === exercise.sets.length - 1;
  const allSetsCompleted = exercise.sets.every((s) => s.completed);

  const [repsInput, setRepsInput] = useState<string>("");
  const [showFeeling, setShowFeeling] = useState(false);

  const { data: history } = useQuery<ExerciseHistory[]>({
    queryKey: ["exercise-history", re.exercise.id],
    queryFn: () => api.get(`/workouts/sessions/exercise-history/${re.exercise.id}/`).then((r) => r.data),
  });

  const lastSession = history?.[history.length - 1];

  const { mutate: saveSet } = useMutation({
    mutationFn: (payload: { reps: number; feeling?: string }) =>
      api.post("/workouts/sets/", {
        workout_session: sessionId,
        routine_exercise_id: re.id,
        exercise_id: re.exercise.id,
        set_number: currentSetIndex + 1,
        weight_kg: currentSet.weight_kg,
        reps: payload.reps,
        feeling: payload.feeling ?? null,
      }),
  });

  function handleSaveSet() {
    const reps = parseInt(repsInput);
    if (!reps || reps < 1) return;

    logSet(exerciseIndex, currentSetIndex, reps);

    if (isLastSet) {
      setShowFeeling(true);
    } else {
      saveSet({ reps });
      startRestTimer(re.rest_seconds, exerciseIndex);
      setRepsInput("");
    }
  }

  function handleFeeling(feeling: "easy" | "correct" | "hard") {
    const lastSet = exercise.sets[exercise.sets.length - 1];
    if (!lastSet.reps) return;

    setFeeling(exerciseIndex, feeling);
    saveSet({ reps: lastSet.reps, feeling });
    completeExercise(exerciseIndex);
    nextExercise();
    setShowFeeling(false);
    setRepsInput("");
    onComplete();
  }

  return (
    <div className="space-y-6">
      {/* Exercise name + target */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1">
          {re.exercise.muscle_group.name}
        </p>
        <h2 className="text-3xl font-bold text-white mb-4">{re.exercise.name}</h2>

        <div className="flex gap-3">
          <div className="bg-card border border-border rounded-2xl px-5 py-3 flex-1">
            <p className="text-xs text-muted-foreground mb-1">Objetivo</p>
            <p className="text-xl font-bold text-white">{re.target?.target_weight_kg ?? "—"} kg</p>
            <p className="text-sm text-muted-foreground">{re.sets}×{re.rep_min}–{re.rep_max}</p>
          </div>
          {lastSession && (
            <div className="bg-card border border-border rounded-2xl px-5 py-3 flex-1">
              <p className="text-xs text-muted-foreground mb-1">Última vez</p>
              <p className="text-xl font-bold text-white">{lastSession.weight_kg} kg</p>
              <p className="text-sm text-muted-foreground">{lastSession.sets}×{lastSession.reps}</p>
            </div>
          )}
        </div>
      </div>

      {/* Sets completados */}
      {completedSets.length > 0 && (
        <div className="space-y-2">
          {completedSets.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-4 bg-card border border-border rounded-xl px-5 py-3"
            >
              <span className="text-muted-foreground text-sm w-16">Serie {s.set_number}</span>
              <span className="text-white font-semibold text-lg">{s.reps} reps</span>
              <span className="text-muted-foreground text-sm ml-auto">{s.weight_kg} kg</span>
              <span className="text-green-500">✓</span>
            </motion.div>
          ))}
        </div>
      )}

      {/* Feeling selector (última serie) */}
      <AnimatePresence>
        {showFeeling && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <p className="text-center text-white font-semibold text-lg">¿Cómo estuvo?</p>
            <div className="grid grid-cols-3 gap-3">
              {(["easy", "correct", "hard"] as const).map((f) => {
                const labels = { easy: "🟢 Fácil", correct: "🟡 Correcto", hard: "🔴 Difícil" };
                return (
                  <motion.button
                    key={f}
                    whileTap={{ scale: 0.94 }}
                    onClick={() => handleFeeling(f)}
                    className="bg-card border border-border rounded-2xl py-4 text-white font-semibold text-sm"
                  >
                    {labels[f]}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input de reps */}
      {!allSetsCompleted && !showFeeling && currentSet && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="text-center">
            <p className="text-muted-foreground text-sm mb-1">Serie {currentSetIndex + 1} de {re.sets}</p>
            <p className="text-muted-foreground text-sm">{currentSet.weight_kg} kg</p>
          </div>

          <div className="flex flex-col items-center gap-6">
            <input
              type="number"
              inputMode="numeric"
              value={repsInput}
              onChange={(e) => setRepsInput(e.target.value)}
              placeholder={String(re.rep_max)}
              className="text-center text-7xl font-bold text-white bg-transparent border-none outline-none w-full tabular-nums"
              style={{ caretColor: "white" }}
            />

            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleSaveSet}
              disabled={!repsInput}
              className={cn(
                "w-full rounded-3xl py-5 text-xl font-bold transition-all",
                repsInput ? "bg-white text-black" : "bg-card border border-border text-muted-foreground"
              )}
            >
              {isLastSet ? "Terminar ejercicio" : "Guardar serie"}
            </motion.button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
