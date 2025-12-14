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

### Phase 3 — Learn Mode & Curriculum (Current)
- **Objective**: Add a guided "Learn" mode with structured lessons (Hi-Lo, KO, Omega II).
- **Backend**: Update User model to store `lesson_progress`.
- **Frontend**:
  - **Navigation**: Add Play | Learn | Drills | Review tabs.
  - **Lesson Engine**: Support for interactive steps, goals, and scenarios.
  - **Game Engine Upgrade**: Add ability to "rig" the shoe or force game state for lessons.
  - **Curriculum Content**: Implement Modules A-F as defined in prompt.
  - **UI**: Learn Dashboard, Lesson Runner Overlay.

### Phase 4 — Mistake Tracking & Analytics (Next)
- Event logging per hand.
- Session score calculation.
- Review Dashboard.

### Phase 5 — Productization (Future)
- Landing page, Onboarding, Payments/Gating.

## Status: Starting Phase 3 (Learn Mode).
