import { useState, useRef } from "react";
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
  const { logSet, setWeight, setFeeling, completeExercise, nextExercise, startRestTimer } = useWorkoutStore();
  const re = exercise.routine_exercise;

  const completedSets = exercise.sets.filter((s) => s.completed);
  const currentSetIndex = completedSets.length;
  const currentSet = exercise.sets[currentSetIndex];
  const isLastSet = currentSetIndex === exercise.sets.length - 1;
  const allSetsCompleted = exercise.sets.every((s) => s.completed);

  const [weightInput, setWeightInput] = useState<string>(
    currentSet?.weight_kg ? String(currentSet.weight_kg) : ""
  );
  const [showFeeling, setShowFeeling] = useState(false);
  // Capture the set number at the moment of save — avoids closure stale value after re-render
  const pendingSetNumRef = useRef<number>(0);

  const { data: history } = useQuery<ExerciseHistory[]>({
    queryKey: ["exercise-history", re.exercise.id],
    queryFn: () => api.get(`/workouts/sessions/exercise-history/${re.exercise.id}/`).then((r) => r.data),
  });

  const lastSession = history?.[history.length - 1];

  const { mutate: saveSet } = useMutation({
    mutationFn: (payload: { reps: number; feeling?: string; setNumber: number }) =>
      api.post("/workouts/sets/", {
        workout_session_id: sessionId,
        routine_exercise_id: re.id,
        exercise_id: re.exercise.id,
        set_number: payload.setNumber,
        weight_kg: parseFloat(weightInput) || 0,
        reps: payload.reps,
        feeling: payload.feeling ?? null,
      }),
  });

  function handleSaveSet() {
    const weight = parseFloat(weightInput);
    if (!weight || weight <= 0) return;
    const reps = re.rep_max;
    const setNumber = currentSetIndex + 1; // capture before logSet changes state

    logSet(exerciseIndex, currentSetIndex, reps);

    if (isLastSet) {
      pendingSetNumRef.current = setNumber;
      setShowFeeling(true);
    } else {
      saveSet({ reps, setNumber });
      startRestTimer(re.rest_seconds, exerciseIndex);
    }
  }

  function handleFeeling(feeling: "easy" | "correct" | "hard") {
    setFeeling(exerciseIndex, feeling);
    saveSet({ reps: re.rep_max, feeling, setNumber: pendingSetNumRef.current });
    completeExercise(exerciseIndex);
    nextExercise();
    setShowFeeling(false);
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

      {/* Peso — input principal */}
      {!allSetsCompleted && !showFeeling && currentSet && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <p className="text-center text-muted-foreground text-sm">
            Serie {currentSetIndex + 1} de {re.sets} · {re.rep_min}–{re.rep_max} reps
          </p>

          <div className="flex items-center justify-center gap-5">
            <button
              onClick={() => {
                const v = Math.max(0, (parseFloat(weightInput) || 0) - 2.5);
                setWeightInput(String(v));
                setWeight(exerciseIndex, v);
              }}
              className="w-12 h-12 rounded-full bg-secondary text-white text-2xl font-bold flex items-center justify-center active:opacity-60"
            >−</button>

            <div className="flex items-end gap-1">
              <input
                type="number"
                inputMode="decimal"
                step="0.5"
                value={weightInput}
                onChange={(e) => {
                  setWeightInput(e.target.value);
                  const v = parseFloat(e.target.value);
                  if (!isNaN(v)) setWeight(exerciseIndex, v);
                }}
                placeholder="0"
                className="text-center text-7xl font-bold text-white bg-transparent border-none outline-none w-44 tabular-nums"
                style={{ caretColor: "white" }}
              />
              <span className="text-2xl font-semibold text-muted-foreground pb-2">kg</span>
            </div>

            <button
              onClick={() => {
                const v = (parseFloat(weightInput) || 0) + 2.5;
                setWeightInput(String(v));
                setWeight(exerciseIndex, v);
              }}
              className="w-12 h-12 rounded-full bg-secondary text-white text-2xl font-bold flex items-center justify-center active:opacity-60"
            >+</button>
          </div>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleSaveSet}
            disabled={!weightInput || parseFloat(weightInput) <= 0}
            className={cn(
              "w-full rounded-3xl py-5 text-xl font-bold transition-all",
              weightInput && parseFloat(weightInput) > 0
                ? "bg-white text-black"
                : "bg-card border border-border text-muted-foreground"
            )}
          >
            {isLastSet ? "Terminar ejercicio" : "Guardar serie"}
          </motion.button>
        </motion.div>
      )}
    </div>
  );
}
