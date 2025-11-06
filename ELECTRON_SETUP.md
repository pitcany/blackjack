# Blackjack Card Counter - Electron Desktop App

## 🎰 Overview

A modern, feature-rich Blackjack card counting trainer built with:
- **Backend**: FastAPI (Python) - Game logic and API
- **Frontend**: React + Framer Motion - Modern UI with animations
- **Desktop**: Electron - Cross-platform desktop application

## ✨ Features

### Core Features
- 🎴 **Full Blackjack Gameplay**: Hit, Stand, Double Down, Split
- 📊 **Card Counting**: Hi-Lo counting system with running and true count
- 🎯 **Strategy Advice**: Real-time basic strategy recommendations
- 💰 **Betting Guidance**: Smart betting advice based on true count
- 🛡️ **Insurance Betting**: Insurance option when dealer shows Ace
- 📈 **Statistics Tracking**: Track your session performance

### UI Features
- 🎨 Modern, sleek dark theme design
- ✨ Smooth card animations
- 📱 Responsive layout
- 🎮 Intuitive controls
- 🌈 Color-coded statistics (positive/negative counts)

## 📋 Prerequisites

- Python 3.10+
- Node.js 16+
- yarn package manager

## 🚀 Quick Start

### 1. Start the Backend Server

```bash
cd /app/backend
python server.py
```

The backend will start on `http://localhost:8001`

**Important**: The backend must be running for the frontend to work!

### 2. Start the React Development Server

```bash
cd /app/frontend
yarn start
```

The app will open in your browser at `http://localhost:3000`

### 3. Run as Electron App (Optional)

In a new terminal:

```bash
cd /app/frontend
yarn electron
```

Or run both together:

```bash
cd /app/frontend
yarn dev
```

## 📁 Project Structure

```
/app/
├── blackjack_card_counter/     # Original Pygame version (Enhanced)
│   ├── statistics.py           # Session statistics tracking
│   ├── game.py                 # Main game logic (with improvements)
│   ├── card.py                 # Card and deck logic
│   ├── ui.py                   # UI components
│   ├── strategy.py             # Strategy calculations
│   └── constants.py            # Game constants
│
├── backend/                    # FastAPI Backend
│   ├── server.py              # FastAPI server with endpoints
│   ├── game_logic.py          # Core blackjack game engine
│   ├── models.py              # Pydantic data models
│   └── requirements.txt       # Python dependencies
│
└── frontend/                   # React + Electron Frontend
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── components/
    │   │   ├── Card.jsx       # Card component with animations
    │   │   └── Card.css       # Card styling
    │   ├── App.js             # Main application
    │   ├── App.css            # Application styling
    │   ├── index.js           # React entry point
    │   └── index.css          # Global styles
    ├── electron.js            # Electron main process
    ├── package.json           # Node dependencies
    └── .env                   # Environment variables
```

## 🎮 How to Play

### Betting Phase
1. Select your bet amount using quick buttons ($10, $25, $50, $100) or enter a custom amount
2. Click "Set Bet" to confirm
3. Click "Deal Cards" to start the hand

### Playing Phase
- **Hit**: Take another card
- **Stand**: End your turn
- **Double**: Double your bet and take one more card
- **Split**: Split matching pairs into two hands (costs additional bet)

### Insurance
- Offered automatically when dealer shows an Ace
- Costs half your original bet
- Pays 2:1 if dealer has blackjack
- Strategy recommendation based on true count

### Card Counting
- **Running Count**: Cumulative count of all cards dealt
  - +1 for low cards (2-6)
  - 0 for neutral cards (7-9)
  - -1 for high cards (10, J, Q, K, A)
- **True Count**: Running count divided by decks remaining
- **Betting Strategy**: Increase bets when true count is +2 or higher

## 🔧 API Endpoints

### Game Management
- `POST /game/new` - Create a new game
- `GET /game/{game_id}/state` - Get current game state
- `DELETE /game/{game_id}` - Delete a game

### Game Actions
- `POST /game/{game_id}/bet` - Place a bet
- `POST /game/{game_id}/deal` - Deal initial cards
- `POST /game/{game_id}/hit` - Player hits
- `POST /game/{game_id}/stand` - Player stands
- `POST /game/{game_id}/double` - Player doubles down
- `POST /game/{game_id}/split` - Player splits
- `POST /game/{game_id}/insurance/take` - Take insurance
- `POST /game/{game_id}/insurance/decline` - Decline insurance
- `POST /game/{game_id}/new-hand` - Start a new hand
- `POST /game/{game_id}/new-shoe` - Shuffle new deck

## 📦 Building for Production

### Build React App
```bash
cd /app/frontend
yarn build
```

### Package Electron App
```bash
cd /app/frontend
yarn package
```

This will create distributable packages in the `dist/` directory for:
- macOS: `.dmg` file
- Windows: `.exe` installer
- Linux: `.AppImage`

## 🎯 Game Rules

- Dealer must hit on 16 and stand on 17
- Blackjack pays 3:2
- Insurance pays 2:1 (when dealer has blackjack)
- Can split pairs and double down
- Each split hand can be doubled independently

## 💡 Strategy Tips

### Basic Strategy
1. Always stand on 17 or higher
2. Always split Aces and 8s
3. Never split 10s
4. Double on 11 vs any dealer card
5. Double on 10 vs dealer 2-9

### Card Counting
1. Practice maintaining the running count
2. Calculate true count by dividing by decks remaining
3. Bet minimum when count is negative or neutral
4. Increase bets proportionally with positive counts
5. Take insurance only when true count is +3 or higher

### Bankroll Management
- Don't bet more than you can afford to lose
- Increase bets gradually with positive counts
- Decrease to minimum on negative counts
- Set win/loss limits for your session

## 🐛 Troubleshooting

### Backend Not Connecting
- Ensure the backend is running: `python backend/server.py`
- Check that port 8001 is not in use
- Verify REACT_APP_BACKEND_URL in frontend/.env

### Electron Window Not Opening
- Make sure React dev server is running first
- Wait for "Compiled successfully" message
- Check console for errors

### Cards Not Displaying
- Clear browser cache
- Check browser console for errors
- Ensure all dependencies are installed

## 📝 Configuration

### Backend Configuration
Edit `/app/backend/server.py`:
- Change port: Modify `port = int(os.environ.get("PORT", 8001))`

### Frontend Configuration
Edit `/app/frontend/.env`:
- Backend URL: `REACT_APP_BACKEND_URL=http://localhost:8001`

### Electron Configuration
Edit `/app/frontend/electron.js`:
- Window size, icon, development tools, etc.

## 🔐 Notes

- All game state is stored server-side
- Statistics are tracked per session
- No user authentication (single-player game)
- Safe to reset/restart at any time

## 🎓 Educational Purpose

This is a training tool for educational purposes. Learn:
- Probability and statistics
- Mental arithmetic
- Decision-making under uncertainty
- Bankroll management
- Card counting techniques

**Disclaimer**: Card counting is legal but may not be welcome in casinos. Use this tool to improve your skills responsibly.

## 📞 Support

For issues or questions:
1. Check the troubleshooting section
2. Review the API documentation
3. Check browser/terminal console for errors

---

**Enjoy practicing your blackjack skills!** 🎰✨
