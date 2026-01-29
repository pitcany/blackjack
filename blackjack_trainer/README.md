# Blackjack Trainer

A complete desktop Blackjack game with Card Counting Training Mode (Hi-Lo) built with Python and Tkinter.

## Features

### Blackjack Game
- Full Blackjack rules: Hit, Stand, Double Down, Split, Insurance
- Dealer rules with S17/H17 toggle
- Blackjack payout 3:2 (configurable)
- Bankroll and betting system
- Multi-hand support with splits

### Card Counting Training Mode (Hi-Lo)
- Running count drills
- True count calculations
- Multiple drill types: Single Card, Hand, Round
- Immediate feedback on guesses
- Session statistics tracking

## Requirements

- Python 3.11+
- Tkinter (usually included with Python)

## Installation

```bash
# Clone or download the project
cd blackjack_trainer

# Install development dependencies (for testing)
pip install -r requirements.txt
```

## Running the Application

```bash
python app.py
```

## Running Tests

```bash
pytest
```

Or with verbose output:

```bash
pytest -v
```

## Building Standalone Executable

You can build a standalone executable using PyInstaller:

```bash
pip install pyinstaller
pyinstaller --noconfirm --onefile --windowed app.py
```

The executable will be created in the `dist/` folder.

## Project Structure

```
blackjack_trainer/
├── app.py                 # Main entry point
├── requirements.txt       # Dependencies
├── README.md              # This file
│
├── blackjack/             # Game logic (GUI-independent)
│   ├── __init__.py
│   ├── config.py          # Game and training configuration
│   ├── models.py          # Data models (Card, Enums, States)
│   ├── hand.py            # Hand calculations
│   ├── shoe.py            # Card shoe management
│   ├── outcomes.py        # Game outcomes
│   ├── rules.py           # Blackjack rules
│   ├── game_engine.py     # Main game state machine
│   ├── counting.py        # Hi-Lo counting logic & trainer
│   └── stats.py           # Statistics tracking
│
├── ui/                    # Tkinter UI
│   ├── __init__.py
│   ├── theme.py           # UI theme constants
│   ├── main_window.py     # Main application window
│   ├── blackjack_screen.py# Blackjack game screen
│   ├── training_screen.py # Card counting training screen
│   └── settings_dialog.py # Settings configuration dialog
│
└── tests/                 # Unit tests
    ├── test_hand.py
    ├── test_rules.py
    ├── test_counting.py
    └── test_engine_smoke.py
```

## Game Controls

### Blackjack
- Enter bet amount and click "Deal" to start
- Use action buttons: Hit, Stand, Double, Split
- Insurance offered when dealer shows Ace
- Click "New Round" after round completes

### Training Mode
- Configure training settings (decks, drill type, etc.)
- Click "Start Training" to begin
- Enter your Running Count guess (and True Count if enabled)
- Click "Submit" to check your answer
- Click "Next Round" for more practice

## Configuration Options

### Game Settings
- Number of decks (1-8)
- Dealer hits soft 17 (S17/H17)
- Starting bankroll
- Minimum bet
- Penetration percentage

### Training Settings
- Drill type (Single Card, Hand, Round)
- Cards per round
- Ask for True Count
- Show card history

## Hi-Lo Counting System

Card values in Hi-Lo:
- 2-6: +1
- 7-9: 0
- 10-A: -1

True Count = Running Count ÷ Decks Remaining

## License

MIT License - Feel free to use and modify!
