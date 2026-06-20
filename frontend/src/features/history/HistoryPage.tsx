import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ChevronRight } from "lucide-react";
import { api } from "@/lib/api";
import type { Exercise } from "@/types";

export default function HistoryPage() {
  const navigate = useNavigate();

  const { data: exercises } = useQuery<Exercise[]>({
    queryKey: ["exercises"],
    queryFn: () => api.get("/exercises/").then((r) => r.data),
  });

  const grouped = (exercises ?? []).reduce<Record<string, Exercise[]>>((acc, ex) => {
    const group = ex.muscle_group.name;
    if (!acc[group]) acc[group] = [];
    acc[group].push(ex);
    return acc;
  }, {});

  return (
    <div className="px-5 pt-14 pb-6 max-w-lg mx-auto">
      <h1 className="text-3xl font-bold text-white mb-6">Historial</h1>

      <div className="space-y-6">
        {Object.entries(grouped).map(([group, exs]) => (
          <div key={group}>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2">{group}</p>
            <div className="space-y-1">
              {exs.map((ex) => (
                <button
                  key={ex.id}
                  onClick={() => navigate(`/history/exercise/${ex.id}`)}
                  className="w-full bg-card border border-border rounded-2xl px-5 py-4 flex items-center justify-between active:bg-secondary transition-colors"
                >
                  <span className="text-white font-medium">{ex.name}</span>
                  <ChevronRight size={16} className="text-muted-foreground" />
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
