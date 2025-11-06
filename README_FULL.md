# 🎰 Blackjack Card Counter - Complete Suite

A comprehensive blackjack card counting trainer with **two versions**: a classic Pygame desktop game and a modern Electron web-based app.

![Python Version](https://img.shields.io/badge/python-3.10%2B-blue)
![React Version](https://img.shields.io/badge/react-18.2-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## 📦 What's Included

### 1. Enhanced Pygame Version (Classic)
- Traditional desktop game with Pygame
- **NEW**: Session statistics tracking
- **NEW**: Insurance betting option
- Card counting trainer
- Basic strategy recommendations
- Lightweight and fast

### 2. Modern Electron Version (New!)
- Beautiful web-based interface
- React + Framer Motion animations
- FastAPI backend
- Cross-platform desktop app
- Professional, modern UI

## ✨ Key Features

### Core Gameplay
- 🎴 Full blackjack rules: Hit, Stand, Double Down, Split
- 📊 Hi-Lo card counting system
- 🎯 Real-time basic strategy advice
- 💰 Betting recommendations based on true count
- 🛡️ Insurance betting when dealer shows Ace
- 🔄 Customizable deck count (1-8 decks)

### Statistics & Tracking
- ✅ Hands won/lost/pushed
- ✅ Win rate percentage
- ✅ Total wagered and net profit
- ✅ ROI calculations
- ✅ Biggest wins and losses
- ✅ Session duration
- ✅ Bankroll history with counts
- ✅ CSV export functionality

## 🚀 Quick Start

### Option 1: Pygame Version (Enhanced)

```bash
# Install dependencies
cd /app
pip install pygame

# Run the game
python -m blackjack_card_counter
```

### Option 2: Electron Version (Modern)

**Terminal 1 - Backend:**
```bash
cd /app/backend
pip install -r requirements.txt
python server.py
```

**Terminal 2 - Frontend:**
```bash
cd /app/frontend
yarn install
yarn start
```

**Optional - As Desktop App:**
```bash
cd /app/frontend
yarn electron
```

## 📁 Project Structure

```
/app/
│
├── blackjack_card_counter/      # Pygame Version
│   ├── __init__.py
│   ├── __main__.py
│   ├── game.py                  # Main game (enhanced)
│   ├── card.py                  # Card logic
│   ├── ui.py                    # UI components
│   ├── strategy.py              # Strategy engine
│   ├── statistics.py            # Statistics tracking (NEW)
│   └── constants.py             # Game constants
│
├── backend/                     # Electron Backend
│   ├── server.py               # FastAPI REST API
│   ├── game_logic.py           # Game engine
│   ├── models.py               # Data models
│   └── requirements.txt        # Python deps
│
├── frontend/                    # Electron Frontend
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── Card.jsx        # Card component
│   │   │   └── Card.css
│   │   ├── App.js              # Main app
│   │   ├── App.css             # Styling
│   │   ├── index.js
│   │   └── index.css
│   ├── electron.js             # Electron main
│   ├── package.json
│   └── .env
│
└── Documentation/
    ├── README.md               # Original readme
    ├── README_FULL.md          # This file
    ├── ELECTRON_SETUP.md       # Electron guide
    ├── PHASE1_IMPROVEMENTS.md  # Pygame enhancements
    └── PHASE2_COMPLETE.md      # Electron details
```

## 🎮 How to Play

### Basic Rules
1. Place your bet
2. Receive two cards (dealer gets one face-up, one face-down)
3. Choose your action: Hit, Stand, Double, or Split
4. Dealer reveals hidden card and plays
5. Compare hands - higher value wins (without going over 21)

### Card Counting
- **+1**: Cards 2, 3, 4, 5, 6 (low cards favor dealer)
- **0**: Cards 7, 8, 9 (neutral)
- **-1**: Cards 10, J, Q, K, A (high cards favor player)

**Running Count**: Sum of all card values
**True Count**: Running Count ÷ Decks Remaining

### Betting Strategy
- Count negative/neutral: Bet minimum
- True count +1: Bet 2 units
- True count +2: Bet 4 units
- True count +3: Bet 6 units
- True count +4+: Bet 8 units (maximum)

### Insurance
- Offered when dealer shows Ace
- Costs half your main bet
- Pays 2:1 if dealer has blackjack
- **Recommended**: Only take when true count is +3 or higher

## 🆚 Version Comparison

| Feature | Pygame | Electron |
|---------|--------|----------|
| **Interface** | Classic | Modern Web UI |
| **Platform** | Windows/Mac/Linux | Windows/Mac/Linux |
| **Installation** | Python + Pygame | Node.js + Backend |
| **Startup Time** | Instant | Few seconds |
| **Memory Usage** | ~50MB | ~150MB |
| **UI Customization** | Code changes | CSS/React |
| **Animations** | Basic | Smooth (60fps) |
| **Distribution** | Python script | Standalone app |
| **Statistics** | ✅ Full | ✅ API-ready |
| **Insurance** | ✅ Yes | ✅ Yes |
| **Card Counting** | ✅ Yes | ✅ Yes |
| **Strategy Advice** | ✅ Yes | ✅ Yes |
| **Offline Mode** | ✅ Yes | ❌ Needs backend |

## 📊 Statistics Features (Pygame)

### Session Tracking
- Hands played, won, lost, pushed
- Blackjacks count
- Win rate percentage
- Session duration

### Financial Metrics
- Total amount wagered
- Total won and lost
- Net profit/loss
- Return on Investment (ROI)
- Biggest single win
- Biggest single loss

### Data Export
- Export to CSV (saved in ~/Downloads)
- Detailed hand history
- Bankroll progression with counts
- Timestamps for all data points

### Persistence
- Stats saved between sessions
- Location: `~/.blackjack/blackjack_stats.json`
- Auto-loads on startup
- Reset option available

## 🎨 Electron UI Features

### Visual Design
- **Dark Theme**: Professional blue/navy gradients
- **Glass Effects**: Translucent panels with blur
- **Smooth Animations**: Card dealing, state transitions
- **Color Coding**: 
  - 🟢 Green: Positive counts, wins, profit
  - 🔴 Red: Negative counts, losses
  - 🟡 Yellow: Strategy advice, important info
  - 🔵 Blue: Betting advice

### Interactive Elements
- Animated card dealing
- Hover effects on cards
- Button state feedback
- Toast notifications for errors
- Modal help system
- Responsive layout

## 🛠️ Technical Stack

### Pygame Version
- **Language**: Python 3.10+
- **Framework**: Pygame 2.6+
- **Features**: Statistics, Insurance, Card Counting
- **Packaging**: Poetry / pip

### Electron Version

**Backend:**
- **Framework**: FastAPI
- **Server**: Uvicorn
- **Validation**: Pydantic
- **API**: RESTful

**Frontend:**
- **Framework**: React 18
- **Animations**: Framer Motion
- **HTTP Client**: Axios
- **Desktop**: Electron 28

## 📚 Documentation

Comprehensive guides available:

1. **[ELECTRON_SETUP.md](ELECTRON_SETUP.md)**
   - Complete setup instructions
   - API documentation
   - Troubleshooting guide
   - Configuration options

2. **[PHASE1_IMPROVEMENTS.md](PHASE1_IMPROVEMENTS.md)**
   - Pygame enhancements details
   - Statistics system overview
   - Insurance implementation

3. **[PHASE2_COMPLETE.md](PHASE2_COMPLETE.md)**
   - Electron version details
   - Architecture overview
   - Component breakdown
   - API endpoints

4. **[README.md](README.md)**
   - Original Pygame documentation
   - Poetry setup guide
   - Module architecture

## 🎯 Use Cases

### Learning Card Counting
- Practice Hi-Lo system
- Track your accuracy
- Build mental math skills
- Understand true count conversion

### Strategy Training
- Learn basic strategy
- Get real-time recommendations
- Practice optimal play
- Minimize house edge

### Bankroll Management
- Practice bet sizing
- Understand variance
- Track performance
- Analyze sessions

## 🔧 Development

### Pygame Development
```bash
# Format code
black blackjack_card_counter/

# Sort imports
isort blackjack_card_counter/

# Type check
mypy blackjack_card_counter/
```

### Electron Development

**Backend:**
```bash
cd /app/backend
# Add new endpoints in server.py
# Update game logic in game_logic.py
# Define models in models.py
```

**Frontend:**
```bash
cd /app/frontend
# Add components in src/components/
# Update UI in src/App.js
# Modify styles in src/App.css
```

## 📦 Distribution

### Pygame
```bash
# Build package
poetry build

# Install
pip install dist/blackjack_card_counter-0.1.0-py3-none-any.whl
```

### Electron
```bash
cd /app/frontend
yarn build          # Build React app
yarn package        # Package as desktop app
```

**Outputs:**
- macOS: `.dmg` installer
- Windows: `.exe` installer
- Linux: `.AppImage`

## 🎓 Educational Value

This tool teaches:
- **Mathematics**: Probability, expected value, statistics
- **Psychology**: Decision making under uncertainty
- **Strategy**: Risk management, optimal play
- **Programming**: Game logic, UI design, API development

## ⚠️ Disclaimer

This is a training tool for educational purposes only. Card counting is legal but may not be welcome in casinos. Use this software to:
- Learn probability and statistics
- Practice mental arithmetic
- Understand game theory
- Improve decision-making skills

Do not use this for illegal purposes or where prohibited by law.

## 📄 License

MIT License - See LICENSE file for details

## 🙏 Acknowledgments

- Built with [Pygame](https://www.pygame.org/)
- Built with [React](https://reactjs.org/)
- Built with [Electron](https://www.electronjs.org/)
- Built with [FastAPI](https://fastapi.tiangolo.com/)
- Packaged with [Poetry](https://python-poetry.org/)
- Animated with [Framer Motion](https://www.framer.com/motion/)

## 🎉 Features Summary

### ✅ Implemented in Both Versions
- Full blackjack gameplay
- Card counting (Hi-Lo system)
- Strategy recommendations
- Betting advice
- Insurance betting
- Multiple decks support
- Running and true count
- Customizable bankroll

### ✅ Pygame Exclusive
- Offline play
- Lightweight
- Instant startup
- Local statistics storage
- CSV export

### ✅ Electron Exclusive
- Modern web UI
- Smooth animations
- Responsive design
- API-based architecture
- Cross-platform packaging
- Professional appearance

---

## 🚀 Get Started Now!

### Quick Setup (Pygame)
```bash
cd /app
python -m blackjack_card_counter
```

### Quick Setup (Electron)
```bash
# Terminal 1
cd /app/backend && python server.py

# Terminal 2
cd /app/frontend && yarn start
```

**Choose your version and start practicing!** 🎰✨

---

**Questions? Issues? Feature Requests?**
Check the documentation files or open an issue on GitHub.

**Happy card counting!** 🃏📊🎯
