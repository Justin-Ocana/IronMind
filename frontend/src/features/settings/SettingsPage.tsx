import { useState } from "react";
import { ChevronRight, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";
import { queryClient } from "@/lib/queryClient";
import type { Routine } from "@/types";
import { motion } from "framer-motion";

export default function SettingsPage() {
  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);
  const user = useAuthStore((s) => s.user);

  const { data: routines } = useQuery<Routine[]>({
    queryKey: ["routines"],
    queryFn: () => api.get("/routines/").then((r) => r.data),
  });

  const { mutate: activateRoutine } = useMutation({
    mutationFn: (id: number) => api.post(`/routines/${id}/activate/`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["routines"] });
      queryClient.invalidateQueries({ queryKey: ["today"] });
    },
  });

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <div className="px-5 pt-14 pb-6 max-w-lg mx-auto space-y-8 animate-fade-in">
      <h1 className="text-3xl font-bold text-white">Configuración</h1>

      {/* User info */}
      <div className="bg-card border border-border rounded-2xl px-5 py-4">
        <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Cuenta</p>
        <p className="text-white font-semibold">{user?.name || user?.email}</p>
        <p className="text-muted-foreground text-sm">{user?.email}</p>
      </div>

      {/* Routines */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">Rutinas</p>
        <div className="space-y-2">
          {(routines ?? []).map((r) => (
            <div
              key={r.id}
              className={`bg-card border rounded-2xl px-5 py-4 flex items-center justify-between ${
                r.is_active ? "border-white/30" : "border-border"
              }`}
            >
              <div>
                <p className="text-white font-semibold">{r.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{r.days.length} días</p>
              </div>
              {r.is_active ? (
                <span className="text-xs font-semibold text-green-400 bg-green-400/10 px-3 py-1 rounded-full">Activa</span>
              ) : (
                <motion.button
                  whileTap={{ scale: 0.94 }}
                  onClick={() => activateRoutine(r.id)}
                  className="text-xs font-semibold text-white/60 px-3 py-1 rounded-full border border-border"
                >
                  Activar
                </motion.button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Units */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">Unidades</p>
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="px-5 py-4 flex items-center justify-between">
            <span className="text-white">Peso</span>
            <span className="text-muted-foreground">{user?.settings?.weight_unit ?? "kg"}</span>
          </div>
        </div>
      </div>

      {/* Reports */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">Informes</p>
        <button
          onClick={() => navigate("/reports")}
          className="w-full bg-card border border-border rounded-2xl px-5 py-4 flex items-center justify-between"
        >
          <span className="text-white">Informe semanal</span>
          <ChevronRight size={16} className="text-muted-foreground" />
        </button>
      </div>

      {/* Export */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">Datos</p>
        <button className="w-full bg-card border border-border rounded-2xl px-5 py-4 flex items-center justify-between">
          <span className="text-white">Exportar respaldo</span>
          <ChevronRight size={16} className="text-muted-foreground" />
        </button>
      </div>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl border border-destructive/30 text-destructive font-semibold"
      >
        <LogOut size={16} />
        Cerrar sesión
      </button>
    </div>
  );
}
