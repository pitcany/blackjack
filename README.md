# Blackjack Trainer

A comprehensive blackjack training application featuring card counting, basic strategy coaching, and advanced statistics tracking.

## Features

### Game Modes
- **Blackjack Practice** - Realistic blackjack game with casino-standard rules
- **Card Counting Training** - Learn and practice the Hi-Lo counting system
- **Strategy Coaching** - Real-time hints based on basic strategy with deviation indices
- **Statistics Dashboard** - Track your progress with detailed analytics

### Key Features
- 🎯 **Basic Strategy Engine** - Standard basic strategy tables for all hand types
- 📊 **Card Counting** - Hi-Lo system with running and true count tracking
- 📈 **Deviation Indices** - Illustrious 18 + Fab 4 count-based strategy adjustments
- 🔐 **User Authentication** - Firebase-based auth with cloud sync
- ☁️ **Data Synchronization** - Auto-sync your progress across devices
- ⚙️ **Customizable Settings** - Configure decks, rules, and game options
- 📱 **Responsive Design** - Works on desktop and mobile devices

## Technology Stack

### Frontend
- **React 19** - UI framework
- **Tailwind CSS** - Styling
- **shadcn/ui** - Component library
- **Recharts** - Data visualization
- **Firebase** - Authentication

### Backend
- **FastAPI** - Python web framework
- **MongoDB** - Database (via Motor)
- **Pydantic** - Data validation

### Testing
- **Playwright** - E2E testing
- **Jest** - Unit testing

## Installation

### Prerequisites
- Node.js 18+
- Python 3.9+
- MongoDB (or MongoDB Atlas account)
- Firebase project

### Frontend Setup

```bash
cd frontend
npm install
```

### Backend Setup

```bash
cd backend
pip install -r requirements.txt
```

### Configuration

Create a `.env` file in the `backend` directory:

```env
MONGO_URL=mongodb://localhost:27017
DB_NAME=blackjack_trainer
FIREBASE_API_KEY=your_firebase_api_key
FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_app_id
```

Configure Firebase for your frontend:
1. Create a Firebase project
2. Enable Authentication (Google/Email providers)
3. Get your Firebase config
4. Create `frontend/src/firebaseConfig.js` with your credentials

## Running the Application

### Start the Backend

```bash
cd backend
python -m uvicorn server:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`

### Start the Frontend

```bash
cd frontend
npm start
```

The app will be available at `http://localhost:3000`

## How to Use

### Playing Blackjack

1. **Place Your Bet** - Enter your wager amount
2. **Receive Your Cards** - You'll get 2 cards, dealer shows 1
3. **Choose Your Action**:
   - **Hit** - Take another card
   - **Stand** - Keep your current hand
   - **Double** - Double your bet, take exactly 1 card
   - **Split** - Split pairs into two hands
   - **Surrender** - Give up half your bet
4. **Dealer's Turn** - Dealer hits until 17 or higher
5. **Settle the Bet** - Win, lose, or push based on final hands

### Card Counting (Hi-Lo)

Track the count by assigning values:
- **2-6**: +1 (low cards)
- **7-9**: 0 (neutral cards)
- **10-A**: -1 (high cards)

Use the running count to estimate deck composition. Calculate true count by dividing by remaining decks.

### Strategy Coaching

Enable hints in Settings to get real-time strategy advice:
- Standard basic strategy for all situations
- Deviation indices when the count is favorable
- Explanations for why each action is optimal

### Statistics

Track your progress across multiple dimensions:
- **Game Stats** - Hands played, win rate, blackjack count
- **Strategy Accuracy** - How often you play optimally
- **Counting Proficiency** - Accuracy of running/true count estimates
- **Progress Over Time** - Charts showing improvement trends

## Game Rules

Default configuration follows standard Las Vegas Strip rules:
- **Decks**: 6 decks with 75% penetration
- **Dealer**: Stands on soft 17
- **Blackjack**: Pays 3:2
- **Double**: After split allowed
- **Insurance**: Pays 2:1
- **Surrender**: Available (lose half bet)

All rules can be customized in Settings.

## Testing

### Run Unit Tests

```bash
cd frontend
npm test
```

### Run E2E Tests

```bash
npm run test:e2e
```

## Project Structure

```
blackjack/
├── frontend/          # React frontend
│   ├── src/
│   │   ├── components/  # UI components
│   │   ├── lib/        # Game logic and utilities
│   │   └── __tests__/  # Unit tests
│   └── public/        # Static assets
├── backend/           # FastAPI backend
│   ├── server.py      # API endpoints
│   └── tests/        # Backend tests
├── e2e/              # Playwright tests
└── docs/             # Documentation
```

## Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.

## License

ISC

## Disclaimer

This application is for educational and entertainment purposes only. Card counting is not illegal, but casinos may restrict or ban players they suspect of counting cards. Please practice responsible gaming and understand the risks of gambling.

---

Built with React • Practice responsibly
