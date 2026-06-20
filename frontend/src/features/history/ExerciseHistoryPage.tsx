import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceDot } from "recharts";
import { api } from "@/lib/api";
import type { ExerciseHistory, Exercise } from "@/types";
import { formatDate } from "@/lib/utils";

export default function ExerciseHistoryPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: exercise } = useQuery<Exercise>({
    queryKey: ["exercise", id],
    queryFn: () => api.get(`/exercises/${id}/`).then((r) => r.data),
  });

  const { data: history } = useQuery<ExerciseHistory[]>({
    queryKey: ["exercise-history", id],
    queryFn: () => api.get(`/workouts/sessions/exercise-history/${id}/`).then((r) => r.data),
  });

  const chartData = (history ?? []).map((h) => ({
    date: formatDate(h.date),
    kg: parseFloat(h.weight_kg),
    pr: h.is_pr,
  }));

  const latestPR = (history ?? []).filter((h) => h.is_pr).sort((a, b) => b.date.localeCompare(a.date))[0];

  return (
    <div className="px-5 pt-14 pb-6 max-w-lg mx-auto animate-fade-in">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-muted-foreground mb-6">
        <ChevronLeft size={18} />
        <span className="text-sm">Historial</span>
      </button>

      <h1 className="text-2xl font-bold text-white mb-1">{exercise?.name}</h1>
      <p className="text-muted-foreground text-sm mb-6">{exercise?.muscle_group?.name}</p>

      {/* PR Banner */}
      {latestPR && (
        <div className="bg-card border border-yellow-500/30 rounded-2xl px-5 py-4 mb-5 flex justify-between">
          <div>
            <p className="text-xs text-yellow-400 font-semibold uppercase tracking-widest mb-1">Récord personal</p>
            <p className="text-2xl font-bold text-white">{latestPR.weight_kg} kg</p>
          </div>
          <div className="text-right">
            <p className="text-muted-foreground text-xs mb-1">×{latestPR.reps} reps</p>
            <p className="text-muted-foreground text-xs">{formatDate(latestPR.date)}</p>
          </div>
        </div>
      )}

      {/* Chart */}
      {chartData.length > 1 && (
        <div className="bg-card border border-border rounded-2xl p-5 mb-5">
          <p className="text-xs text-muted-foreground uppercase tracking-widest mb-4">Progresión de peso</p>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={chartData}>
              <XAxis dataKey="date" hide />
              <YAxis domain={["auto", "auto"]} hide />
              <Tooltip
                contentStyle={{ background: "#1c1c1e", border: "1px solid #2c2c2e", borderRadius: 12, color: "#fff" }}
              />
              <Line type="monotone" dataKey="kg" stroke="#ffffff" strokeWidth={2} dot={false} />
              {chartData.filter((d) => d.pr).map((d, i) => (
                <ReferenceDot key={i} x={d.date} y={d.kg} r={5} fill="#ffd60a" stroke="none" />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* History list */}
      <div className="space-y-2">
        {(history ?? []).map((h, i) => (
          <div key={i} className={`bg-card border rounded-2xl px-5 py-4 flex items-center justify-between ${h.is_pr ? "border-yellow-500/40" : "border-border"}`}>
            <div>
              <p className="text-white font-semibold">{h.weight_kg} kg × {h.reps}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{h.sets} series · {formatDate(h.date)}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">{(parseFloat(h.total_volume) / 1000).toFixed(1)}t</p>
              {h.is_pr && <p className="text-yellow-400 text-xs mt-0.5">🏆 PR</p>}
            </div>
          </div>
        ))}
      </div>

      {(!history || history.length === 0) && (
        <div className="text-center py-16">
          <p className="text-4xl mb-4">📊</p>
          <p className="text-muted-foreground">Sin historial todavía. Empieza a entrenar para ver tu progresión.</p>
        </div>
      )}
    </div>
  );
}
