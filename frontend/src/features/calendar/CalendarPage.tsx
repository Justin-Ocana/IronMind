import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { WorkoutSession } from "@/types";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay } from "date-fns";
import { es } from "date-fns/locale";
import { useState } from "react";

export default function CalendarPage() {
  const [month, setMonth] = useState(new Date());

  const { data: sessions } = useQuery<WorkoutSession[]>({
    queryKey: ["sessions-recent"],
    queryFn: () => api.get("/workouts/sessions/history/").then((r) => r.data),
  });

  const start = startOfMonth(month);
  const end = endOfMonth(month);
  const days = eachDayOfInterval({ start, end });

  const sessionDates = new Set(
    (sessions ?? []).map((s) => s.started_at.split("T")[0])
  );

  const firstDayOfWeek = (getDay(start) + 6) % 7;

  return (
    <div className="px-5 pt-14 pb-6 max-w-lg mx-auto">
      {/* Month header */}
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={() => setMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1))}
          className="w-10 h-10 rounded-2xl bg-card border border-border flex items-center justify-center text-white"
        >
          ‹
        </button>
        <h1 className="text-xl font-bold text-white capitalize">
          {format(month, "MMMM yyyy", { locale: es })}
        </h1>
        <button
          onClick={() => setMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1))}
          className="w-10 h-10 rounded-2xl bg-card border border-border flex items-center justify-center text-white"
        >
          ›
        </button>
      </div>

      {/* Day names */}
      <div className="grid grid-cols-7 mb-2">
        {["L", "M", "X", "J", "V", "S", "D"].map((d) => (
          <div key={d} className="text-center text-xs text-muted-foreground py-2 font-medium">
            {d}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: firstDayOfWeek }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}
        {days.map((day) => {
          const dateStr = format(day, "yyyy-MM-dd");
          const isToday = dateStr === format(new Date(), "yyyy-MM-dd");
          const hasWorkout = sessionDates.has(dateStr);

          return (
            <div
              key={dateStr}
              className={`aspect-square flex items-center justify-center rounded-2xl text-sm font-medium transition-all ${
                hasWorkout
                  ? "bg-white text-black font-bold"
                  : isToday
                  ? "border-2 border-white/40 text-white"
                  : "text-muted-foreground"
              }`}
            >
              {hasWorkout ? "✓" : day.getDate()}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex gap-6 mt-8 justify-center">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-white rounded-lg" />
          <span className="text-xs text-muted-foreground">Entrenamiento</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 border-2 border-white/40 rounded-lg" />
          <span className="text-xs text-muted-foreground">Hoy</span>
        </div>
      </div>

      {/* Stats */}
      {sessions && (
        <div className="mt-8 bg-card border border-border rounded-2xl p-5">
          <p className="text-xs text-muted-foreground uppercase tracking-widest mb-3">Este mes</p>
          <p className="text-3xl font-bold text-white">
            {sessions.filter((s) => s.started_at.startsWith(format(month, "yyyy-MM"))).length}
          </p>
          <p className="text-sm text-muted-foreground mt-1">entrenamientos</p>
        </div>
      )}
    </div>
  );
}
