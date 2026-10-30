import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation } from "@tanstack/react-query";
import { useWorkoutStore } from "@/stores/workoutStore";
import { api } from "@/lib/api";
import { formatRestTimer } from "@/lib/utils";
import { queryClient } from "@/lib/queryClient";
import ExerciseView from "./ExerciseView";
import WorkoutComplete from "./WorkoutComplete";

export default function ActiveWorkoutPage() {
  const navigate = useNavigate();
  const {
    activeWorkout,
    restTimer,
    tickRestTimer,
    clearRestTimer,
    abandonWorkout,
  } = useWorkoutStore();

  useEffect(() => {
    if (restTimer === null) return;
    const interval = setInterval(tickRestTimer, 1000);
    return () => clearInterval(interval);
  }, [restTimer, tickRestTimer]);

  useEffect(() => {
    if (!activeWorkout) navigate("/workout", { replace: true });
  }, [activeWorkout, navigate]);

  const [showComplete, setShowComplete] = useState(false);

  if (!activeWorkout) return null;

  const currentEx = activeWorkout.exercises[activeWorkout.current_exercise_index];
  const allDone = activeWorkout.exercises.every((e) => e.completed);

  if (showComplete || allDone) {
    return (
      <WorkoutComplete
        sessionId={activeWorkout.session_id}
        onDone={() => { abandonWorkout(); navigate("/", { replace: true }); }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Header */}
      <div className="px-5 pt-14 pb-4 flex items-center justify-between">
        <div>
          <p className="text-muted-foreground text-xs uppercase tracking-widest">{activeWorkout.training_day_name}</p>
          <p className="text-white font-semibold">
            {activeWorkout.current_exercise_index + 1} / {activeWorkout.exercises.length}
          </p>
        </div>
        <button
          onClick={() => {
            if (confirm("¿Abandonar el entrenamiento?")) {
              abandonWorkout();
              navigate("/", { replace: true });
            }
          }}
          className="text-muted-foreground text-sm"
        >
          Salir
        </button>
      </div>

      {/* Progress bar */}
      <div className="px-5 mb-6">
        <div className="h-1 bg-secondary rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-white rounded-full"
            initial={false}
            animate={{ width: `${((activeWorkout.current_exercise_index) / activeWorkout.exercises.length) * 100}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
      </div>

      {/* Rest timer overlay */}
      <AnimatePresence>
        {restTimer !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/95 z-50 flex flex-col items-center justify-center"
          >
            <p className="text-muted-foreground text-sm uppercase tracking-widest mb-6">Descanso</p>
            <motion.p
              key={restTimer}
              initial={{ scale: 1.1, opacity: 0.7 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-8xl font-bold text-white tabular-nums"
            >
              {formatRestTimer(restTimer)}
            </motion.p>
            <button
              onClick={clearRestTimer}
              className="mt-12 px-8 py-4 bg-white text-black rounded-2xl font-semibold text-lg"
            >
              Saltar descanso
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Exercise */}
      <div className="flex-1 px-5">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeWorkout.current_exercise_index}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.25 }}
          >
            <ExerciseView
              exercise={currentEx}
              exerciseIndex={activeWorkout.current_exercise_index}
              sessionId={activeWorkout.session_id}
              onComplete={() => setShowComplete(allDone)}
            />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
