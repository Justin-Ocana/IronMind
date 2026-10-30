import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import type { BodyWeight, BodyMeasurement } from "@/types";

interface BodyWeightStats {
  current: string | null;
  previous: string | null;
  change: string | null;
  days_since: number | null;
}
import { formatDate } from "@/lib/utils";

export default function BodyPage() {
  const [activeTab, setActiveTab] = useState<"weight" | "measurements" | "photos">("weight");

  return (
    <div className="px-5 pt-14 pb-6 max-w-lg mx-auto">
      <h1 className="text-3xl font-bold text-white mb-6">Cuerpo</h1>

      <div className="flex gap-2 mb-6 bg-card border border-border rounded-2xl p-1">
        {(["weight", "measurements", "photos"] as const).map((tab) => {
          const labels = { weight: "Peso", measurements: "Medidas", photos: "Fotos" };
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                activeTab === tab ? "bg-white text-black" : "text-muted-foreground"
              }`}
            >
              {labels[tab]}
            </button>
          );
        })}
      </div>

      {activeTab === "weight" && <WeightTab />}
      {activeTab === "measurements" && <MeasurementsTab />}
      {activeTab === "photos" && <PhotosTab />}
    </div>
  );
}

function WeightTab() {
  const [weightInput, setWeightInput] = useState("");
  const today = new Date().toISOString().split("T")[0];

  const { data: stats } = useQuery<BodyWeightStats>({
    queryKey: ["body-weight-stats"],
    queryFn: () => api.get("/body/weight/stats/").then((r) => r.data),
  });

  const { data: history } = useQuery<BodyWeight[]>({
    queryKey: ["body-weight"],
    queryFn: () => api.get("/body/weight/").then((r) => r.data),
  });

  const { mutate: saveWeight, isPending } = useMutation({
    mutationFn: (weight: number) =>
      api.post("/body/weight/", { date: today, weight_kg: weight }),
    onSuccess: () => {
      setWeightInput("");
      queryClient.invalidateQueries({ queryKey: ["body-weight"] });
      queryClient.invalidateQueries({ queryKey: ["body-weight-stats"] });
    },
  });

  const chartData = (history ?? []).slice(0, 30).reverse().map((w) => ({
    date: formatDate(w.date),
    kg: parseFloat(w.weight_kg),
  }));

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-card border border-border rounded-2xl p-5">
          <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Actual</p>
          <p className="text-3xl font-bold text-white">{stats?.current ? `${parseFloat(stats.current).toFixed(1)}` : "—"} kg</p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-5">
          <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">
            {stats?.days_since != null
              ? stats.days_since === 1 ? "vs ayer" : stats.days_since < 7 ? `vs hace ${stats.days_since}d` : stats.days_since < 30 ? `vs hace ${Math.round(stats.days_since / 7)}sem` : `vs hace ${Math.round(stats.days_since / 30)}mes`
              : "Cambio"}
          </p>
          {stats?.change != null ? (
            <p className={`text-3xl font-bold ${parseFloat(stats.change) >= 0 ? "text-green-400" : "text-red-400"}`}>
              {parseFloat(stats.change) >= 0 ? "+" : ""}{parseFloat(stats.change).toFixed(1)} kg
            </p>
          ) : (
            <p className="text-3xl font-bold text-muted-foreground">—</p>
          )}
        </div>
      </div>

      {/* Chart */}
      {chartData.length > 1 && (
        <div className="bg-card border border-border rounded-2xl p-5">
          <p className="text-xs text-muted-foreground uppercase tracking-widest mb-4">Últimos 30 días</p>
          <ResponsiveContainer width="100%" height={140}>
            <LineChart data={chartData}>
              <XAxis dataKey="date" hide />
              <YAxis domain={["auto", "auto"]} hide />
              <Tooltip
                contentStyle={{ background: "#1c1c1e", border: "1px solid #2c2c2e", borderRadius: 12, color: "#fff" }}
                labelStyle={{ color: "#8e8e93" }}
              />
              <Line type="monotone" dataKey="kg" stroke="#ffffff" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Input */}
      <div className="bg-card border border-border rounded-2xl p-5">
        <p className="text-xs text-muted-foreground uppercase tracking-widest mb-4">Registrar hoy</p>
        <div className="flex gap-3">
          <input
            type="number"
            inputMode="decimal"
            step="0.1"
            value={weightInput}
            onChange={(e) => setWeightInput(e.target.value)}
            placeholder="65.0"
            className="flex-1 bg-secondary border border-border rounded-2xl px-5 py-4 text-white text-xl font-bold outline-none focus:ring-2 focus:ring-white/20 text-center"
          />
          <motion.button
            whileTap={{ scale: 0.95 }}
            disabled={!weightInput || isPending}
            onClick={() => saveWeight(parseFloat(weightInput))}
            className="bg-white text-black rounded-2xl px-6 font-bold disabled:opacity-40"
          >
            kg
          </motion.button>
        </div>
      </div>

      {/* History list */}
      {(history ?? []).length > 0 && (
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">Historial</p>
          <div className="space-y-2">
            {(history ?? []).map((w, i, arr) => {
              const prev = arr[i + 1];
              const delta = prev ? parseFloat(w.weight_kg) - parseFloat(prev.weight_kg) : null;
              return (
                <div key={w.id} className="flex justify-between items-center bg-card border border-border rounded-xl px-5 py-3">
                  <span className="text-muted-foreground text-sm">{formatDate(w.date)}</span>
                  <div className="flex items-center gap-3">
                    {delta !== null && (
                      <span className={`text-xs font-medium ${delta > 0 ? "text-green-400" : delta < 0 ? "text-red-400" : "text-muted-foreground"}`}>
                        {delta > 0 ? "+" : ""}{delta.toFixed(1)}
                      </span>
                    )}
                    <span className="text-white font-semibold">{parseFloat(w.weight_kg).toFixed(1)} kg</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function MeasurementsTab() {
  const fields: { key: keyof Omit<BodyMeasurement, "id" | "date" | "notes">; label: string }[] = [
    { key: "arm_cm", label: "Brazo" },
    { key: "chest_cm", label: "Pecho" },
    { key: "waist_cm", label: "Cintura" },
    { key: "leg_cm", label: "Pierna" },
    { key: "shoulder_cm", label: "Hombro" },
  ];

  const [values, setValues] = useState<Record<string, string>>({});
  const today = new Date().toISOString().split("T")[0];

  const { data: history } = useQuery<BodyMeasurement[]>({
    queryKey: ["body-measurements"],
    queryFn: () => api.get("/body/measurements/").then((r) => r.data),
  });

  const latest = history?.[0];
  const previous = history?.[1];

  const { mutate: save, isPending } = useMutation({
    mutationFn: () =>
      api.post("/body/measurements/", {
        date: today,
        ...Object.fromEntries(Object.entries(values).filter(([, v]) => v).map(([k, v]) => [k, parseFloat(v)])),
      }),
    onSuccess: () => {
      setValues({});
      queryClient.invalidateQueries({ queryKey: ["body-measurements"] });
    },
  });

  return (
    <div className="space-y-5">
      {/* Latest vs previous */}
      {latest && (
        <div className="bg-card border border-border rounded-2xl p-5">
          <p className="text-xs text-muted-foreground uppercase tracking-widest mb-4">
            {formatDate(latest.date)}
          </p>
          <div className="space-y-3">
            {fields.map(({ key, label }) => {
              const curr = latest[key];
              const prev = previous?.[key];
              const diff = curr && prev ? parseFloat(String(curr)) - parseFloat(String(prev)) : null;
              return (
                <div key={key} className="flex justify-between items-center">
                  <span className="text-muted-foreground text-sm">{label}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-semibold">{curr ?? "—"} cm</span>
                    {diff !== null && (
                      <span className={`text-xs ${diff >= 0 ? "text-green-400" : "text-red-400"}`}>
                        {diff >= 0 ? "+" : ""}{diff.toFixed(1)}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Input form */}
      <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
        <p className="text-xs text-muted-foreground uppercase tracking-widest">Registrar medidas</p>
        {fields.map(({ key, label }) => (
          <div key={key} className="flex items-center gap-3">
            <label className="text-sm text-muted-foreground w-20">{label}</label>
            <input
              type="number"
              inputMode="decimal"
              step="0.1"
              value={values[key] ?? ""}
              onChange={(e) => setValues((v) => ({ ...v, [key]: e.target.value }))}
              placeholder="—"
              className="flex-1 bg-secondary border border-border rounded-xl px-4 py-3 text-white font-semibold text-center outline-none"
            />
            <span className="text-muted-foreground text-sm w-6">cm</span>
          </div>
        ))}
        <motion.button
          whileTap={{ scale: 0.97 }}
          disabled={Object.values(values).every((v) => !v) || isPending}
          onClick={() => save()}
          className="w-full bg-white text-black rounded-2xl py-4 font-bold disabled:opacity-40"
        >
          Guardar medidas
        </motion.button>
      </div>
    </div>
  );
}

function PhotosTab() {
  return (
    <div className="bg-card border border-border rounded-2xl p-8 text-center">
      <p className="text-4xl mb-4">📸</p>
      <p className="text-white font-semibold mb-2">Fotos de progreso</p>
      <p className="text-muted-foreground text-sm">Próximamente — sube una foto mensual y compara tu progreso con el slider</p>
    </div>
  );
}
