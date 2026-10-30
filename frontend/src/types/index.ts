export interface User {
  id: number;
  email: string;
  name: string;
  settings: UserSettings;
  created_at: string;
}

export interface UserSettings {
  weight_unit: "kg" | "lbs";
  default_rest_seconds: number;
  default_increment_kg: number;
  weekly_report_enabled: boolean;
  timezone: string;
}

export interface MuscleGroup {
  id: number;
  name: string;
  slug: string;
}

export interface Exercise {
  id: number;
  name: string;
  muscle_group: MuscleGroup;
  equipment: string;
  is_custom: boolean;
  notes: string;
}

export interface ExerciseTarget {
  target_weight_kg: string;
  sessions_at_current_weight: number;
  stagnation_flag: boolean;
  computed_at: string;
}

export interface RoutineExercise {
  id: number;
  exercise: Exercise;
  order: number;
  sets: number;
  rep_min: number;
  rep_max: number;
  rir_target: number;
  rest_seconds: number;
  progression_type: "double" | "linear" | "percentage";
  increment_kg: string;
  notes: string;
  target: ExerciseTarget | null;
}

export interface TrainingDay {
  id: number;
  day_of_week: number;
  name: string;
  is_rest: boolean;
  order: number;
  exercises: RoutineExercise[];
}

export interface Routine {
  id: number;
  name: string;
  is_active: boolean;
  days: TrainingDay[];
  created_at: string;
}

export interface TodaySchedule {
  has_workout: boolean;
  completed_today: boolean;
  training_day: TrainingDay | null;
  routine_name: string | null;
  week_number: number;
}

export interface SetLog {
  id: number;
  exercise: Exercise;
  set_number: number;
  weight_kg: string;
  reps: number;
  feeling: "easy" | "correct" | "hard" | null;
  completed_at: string;
}

export interface PersonalRecord {
  id: number;
  exercise: Exercise;
  pr_type: "weight" | "volume";
  weight_kg: string;
  reps: number;
  achieved_at: string;
}

export interface WorkoutSession {
  id: number;
  training_day: number | null;
  training_day_name: string | null;
  started_at: string;
  completed_at: string | null;
  feeling: number | null;
  notes: string;
  is_completed: boolean;
  sets: SetLog[];
  personal_records: PersonalRecord[];
  duration_seconds: number | null;
  total_volume_kg: number;
  total_sets: number;
}

export interface BodyWeight {
  id: number;
  date: string;
  weight_kg: string;
  notes: string;
}

export interface BodyWeightStats {
  current: string | null;
  change_7d: string | null;
  change_30d: string | null;
  weekly_avg: string | null;
  monthly_avg: string | null;
}

export interface BodyMeasurement {
  id: number;
  date: string;
  arm_cm: string | null;
  chest_cm: string | null;
  waist_cm: string | null;
  leg_cm: string | null;
  shoulder_cm: string | null;
  notes: string;
}

export interface BodyPhoto {
  id: number;
  date: string;
  photo_url: string;
  notes: string;
}

export interface WellnessLog {
  id: number;
  date: string;
  sleep_hours: string | null;
  energy_level: 1 | 2 | 3 | 4 | null;
  pain_area: "none" | "shoulder" | "elbow" | "knee" | "back" | "other";
  pain_intensity: number;
  notes: string;
}

export interface WeeklyReport {
  id: number;
  week_number: number;
  year: number;
  generated_at: string;
  data: {
    week_number: number;
    year: number;
    weight_change_kg: number | null;
    measurement_changes: Record<string, number>;
    sessions_completed: number;
    new_prs: Array<{ exercise: string; weight_kg: number; reps: number }>;
    stagnated_exercises: string[];
    avg_sleep_hours: number | null;
    recommendations: string[];
    status: string;
  };
}

export interface ExerciseHistory {
  date: string;
  weight_kg: string;
  reps: number;
  sets: number;
  total_volume: string;
  is_pr: boolean;
}

// Active workout local state
export interface ActiveSet {
  set_number: number;
  weight_kg: number;
  reps: number | null;
  feeling: "easy" | "correct" | "hard" | null;
  completed: boolean;
}

export interface ActiveExercise {
  routine_exercise: RoutineExercise;
  sets: ActiveSet[];
  completed: boolean;
}

export interface ActiveWorkout {
  session_id: number;
  training_day_id: number;
  training_day_name: string;
  exercises: ActiveExercise[];
  current_exercise_index: number;
  started_at: string;
}
