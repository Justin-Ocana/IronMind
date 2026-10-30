# IronMind

> **Abrir la app → Hacer lo que dice → Cerrar la app.**

A minimalist personal fitness tracker built as a PWA. No noise, no social features, no subscriptions — just your training, your weights, and your progression.

---

## Screenshots

| Dashboard | Workout | Progress |
|-----------|---------|----------|
| ![Dashboard](docs/screenshots/dashboard.png) | ![Workout](docs/screenshots/workout.png) | ![Progress](docs/screenshots/progress.png) |

---

## Features

- **Smart workout sessions** — Start your day's training in one tap. The app tells you what to do.
- **Auto progression** — After each exercise, rate the effort (easy/correct/hard). The engine adjusts next session's target weight automatically.
- **Weight persistence** — The weight you used last session is pre-loaded. Change it only when needed.
- **Body weight tracking** — Log your weight whenever you want. Stats compare vs your previous entry, not a fixed window.
- **Exercise history** — Full progression chart per exercise with PR tracking.
- **PWA** — Installable on mobile. Works offline.
- **No pagination** — Personal app. Everything loads at once.

---

## Stack

| Layer | Tech |
|-------|------|
| Backend | Django 5 + Django REST Framework |
| Auth | JWT (Simple JWT) |
| Database | SQLite (local) |
| Task queue | Celery (eager mode locally) |
| Frontend | React 18 + TypeScript + Vite |
| State | Zustand with persist middleware |
| Data fetching | TanStack Query v5 |
| Styling | Tailwind CSS v4 |
| Animations | Framer Motion |
| PWA | vite-plugin-pwa + Workbox |

---

## Architecture

```
IronMind/
├── backend/
│   ├── apps/
│   │   ├── users/          # Custom user model + JWT auth
│   │   ├── exercises/      # Exercise catalog + muscle groups
│   │   ├── routines/       # Routine → TrainingDay → RoutineExercise
│   │   ├── workouts/       # WorkoutSession + SetLog + PersonalRecord
│   │   ├── progression/    # Pure Python progression engine
│   │   ├── body/           # Body weight logs
│   │   └── wellness/       # Sleep, mood, HRV tracking
│   └── config/
│       └── settings/       # base / local / development
└── frontend/
    └── src/
        ├── features/       # Route-level pages (dashboard, workout, history…)
        ├── stores/         # Zustand stores (auth, workout)
        ├── hooks/          # React Query hooks
        └── types/          # Shared TypeScript interfaces
```

---

## Progression Engine

The progression engine lives in `backend/apps/progression/engine.py` — pure Python, no Django models, fully testable in isolation.

After the **last set** of an exercise, the user rates effort:
- **Easy** → weight increases next session
- **Correct** → weight stays if still making reps, increases after N consistent sessions
- **Hard** → weight stays (or decreases if stagnating)

Results are cached in `ExerciseTarget` (one per `RoutineExercise`) and pre-loaded when the next workout starts.

---

## Getting Started

### Prerequisites

- Python 3.11+
- Node.js 20+

### Run locally

```bash
# Clone
git clone https://github.com/Justin-Ocana/IronMind.git
cd IronMind

# Start everything (runs migrations + seeds exercises + starts both servers)
start.bat
```

Backend runs on `http://localhost:8000`, frontend on `http://localhost:5173`.

### Seed a user

```bash
cd backend
python seed_justin.py
```

---

## API Overview

| Resource | Endpoint |
|----------|----------|
| Auth | `POST /api/auth/token/` |
| Today's workout | `GET /api/routines/today/` |
| Start session | `POST /api/workouts/sessions/` |
| Log a set | `POST /api/workouts/sets/` |
| Complete session | `POST /api/workouts/sessions/{id}/complete/` |
| Exercise history | `GET /api/workouts/sessions/exercise-history/{exercise_id}/` |
| Body weight | `GET/POST /api/body/` |
| Body stats | `GET /api/body/stats/` |

---

## License

MIT
