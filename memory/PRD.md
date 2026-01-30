# Blackjack Trainer - Product Requirements Document

## Original Problem Statement
Build a comprehensive Blackjack trainer application with:
1. A desktop Python/Tkinter application for offline practice
2. A web React application with advanced features

The web app was later enhanced with:
- **Feature A**: Cross-Device Sync & Backup using Emergent Google Auth
- **Feature B**: AI-Powered Personalized Coaching

## User Personas
1. **Beginner Players**: Want to learn basic strategy without risking money
2. **Intermediate Players**: Looking to improve their strategy accuracy
3. **Card Counters**: Practicing Hi-Lo counting system
4. **Mobile Users**: Want to practice on any device with progress sync

## Core Requirements

### Desktop Application (COMPLETED)
- ✅ Standalone Python/Tkinter blackjack game
- ✅ Card counting practice mode
- ✅ Basic strategy hints
- ✅ Statistics tracking
- Location: `/app/blackjack_trainer/`

### Web Application (COMPLETED)
- ✅ Full blackjack game with betting, splitting, doubling, insurance, surrender
- ✅ Card counting trainer with Hi-Lo system
- ✅ Basic strategy hints and evaluation
- ✅ Statistics dashboard with Recharts
- ✅ localStorage persistence
- ✅ Responsive design with TailwindCSS and Shadcn UI

### Feature A: Cross-Device Sync (COMPLETED - Jan 29, 2025)
- ✅ Emergent Google Auth integration (via auth.emergentagent.com)
- ✅ AuthDialog component for sign-in/sign-out
- ✅ Account section in Settings dialog
- ✅ Sync service with auto-sync every 60 seconds
- ✅ Offline queue for failed operations
- ✅ Stats merge logic (takes max values for cumulative stats)
- ✅ Backend API endpoints: `/api/auth/session`, `/api/auth/me`, `/api/auth/logout`
- ✅ Sync endpoints: `/api/sync/stats`, `/api/sync/history`, `/api/sync/full`

### Feature B: AI Coaching (COMPLETED - Jan 29, 2025)
- ✅ Coaching Engine with weakness analyzer
- ✅ 20+ drills covering all strategy categories
- ✅ Personalized training session generator
- ✅ Progress tracking with mastery levels
- ✅ Coaching Panel with dashboard and drill runner
- ✅ Performance trend charts
- ✅ Daily streak tracking

## Technical Architecture

### Frontend Stack
- React 19
- TailwindCSS
- Shadcn UI components
- Recharts for visualizations
- Sonner for toast notifications

### Backend Stack  
- FastAPI
- MongoDB (via Motor async driver)
- Emergent Google Auth

### Data Schema (MongoDB)
```
users/{userId}: { user_id, email, name, picture, created_at, last_sync, settings }
stats/{userId}: { game_stats, strategy_stats, training_stats, updated_at }
history/{userId}: { hands: [...], updated_at } (capped at 200)
user_sessions/{}: { user_id, session_token, expires_at, created_at }
```

## Key Files
- `/app/frontend/src/App.js` - Main app component
- `/app/frontend/src/lib/authContext.js` - Auth state management
- `/app/frontend/src/lib/syncService.js` - Data synchronization
- `/app/frontend/src/lib/coachingEngine.js` - Coaching logic and drills
- `/app/frontend/src/lib/coachingProgress.js` - Progress tracking
- `/app/frontend/src/components/CoachingPanel.jsx` - Coaching UI
- `/app/frontend/src/components/AuthDialog.jsx` - Auth UI
- `/app/backend/server.py` - Backend API

## Testing
- Unit tests: `/app/frontend/src/__tests__/`
- Backend tests: `/app/backend/tests/`
- Test reports: `/app/test_reports/`

## Completed Features (Jan 29, 2025)
1. ✅ Desktop Blackjack Trainer
2. ✅ Web Blackjack Game with full features
3. ✅ Card Counting Trainer
4. ✅ Statistics Dashboard
5. ✅ Cross-Device Sync with Emergent Google Auth
6. ✅ AI-Powered Personalized Coaching

## Future Enhancements (Backlog)
- P2: Social features (leaderboards, challenges)
- P2: Custom deck/rule presets for different casinos
- P3: Voice-guided training sessions
- P3: Achievement system with badges
