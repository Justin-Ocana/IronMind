import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { TodaySchedule, BodyWeightStats, WorkoutSession } from "@/types";

export function useToday() {
  return useQuery<TodaySchedule>({
    queryKey: ["today"],
    queryFn: () => api.get("/routines/today/").then((r) => r.data),
  });
}

export function useBodyWeightStats() {
  return useQuery<BodyWeightStats>({
    queryKey: ["body-weight-stats"],
    queryFn: () => api.get("/body/weight/stats/").then((r) => r.data),
  });
}

export function useRecentSessions() {
  return useQuery<WorkoutSession[]>({
    queryKey: ["sessions-recent"],
    queryFn: () => api.get("/workouts/sessions/history/").then((r) => r.data),
  });
}

export function useActiveSession() {
  return useQuery<WorkoutSession | null>({
    queryKey: ["session-active"],
    queryFn: () => api.get("/workouts/sessions/active/").then((r) => r.data),
    staleTime: 0,
  });
}
