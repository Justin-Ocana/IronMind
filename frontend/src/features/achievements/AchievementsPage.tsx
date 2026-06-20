import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { PersonalRecord } from "@/types";

export default function AchievementsPage() {
  const { data: prs } = useQuery<PersonalRecord[]>({
    queryKey: ["personal-records"],
    queryFn: () =>
      api.get("/workouts/sessions/history/").then((r) => {
        const sessions = r.data as { personal_records: PersonalRecord[] }[];
        const all: PersonalRecord[] = sessions.flatMap((s) => s.personal_records ?? []);
        const unique = Object.values(
          all.reduce<Record<string, PersonalRecord>>((acc, pr) => {
            const key = `${pr.exercise.id}-${pr.pr_type}`;
            if (!acc[key] || parseFloat(pr.weight_kg) > parseFloat(acc[key].weight_kg)) {
              acc[key] = pr;
            }
            return acc;
          }, {})
        );
        return unique.sort((a, b) => b.achieved_at.localeCompare(a.achieved_at));
      }),
  });

  return (
    <div className="px-5 pt-14 pb-6 max-w-lg mx-auto">
      <h1 className="text-3xl font-bold text-white mb-2">Logros</h1>
      <p className="text-muted-foreground text-sm mb-8">Tus récords personales reales</p>

      {prs && prs.length > 0 ? (
        <div className="space-y-2">
          {prs.map((pr) => (
            <div key={pr.id} className="bg-card border border-border rounded-2xl px-5 py-4 flex items-center justify-between">
              <div>
                <p className="text-white font-semibold">{pr.exercise.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {new Date(pr.achieved_at).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" })}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-yellow-400">{pr.weight_kg} kg</p>
                <p className="text-xs text-muted-foreground">×{pr.reps} reps</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <p className="text-5xl mb-4">🏆</p>
          <p className="text-white font-semibold mb-2">Sin logros todavía</p>
          <p className="text-muted-foreground text-sm">Completa tu primer entrenamiento para empezar a registrar récords.</p>
        </div>
      )}
    </div>
  );
}
