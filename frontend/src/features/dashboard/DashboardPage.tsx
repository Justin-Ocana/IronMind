import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronRight, Flame, Scale, Calendar, Dumbbell } from "lucide-react";
import { useToday, useBodyWeightStats, useRecentSessions } from "@/hooks/useToday";
import { useAuthStore } from "@/stores/authStore";
import { useWorkoutStore } from "@/stores/workoutStore";
import { getWeekStreak, formatWeight } from "@/lib/utils";
import DashboardSkeleton from "./DashboardSkeleton";

export default function DashboardPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const activeWorkout = useWorkoutStore((s) => s.activeWorkout);
  const { data: today, isLoading: loadingToday } = useToday();
  const { data: weightStats } = useBodyWeightStats();
  const { data: sessions } = useRecentSessions();

  const streak = getWeekStreak(sessions ?? []);
  const unit = user?.settings?.weight_unit ?? "kg";
  const todayDayName = new Date().toLocaleDateString("es-ES", { weekday: "long" });

  if (loadingToday) return <DashboardSkeleton />;

  return (
    <div className="px-5 pt-14 pb-6 max-w-lg mx-auto space-y-4 animate-fade-in">

      {/* Header */}
      <div className="mb-6">
        <p className="text-muted-foreground text-sm capitalize">{todayDayName}</p>
        <h1 className="text-3xl font-bold tracking-tight text-white">Hoy</h1>
      </div>

      {/* Workout del día */}
      {today?.has_workout && today.training_day ? (
        today.completed_today ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full bg-card border border-border rounded-3xl p-6"
          >
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1">
              {today.routine_name} · Semana {today.week_number}
            </p>
            <p className="text-3xl font-bold text-white">{today.training_day.name}</p>
            <p className="text-sm text-green-400 mt-2 font-semibold">Completado hoy ✓</p>
          </motion.div>
        ) : (
          <motion.button
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={() => navigate(activeWorkout ? "/workout/active" : "/workout")}
            className="w-full bg-white text-black rounded-3xl p-6 flex items-center justify-between active:scale-[0.98] transition-transform"
          >
            <div className="text-left">
              <p className="text-xs font-semibold text-black/50 uppercase tracking-widest mb-1">
                {today.routine_name} · Semana {today.week_number}
              </p>
              <p className="text-3xl font-bold">{today.training_day.name}</p>
              <p className="text-sm text-black/60 mt-1">
                {today.training_day.exercises.length} ejercicios
              </p>
            </div>
            <div className="flex flex-col items-center gap-1">
              {activeWorkout ? (
                <>
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-xs font-semibold text-black/60">Activo</span>
                </>
              ) : (
                <ChevronRight size={24} className="text-black/40" />
              )}
            </div>
          </motion.button>
        )
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full bg-card border border-border rounded-3xl p-6"
        >
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1">Hoy</p>
          <p className="text-2xl font-bold text-white">Descanso</p>
          <p className="text-sm text-muted-foreground mt-1">Recupera. Mañana más.</p>
        </motion.div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3">
        {/* Peso corporal */}
        <motion.button
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          onClick={() => navigate("/body")}
          className="bg-card border border-border rounded-3xl p-5 text-left active:scale-[0.97] transition-transform"
        >
          <Scale size={18} className="text-muted-foreground mb-3" />
          <p className="text-2xl font-bold text-white">
            {weightStats?.current ? formatWeight(weightStats.current, unit) : "—"}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {weightStats?.change != null
              ? `${parseFloat(String(weightStats.change)) >= 0 ? "+" : ""}${parseFloat(String(weightStats.change)).toFixed(1)} kg vs anterior`
              : "Peso corporal"}
          </p>
        </motion.button>

        {/* Racha */}
        <motion.button
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onClick={() => navigate("/calendar")}
          className="bg-card border border-border rounded-3xl p-5 text-left active:scale-[0.97] transition-transform"
        >
          <Flame size={18} className="text-muted-foreground mb-3" />
          <p className="text-2xl font-bold text-white">{streak}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {streak === 1 ? "entrenamiento seguido" : "entrenamientos seguidos"}
          </p>
        </motion.button>
      </div>

      {/* Semana actual */}
      <motion.button
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        onClick={() => navigate("/calendar")}
        className="w-full bg-card border border-border rounded-3xl p-5 active:scale-[0.98] transition-transform"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Esta semana</span>
          </div>
          <ChevronRight size={16} className="text-muted-foreground" />
        </div>
        <WeekView sessions={sessions ?? []} />
      </motion.button>

      {/* Historial reciente */}
      {sessions && sessions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-2"
        >
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest px-1">Últimas sesiones</p>
          {sessions.slice(0, 3).map((session) => (
            <div
              key={session.id}
              className="bg-card border border-border rounded-2xl p-4 flex items-center justify-between"
            >
              <div>
                <p className="font-semibold text-white">{session.training_day_name ?? "Entrenamiento"}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {new Date(session.started_at).toLocaleDateString("es-ES", { weekday: "short", day: "numeric", month: "short" })}
                  {" · "}{session.total_sets} series
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-white">
                  {session.total_volume_kg ? `${(session.total_volume_kg / 1000).toFixed(1)}t` : "—"}
                </p>
                {session.personal_records.length > 0 && (
                  <p className="text-xs text-yellow-400 mt-0.5">🏆 {session.personal_records.length} PR</p>
                )}
              </div>
            </div>
          ))}
        </motion.div>
      )}
    </div>
  );
}

function WeekView({ sessions }: { sessions: WorkoutSession[] }) {
  const days = ["L", "M", "X", "J", "V", "S", "D"];
  const today = new Date();
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay() + 1);

  return (
    <div className="flex gap-2 justify-between">
      {days.map((day, i) => {
        const d = new Date(weekStart);
        d.setDate(weekStart.getDate() + i);
        const isToday = d.toDateString() === today.toDateString();
        const hasSession = sessions.some((s) => {
          const sd = new Date(s.started_at);
          return sd.toDateString() === d.toDateString();
        });
        const isPast = d < today && !isToday;

        return (
          <div key={day} className="flex flex-col items-center gap-1.5">
            <span className={`text-[10px] font-medium ${isToday ? "text-white" : "text-muted-foreground"}`}>
              {day}
            </span>
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs ${
                hasSession
                  ? "bg-white text-black font-bold"
                  : isToday
                  ? "border-2 border-white/40 text-white"
                  : isPast
                  ? "bg-muted text-muted-foreground"
                  : "bg-secondary text-muted-foreground"
              }`}
            >
              {hasSession ? "✓" : d.getDate()}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Fix missing import
import type { WorkoutSession } from "@/types";
