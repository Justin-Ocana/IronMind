import { useState } from "react";
import { motion } from "framer-motion";
import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import type { WellnessLog } from "@/types";

const ENERGY_OPTIONS = [
  { value: 1, emoji: "😵", label: "Agotado" },
  { value: 2, emoji: "😐", label: "Normal" },
  { value: 3, emoji: "😀", label: "Bien" },
  { value: 4, emoji: "🔥", label: "En llamas" },
] as const;

const PAIN_OPTIONS = [
  { value: "none", label: "Sin dolor" },
  { value: "shoulder", label: "Hombro" },
  { value: "elbow", label: "Codo" },
  { value: "knee", label: "Rodilla" },
  { value: "back", label: "Espalda" },
] as const;

export default function WellnessPage() {
  const today = new Date().toISOString().split("T")[0];
  const [sleep, setSleep] = useState("");
  const [energy, setEnergy] = useState<number | null>(null);
  const [pain, setPain] = useState<string>("none");
  const [saved, setSaved] = useState(false);

  const { data: todayLog } = useQuery<WellnessLog>({
    queryKey: ["wellness-today"],
    queryFn: () => api.get(`/wellness/?date=${today}`).then((r) => r.data[0] ?? null),
  });

  const { mutate: save, isPending } = useMutation({
    mutationFn: () =>
      api.post("/wellness/", {
        date: today,
        sleep_hours: sleep ? parseFloat(sleep) : null,
        energy_level: energy,
        pain_area: pain,
      }),
    onSuccess: () => {
      setSaved(true);
      queryClient.invalidateQueries({ queryKey: ["wellness-today"] });
    },
  });

  if (saved || todayLog) {
    const log = todayLog;
    const energyLabel = ENERGY_OPTIONS.find((e) => e.value === (log?.energy_level ?? energy))?.emoji ?? "—";
    return (
      <div className="px-5 pt-14 pb-6 max-w-lg mx-auto animate-fade-in">
        <h1 className="text-3xl font-bold text-white mb-8">Bienestar</h1>
        <div className="space-y-3">
          <div className="bg-card border border-border rounded-2xl p-5 flex justify-between">
            <span className="text-muted-foreground">Sueño</span>
            <span className="text-white font-semibold">{log?.sleep_hours ?? sleep}h</span>
          </div>
          <div className="bg-card border border-border rounded-2xl p-5 flex justify-between">
            <span className="text-muted-foreground">Energía</span>
            <span className="text-2xl">{energyLabel}</span>
          </div>
          <div className="bg-card border border-border rounded-2xl p-5 flex justify-between">
            <span className="text-muted-foreground">Dolor</span>
            <span className="text-white font-semibold capitalize">{log?.pain_area ?? pain}</span>
          </div>
        </div>
        <p className="text-center text-muted-foreground text-sm mt-8">Registrado hoy ✓</p>
      </div>
    );
  }

  return (
    <div className="px-5 pt-14 pb-6 max-w-lg mx-auto space-y-8 animate-fade-in">
      <h1 className="text-3xl font-bold text-white">Bienestar</h1>

      {/* Sueño */}
      <div className="space-y-3">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Horas dormidas</p>
        <input
          type="number"
          inputMode="decimal"
          step="0.5"
          value={sleep}
          onChange={(e) => setSleep(e.target.value)}
          placeholder="7.5"
          className="w-full bg-card border border-border rounded-2xl px-5 py-5 text-white text-4xl font-bold text-center outline-none focus:ring-2 focus:ring-white/20"
        />
      </div>

      {/* Energía */}
      <div className="space-y-3">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">¿Cómo te sientes?</p>
        <div className="grid grid-cols-4 gap-2">
          {ENERGY_OPTIONS.map((opt) => (
            <motion.button
              key={opt.value}
              whileTap={{ scale: 0.92 }}
              onClick={() => setEnergy(opt.value)}
              className={`flex flex-col items-center py-4 rounded-2xl border transition-all ${
                energy === opt.value
                  ? "bg-white border-white text-black"
                  : "bg-card border-border text-white"
              }`}
            >
              <span className="text-3xl">{opt.emoji}</span>
              <span className="text-[10px] mt-1 font-medium">{opt.label}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Dolor */}
      <div className="space-y-3">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">¿Alguna molestia?</p>
        <div className="flex flex-wrap gap-2">
          {PAIN_OPTIONS.map((opt) => (
            <motion.button
              key={opt.value}
              whileTap={{ scale: 0.94 }}
              onClick={() => setPain(opt.value)}
              className={`px-5 py-3 rounded-2xl border text-sm font-medium transition-all ${
                pain === opt.value
                  ? "bg-white border-white text-black"
                  : "bg-card border-border text-white"
              }`}
            >
              {opt.label}
            </motion.button>
          ))}
        </div>
      </div>

      <motion.button
        whileTap={{ scale: 0.97 }}
        disabled={isPending}
        onClick={() => save()}
        className="w-full bg-white text-black rounded-3xl py-5 text-lg font-bold disabled:opacity-40"
      >
        {isPending ? "Guardando..." : "Guardar"}
      </motion.button>
    </div>
  );
}
