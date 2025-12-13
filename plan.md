# Blackjack Card Counting Trainer — Plan

## 1) Objectives
- Build an educational Blackjack simulator focused on card counting and advantage play.
- Core features: Configurable casino rules, Hi‑Lo counting (Running/True/Decks Remaining), player edge estimate, bet ramp (Kelly‑style), strategy engine (basic + index deviations), soft error highlighting, classic casino UI.
- Persistence: Email/password auth with MongoDB; save user settings, bankroll, sessions, hand history and mistakes.
- Tech: React + TypeScript + Tailwind/Shadcn (frontend), FastAPI + MongoDB (backend). All API routes under /api; backend binds 0.0.0.0:8001 using env MONGO_URL.

## 2) Phased Implementation

### Phase 1 — Core Logic POC (Isolation)
Reason: The hardest, failure‑prone parts are the game/strategy math: shoe/deal correctness, basic strategy and count‑based deviations, real‑time RC/TC and bet sizing. We will prove these in a single Python script before UI.

Scope
- Deterministic Blackjack engine (deck/shoe, deal order, hand evaluator incl. soft/hard, splits, doubles, insurance; dealer logic S17/H17 switch).
- Hi‑Lo counting: per card update, decks remaining, true count; penetration/reshuffle.
- Basic strategy tables (6D variants for S17/H17, DAS; configurable flags).
- Count deviations (indices): 16v10 ≥0 stand; 15v10 ≥+4 stand; 10v10 ≥+4 double; Insurance ≥+3 (TC). Optionally add common indices (12v3 ≥+2, 12v2 ≥+3) if time permits.
- Bet ramp: example ramp — TC≤0:1×, +1:2×, +2:4×, +3:6×, ≥+4:8× (cap at max bet). Bankroll min/max constraints.
- Player edge estimate: base_edge_by_rules + 0.5% × TC (clamped), base derived per ruleset (approx; documented).

Deliverables
- Single Python file tests/test_core.py with functions that:
  1) Build a 6‑deck shoe at 75% pen; deal sequences; verify RC/TC at each step.
  2) Assert strategy decisions for canonical spots under given TC and rules (incl. deviations listed).
  3) Validate bet suggestions across TC from −2 to +6 respect the ramp and max cap.
  4) Validate insurance recommendation threshold at TC≥+3.
  5) Smoke‑check EV sign flip: player_edge_percent > 0 when TC>0 (under default rules), and < 0 when TC≤0.

User Stories (POC)
- As a tester, I can simulate a round and see RC/TC update correctly after every exposed card.
- As a tester, I get the basic‑strategy move for any player/dealer combo given rules.
- As a tester, deviations override basic strategy at/above the index.
- As a tester, I receive a bet recommendation for any TC obeying the ramp and bankroll caps.
- As a tester, I see an explanation string citing TC, card distribution, and deviation rationale.

Implementation Steps (POC)
- Web research (best‑practice references):
  - Basic strategy tables (6D S17/H17, DAS; resplit aces impact).
  - Hi‑Lo true count conversion and decks‑remaining estimation by penetration.
  - Common index plays list and thresholds for 6D games.
  - Kelly‑style betting ramps for training simulators.
- Implement modules inside tests/test_core.py (no external deps):
  - Card/Shoe with shuffle, cut card, penetration; deal mechanics.
  - Hand evaluator: totals, soft/hard, blackjack, bust; pair detection; split/double rules; dealer logic S17/H17.
  - Counter: RC/TC updates, decks remaining; reveal timing (hole card updates at showdown).
  - Strategy engine: basic table lookup + index deviations; explanation generator.
  - Bet sizing + edge estimate.
- Run and iterate until all assertions pass (Fix Until Works). Document any approximations.

Validation Criteria (POC)
- All assertions pass; counts and indices produce expected recommendations; bet ramp output matches spec; explanations include “why”.

