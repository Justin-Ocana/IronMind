import { useQuery, useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { api } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import type { WeeklyReport } from "@/types";

export default function WeeklyReportPage() {
  const { data: reports, isLoading } = useQuery<WeeklyReport[]>({
    queryKey: ["weekly-reports"],
    queryFn: () => api.get("/reports/").then((r) => r.data),
  });

  const { mutate: generate, isPending } = useMutation({
    mutationFn: () => api.post("/reports/generate/"),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["weekly-reports"] }),
  });

  const latest = reports?.[0];

  return (
    <div className="px-5 pt-14 pb-6 max-w-lg mx-auto">
      <h1 className="text-3xl font-bold text-white mb-2">Informe semanal</h1>
      <p className="text-muted-foreground text-sm mb-8">Generado automáticamente cada domingo</p>

      {isLoading && (
        <div className="space-y-3 animate-pulse">
          <div className="h-32 bg-card rounded-2xl" />
          <div className="h-24 bg-card rounded-2xl" />
        </div>
      )}

      {latest && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="bg-card border border-border rounded-2xl px-5 py-4">
            <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">
              Semana {latest.data.week_number} · {latest.data.year}
            </p>
            <p className="text-2xl font-bold text-white">{latest.data.status}</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Stat label="Peso" value={latest.data.weight_change_kg !== null ? `${latest.data.weight_change_kg >= 0 ? "+" : ""}${latest.data.weight_change_kg?.toFixed(1)} kg` : "—"} />
            <Stat label="Entrenamientos" value={String(latest.data.sessions_completed)} />
            <Stat label="Récords" value={String(latest.data.new_prs.length)} />
            <Stat label="Sueño promedio" value={latest.data.avg_sleep_hours ? `${latest.data.avg_sleep_hours.toFixed(1)}h` : "—"} />
          </div>

          {latest.data.new_prs.length > 0 && (
            <div className="bg-card border border-yellow-500/20 rounded-2xl p-5">
              <p className="text-xs text-yellow-400 font-semibold uppercase tracking-widest mb-3">Récords esta semana</p>
              {latest.data.new_prs.map((pr, i) => (
                <div key={i} className="flex justify-between py-1.5">
                  <span className="text-white text-sm">{pr.exercise}</span>
                  <span className="text-yellow-400 text-sm font-semibold">{pr.weight_kg}kg × {pr.reps}</span>
                </div>
              ))}
            </div>
          )}

          <div className="bg-card border border-border rounded-2xl p-5 space-y-3">
            <p className="text-xs text-muted-foreground uppercase tracking-widest">Recomendaciones</p>
            {latest.data.recommendations.map((rec, i) => (
              <div key={i} className="flex gap-3">
                <span className="text-white mt-0.5">•</span>
                <p className="text-white text-sm leading-relaxed">{rec}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {!isLoading && !latest && (
        <div className="text-center py-16">
          <p className="text-5xl mb-4">📋</p>
          <p className="text-white font-semibold mb-2">Sin informes todavía</p>
          <p className="text-muted-foreground text-sm mb-8">Los informes se generan automáticamente cada domingo.</p>
        </div>
      )}

      <motion.button
        whileTap={{ scale: 0.97 }}
        disabled={isPending}
        onClick={() => generate()}
        className="w-full mt-6 border border-border text-white rounded-2xl py-4 font-semibold disabled:opacity-40"
      >
        {isPending ? "Generando..." : "Generar informe ahora"}
      </motion.button>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-card border border-border rounded-2xl p-4">
      <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">{label}</p>
      <p className="text-xl font-bold text-white">{value}</p>
    </div>
  );
}
