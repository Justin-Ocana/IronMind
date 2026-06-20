import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

export function formatRestTimer(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function formatWeight(value: string | number, unit: "kg" | "lbs" = "kg"): string {
  const n = typeof value === "string" ? parseFloat(value) : value;
  if (unit === "lbs") return `${(n * 2.20462).toFixed(1)} lbs`;
  return `${n} kg`;
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("es-ES", { day: "numeric", month: "short" });
}

export function getDayName(dayOfWeek: number): string {
  return ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"][dayOfWeek];
}

export function getWeekStreak(sessions: Array<{ started_at: string }>): number {
  if (!sessions.length) return 0;
  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dates = sessions
    .map((s) => { const d = new Date(s.started_at); d.setHours(0,0,0,0); return d; })
    .sort((a, b) => b.getTime() - a.getTime());

  let expected = new Date(today);
  for (const d of dates) {
    const diff = Math.round((expected.getTime() - d.getTime()) / 86400000);
    if (diff <= 1) { streak++; expected = d; }
    else break;
  }
  return streak;
}
