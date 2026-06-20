import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import AppLayout from "@/components/layout/AppLayout";
import LoginPage from "@/features/auth/LoginPage";
import DashboardPage from "@/features/dashboard/DashboardPage";
import WorkoutPage from "@/features/workout/WorkoutPage";
import ActiveWorkoutPage from "@/features/workout/ActiveWorkoutPage";
import HistoryPage from "@/features/history/HistoryPage";
import ExerciseHistoryPage from "@/features/history/ExerciseHistoryPage";
import BodyPage from "@/features/body/BodyPage";
import WellnessPage from "@/features/wellness/WellnessPage";
import CalendarPage from "@/features/calendar/CalendarPage";
import AchievementsPage from "@/features/achievements/AchievementsPage";
import SettingsPage from "@/features/settings/SettingsPage";
import WeeklyReportPage from "@/features/reports/WeeklyReportPage";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="workout" element={<WorkoutPage />} />
          <Route path="workout/active" element={<ActiveWorkoutPage />} />
          <Route path="history" element={<HistoryPage />} />
          <Route path="history/exercise/:id" element={<ExerciseHistoryPage />} />
          <Route path="body" element={<BodyPage />} />
          <Route path="wellness" element={<WellnessPage />} />
          <Route path="calendar" element={<CalendarPage />} />
          <Route path="achievements" element={<AchievementsPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="reports" element={<WeeklyReportPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
