import { useState } from "react";
import { motion } from "framer-motion";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useWorkoutStore } from "@/stores/workoutStore";
import { api } from "@/lib/api";
import { formatDuration } from "@/lib/utils";
import type { WorkoutSession } from "@/types";
import { queryClient } from "@/lib/queryClient";

interface Props {
  onDone: () => void;
}

export default function WorkoutComplete({ onDone }: Props) {
  const activeWorkout = useWorkoutStore((s) => s.activeWorkout);
  const [feeling, setFeeling] = useState<number | null>(null);
  const [saved, setSaved] = useState(false);

  const { data: session } = useQuery<WorkoutSession>({
    queryKey: ["session", activeWorkout?.session_id],
    queryFn: () => api.get(`/workouts/sessions/${activeWorkout?.session_id}/`).then((r) => r.data),
    enabled: !!activeWorkout?.session_id,
  });

  const { mutate: complete, isPending } = useMutation({
    mutationFn: (f: number) =>
      api.post(`/workouts/sessions/${activeWorkout?.session_id}/complete/`, { feeling: f }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sessions-recent"] });
      queryClient.invalidateQueries({ queryKey: ["today"] });
      setSaved(true);
    },
  });

  const duration = session?.started_at
    ? Math.floor((Date.now() - new Date(session.started_at).getTime()) / 1000)
    : null;

  return (
    <div className="min-h-screen bg-black flex flex-col px-5 pt-16 pb-10 max-w-lg mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex-1 flex flex-col"
      >
        <div className="mb-10">
          <p className="text-muted-foreground text-sm uppercase tracking-widest mb-2">Completado</p>
          <h1 className="text-4xl font-bold text-white">Buen trabajo</h1>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          <Stat label="Duración" value={duration ? formatDuration(duration) : "—"} />
          <Stat label="Series" value={String(session?.total_sets ?? "—")} />
          <Stat
            label="Volumen"
            value={session?.total_volume_kg ? `${(Number(session.total_volume_kg) / 1000).toFixed(1)} t` : "—"}
          />
          <Stat
            label="Récords"
            value={session?.personal_records?.length ? `🏆 ${session.personal_records.length}` : "—"}
          />
        </div>

        {/* PRs */}
        {session?.personal_records && session.personal_records.length > 0 && (
          <div className="mb-8 bg-card border border-border rounded-2xl p-5">
            <p className="text-xs font-semibold text-yellow-400 uppercase tracking-widest mb-3">Récords personales</p>
            {session.personal_records.map((pr) => (
              <div key={pr.id} className="flex justify-between py-1.5">
                <span className="text-white text-sm">{pr.exercise.name}</span>
                <span className="text-yellow-400 text-sm font-semibold">{pr.weight_kg} kg × {pr.reps}</span>
              </div>
            ))}
          </div>
        )}

        {/* Feeling */}
        {!saved && (
          <div className="mt-auto space-y-5">
            <p className="text-center text-white font-semibold">¿Cómo te sentiste?</p>
            <div className="flex gap-3 justify-center">
              {[1, 2, 3, 4, 5].map((f) => (
                <motion.button
                  key={f}
                  whileTap={{ scale: 0.88 }}
                  onClick={() => setFeeling(f)}
                  className={`w-12 h-12 rounded-2xl text-lg font-bold transition-all ${
                    feeling === f
                      ? "bg-white text-black"
                      : "bg-card border border-border text-white"
                  }`}
                >
                  {f}
                </motion.button>
              ))}
            </div>
            <motion.button
              whileTap={{ scale: 0.97 }}
              disabled={!feeling || isPending}
              onClick={() => feeling && complete(feeling)}
              className="w-full bg-white text-black rounded-3xl py-5 text-lg font-bold disabled:opacity-40"
            >
              {isPending ? "Guardando..." : "Guardar entrenamiento"}
            </motion.button>
          </div>
        )}

        {saved && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-auto"
          >
            <button
              onClick={onDone}
              className="w-full bg-white text-black rounded-3xl py-5 text-lg font-bold"
            >
              Volver al inicio
            </button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-card border border-border rounded-2xl p-5">
      <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">{label}</p>
      <p className="text-2xl font-bold text-white">{value}</p>
    </div>
  );
}
