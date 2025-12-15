# Blackjack Card Counting Trainer — Plan

## 1) Objectives
- Build an educational Blackjack simulator focused on card counting and advantage play.
- Core features: Configurable casino rules, Hi‑Lo counting (Running/True/Decks Remaining), player edge estimate, bet ramp (Kelly‑style), strategy engine (basic + index deviations), soft error highlighting, classic casino UI.
- Persistence: Email/password auth with MongoDB; save user settings, bankroll, sessions, hand history and mistakes.
- Tech: React + TypeScript + Tailwind/Shadcn (frontend), FastAPI + MongoDB (backend). All API routes under /api; backend binds 0.0.0.0:8001 using env MONGO_URL.

## 2) Phased Implementation

### Phase 1 — Core Logic POC (Isolation) - COMPLETED
- Implemented `tests/test_core.py` with deterministic engine, strategy, counting, and betting logic.
- Verified all math and recommendations via automated tests.

### Phase 2 — Full App Development - COMPLETED
- **Backend**: FastAPI server with Auth (JWT + bcrypt), MongoDB persistence (User, Session models).
- **Frontend**: React app with Classic Casino UI (Green felt, cards).
- **Engine**: Ported Python logic to JS (`lib/engine.js`).
- **Features**:
  - Login/Register working.
  - Table gameplay (Hit, Stand, Double, Split).
  - Advantage HUD (Running Count, True Count, Decks Remaining, Edge).
  - Strategy Advice ("Why" text).
  - Persistence (Bankroll saves).
- **Testing**: End-to-End verified by Testing Agent.
- **Fixes**: Resolved Registration error by configuring `package.json` proxy and cleared `REACT_APP_BACKEND_URL`.

### Phase 3 — Learn Mode & Curriculum - COMPLETED
- **Objective**: Add a guided "Learn" mode with structured lessons (Hi-Lo, KO, Omega II).
- **Backend**: Added `lesson_progress` to User model and `/api/progress` endpoint.
- **Frontend**:
  - **Navigation**: Added Play | Learn | Drills | Review tabs via `NavBar.jsx`.
  - **Lesson Engine**: `lib/lessonStore.js` manages lesson state; `lib/lessons.js` defines curriculum.
  - **Engine Upgrade**: Added `setScenario` to `GameEngine` to rig shoe/hands for lessons.
  - **UI**: `LearnPage.jsx` dashboard, `LessonOverlay.jsx` for interactive steps.
  - **Routing**: Updated `App.jsx` with protected routes.
- **Testing**: Verified full Lesson A1 flow (Info -> Quiz -> Action -> Complete -> Save Progress).

### Phase 4 — Mistake Tracking & Analytics (Next)
- Event logging per hand.
- Session score calculation.
- Review Dashboard.

### Phase 5 — Productization (Future)
- Landing page, Onboarding, Payments/Gating.

## Status: Phase 3 Complete. Learn Mode Live.
