import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ActiveWorkout, ActiveSet, TrainingDay } from "@/types";

interface WorkoutState {
  activeWorkout: ActiveWorkout | null;
  restTimer: number | null;
  restTimerExerciseIndex: number | null;

  startWorkout: (sessionId: number, trainingDay: TrainingDay) => void;
  logSet: (exerciseIndex: number, setIndex: number, reps: number) => void;
  setWeight: (exerciseIndex: number, weight: number) => void;
  setFeeling: (exerciseIndex: number, feeling: "easy" | "correct" | "hard") => void;
  completeExercise: (exerciseIndex: number) => void;
  nextExercise: () => void;
  startRestTimer: (seconds: number, exerciseIndex: number) => void;
  tickRestTimer: () => void;
  clearRestTimer: () => void;
  abandonWorkout: () => void;
}

export const useWorkoutStore = create<WorkoutState>()(
  persist(
    (set, get) => ({
      activeWorkout: null,
      restTimer: null,
      restTimerExerciseIndex: null,

      startWorkout: (sessionId, trainingDay) => {
        if (!sessionId) {
          console.error("[workoutStore] startWorkout called with invalid sessionId:", sessionId);
          return;
        }
        const exercises = trainingDay.exercises.map((re) => ({
          routine_exercise: re,
          sets: Array.from({ length: re.sets }, (_, i) => ({
            set_number: i + 1,
            weight_kg: parseFloat(re.target?.target_weight_kg ?? "0"),
            reps: null,
            feeling: null,
            completed: false,
          })),
          completed: false,
        }));

        set({
          activeWorkout: {
            session_id: sessionId,
            training_day_id: trainingDay.id,
            training_day_name: trainingDay.name,
            exercises,
            current_exercise_index: 0,
            started_at: new Date().toISOString(),
          },
        });
      },

      setWeight: (exerciseIndex, weight) => {
        const w = get().activeWorkout;
        if (!w) return;
        const updated = { ...w };
        updated.exercises = [...w.exercises];
        updated.exercises[exerciseIndex] = { ...w.exercises[exerciseIndex] };
        updated.exercises[exerciseIndex].sets = w.exercises[exerciseIndex].sets.map((s) =>
          s.completed ? s : { ...s, weight_kg: weight }
        );
        set({ activeWorkout: updated });
      },

      logSet: (exerciseIndex, setIndex, reps) => {
        const w = get().activeWorkout;
        if (!w) return;
        const updated = { ...w };
        updated.exercises = [...w.exercises];
        updated.exercises[exerciseIndex] = { ...w.exercises[exerciseIndex] };
        updated.exercises[exerciseIndex].sets = [...w.exercises[exerciseIndex].sets];
        updated.exercises[exerciseIndex].sets[setIndex] = {
          ...w.exercises[exerciseIndex].sets[setIndex],
          reps,
          completed: true,
        };
        set({ activeWorkout: updated });
      },

      setFeeling: (exerciseIndex, feeling) => {
        const w = get().activeWorkout;
        if (!w) return;
        const updated = { ...w };
        updated.exercises = [...w.exercises];
        updated.exercises[exerciseIndex] = { ...w.exercises[exerciseIndex] };
        const lastSetIdx = updated.exercises[exerciseIndex].sets.length - 1;
        updated.exercises[exerciseIndex].sets = [...updated.exercises[exerciseIndex].sets];
        updated.exercises[exerciseIndex].sets[lastSetIdx] = {
          ...updated.exercises[exerciseIndex].sets[lastSetIdx],
          feeling,
        };
        set({ activeWorkout: updated });
      },

      completeExercise: (exerciseIndex) => {
        const w = get().activeWorkout;
        if (!w) return;
        const updated = { ...w };
        updated.exercises = [...w.exercises];
        updated.exercises[exerciseIndex] = { ...w.exercises[exerciseIndex], completed: true };
        set({ activeWorkout: updated });
      },

      nextExercise: () => {
        const w = get().activeWorkout;
        if (!w) return;
        set({ activeWorkout: { ...w, current_exercise_index: w.current_exercise_index + 1 } });
      },

      startRestTimer: (seconds, exerciseIndex) => {
        set({ restTimer: seconds, restTimerExerciseIndex: exerciseIndex });
      },

      tickRestTimer: () => {
        const t = get().restTimer;
        if (t === null) return;
        if (t <= 1) set({ restTimer: null, restTimerExerciseIndex: null });
        else set({ restTimer: t - 1 });
      },

      clearRestTimer: () => set({ restTimer: null, restTimerExerciseIndex: null }),

      abandonWorkout: () => set({ activeWorkout: null, restTimer: null, restTimerExerciseIndex: null }),
    }),
    {
      name: "ironmind-workout",
      onRehydrateStorage: () => (state) => {
        // Clear stale workout if session_id is missing (corrupted state)
        if (state?.activeWorkout && !state.activeWorkout.session_id) {
          state.activeWorkout = null;
          state.restTimer = null;
          state.restTimerExerciseIndex = null;
        }
      },
    }
  )
);