### Phase 2 — Full App Development
Scope
- Frontend (React + TypeScript + Tailwind/Shadcn):
  - Main Table: dealer hand, player hand(s), chips/bankroll, controls (Hit/Stand/Double/Split/Insurance), keyboard shortcuts.
  - Advantage HUD: RC, Decks Remaining, TC, Player Edge %, Suggested Bet, Suggested Action.
  - Feedback Panel: recommendation + concise/expanded explanation (by Learning Mode).
  - Learning Mode: Beginner (full), Intermediate (tooltips), Expert (HUD only). Soft error highlighting (allow move but mark suboptimal).
  - Rules Panel: number of decks, S17/H17, DAS, resplit aces, BJ payout (3:2 default), penetration. Live recalculation.
  - Classic casino UI: green felt table, readable cards, subtle chip & dealing animations.
- Backend (FastAPI + MongoDB):
  - Auth: email/password, JWT; endpoints: /api/auth/register, /api/auth/login, /api/auth/logout; /api/me.
  - User settings: save rules, min/max bet, learning mode, bankroll starting value: /api/settings (GET/PUT).
  - Session + history: /api/sessions/start, /api/sessions/end, /api/hands (save results/mistakes), /api/hands?session_id=…
  - Helpers: serialize Mongo types; strict /api prefix; env‑driven MONGO_URL.
- Engine location: Deterministic game engine runs in frontend for responsiveness; backend persists results and settings. (Engine module is a TS port of POC.)
- Data Model (Mongo)
  - users: {email, password_hash, settings:{rules, min_bet, max_bet, learning_mode}, bankroll_start, created_at}
  - sessions: {user_id, started_at, ended_at, rules, penetration, bankroll_start, bankroll_end}
  - hands: {session_id, hand_no, dealer_cards, player_hands:[{cards, actions, outcome}], rc_before, tc_before, bet, advice, taken_action, correct, explanation}

API (initial)
- POST /api/auth/register | /api/auth/login | GET /api/me
- GET/PUT /api/settings
- POST /api/sessions/start | /api/sessions/end
- POST /api/hands | GET /api/hands?session_id=ID

User Stories (App)
- As a user, I can log in and have my bankroll and rule settings loaded automatically.
- As a user, I can change table rules and immediately see HUD/strategy update.
- As a user, I can play full rounds (incl. double/split/insurance) with advice and soft error highlighting.
- As a user, I can see RC, TC, decks remaining, edge %, suggested bet, and a short “why”.
- As a user, I can end a session and review stats (hands played, accuracy, EV trend, mistake breakdown).
- As a user, I can switch Learning Mode for more/less guidance.

Implementation Steps (App)
- Design: Call design_agent with Classic Casino direction; adopt color, spacing, card assets, shadows.
- Backend: Implement models and endpoints; JWT; serialization helpers; /api prefix; bind 0.0.0.0:8001.
- Frontend: Port POC engine to TypeScript; build UI (Table/HUD/Rules/Feedback/Auth/Stats); state store; data-testid attributes; optimistic updates.
- Persistence: Save settings on change; post hand results with advice and correctness.
- Polish: Animations, keyboard shortcuts, loading/error states, accessibility.
- Testing: Use testing_agent_v3 for E2E (frontend + backend). Skip camera/drag features.

Validation Criteria (App)
- No UI errors; stable play loop; accurate HUD and advice; auth + persistence work; all user stories pass automated tests.

### Phase 3 — Enhancements (Optional; do not block MVP)
- Drills (count speed), hand history replay, mistake tracking dashboards, strategy quizzes, export CSV.

## 3) Next Actions
- Implement Phase 1 tests/test_core.py and iterate until green.
- After POC success: run design_agent → implement backend + frontend via bulk file writes → E2E testing and fixes.

## 4) Success Criteria
- POC: All core assertions pass; indices and bet ramp produce correct recommendations; explanations clear and factual.
- App: Fully playable trainer with classic casino UI; accurate RC/TC/edge/bet/action; soft error highlighting; rules configurable; auth + persistence; no 500s, no red screens; mobile‑friendly; all listed user stories verified by testing agent.
