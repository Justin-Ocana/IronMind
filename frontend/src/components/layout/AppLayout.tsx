import { Outlet } from "react-router-dom";
import BottomNav from "./BottomNav";
import { useWorkoutStore } from "@/stores/workoutStore";
import RestTimerBanner from "@/components/shared/RestTimerBanner";

export default function AppLayout() {
  const activeWorkout = useWorkoutStore((s) => s.activeWorkout);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <main className="flex-1 overflow-y-auto no-scrollbar pb-nav">
        <Outlet />
      </main>
      {activeWorkout && <RestTimerBanner />}
      <BottomNav />
    </div>
  );
}
