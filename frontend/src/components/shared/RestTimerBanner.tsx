import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useWorkoutStore } from "@/stores/workoutStore";
import { formatRestTimer } from "@/lib/utils";
import { motion } from "framer-motion";

export default function RestTimerBanner() {
  const { restTimer, tickRestTimer, activeWorkout } = useWorkoutStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (restTimer === null) return;
    const interval = setInterval(tickRestTimer, 1000);
    return () => clearInterval(interval);
  }, [restTimer, tickRestTimer]);

  if (!activeWorkout || restTimer === null) return null;

  return (
    <motion.button
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      onClick={() => navigate("/workout/active")}
      className="fixed bottom-[80px] left-4 right-4 z-40 bg-white text-black rounded-2xl px-5 py-3 flex items-center justify-between shadow-2xl"
    >
      <div className="flex flex-col items-start">
        <span className="text-xs font-medium text-black/60">Descanso</span>
        <span className="text-xl font-bold tabular-nums">{formatRestTimer(restTimer)}</span>
      </div>
      <span className="text-sm font-semibold text-black/70">Volver →</span>
    </motion.button>
  );
}
