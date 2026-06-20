import { NavLink, useLocation } from "react-router-dom";
import { Home, Dumbbell, BarChart2, User, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { useWorkoutStore } from "@/stores/workoutStore";

const navItems = [
  { to: "/", icon: Home, label: "Hoy" },
  { to: "/workout", icon: Dumbbell, label: "Entrena" },
  { to: "/history", icon: BarChart2, label: "Historial" },
  { to: "/body", icon: User, label: "Cuerpo" },
  { to: "/settings", icon: Settings, label: "Config" },
];

export default function BottomNav() {
  const location = useLocation();
  const activeWorkout = useWorkoutStore((s) => s.activeWorkout);

  if (location.pathname === "/workout/active") return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-xl border-t border-border safe-bottom">
      <div className="flex items-center justify-around h-16 px-2 max-w-lg mx-auto">
        {navItems.map(({ to, icon: Icon, label }) => {
          const isActive =
            to === "/" ? location.pathname === "/" : location.pathname.startsWith(to);
          const isWorkout = to === "/workout";

          return (
            <NavLink
              key={to}
              to={to}
              className={cn(
                "flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-all duration-200",
                isActive ? "text-white" : "text-muted-foreground"
              )}
            >
              <div className="relative">
                <Icon
                  size={22}
                  strokeWidth={isActive ? 2.5 : 1.8}
                  className={cn("transition-all", isActive && "text-white")}
                />
                {isWorkout && activeWorkout && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full" />
                )}
              </div>
              <span className={cn("text-[10px] font-medium", isActive ? "text-white" : "text-muted-foreground")}>
                {label}
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
