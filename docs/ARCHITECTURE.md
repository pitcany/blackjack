# Architecture - Blackjack Card Counter

Modular architecture documentation for the blackjack card counting trainer.

---

## 📁 Project Structure

```
blackjack-card-counter/
├── blackjack_card_counter/     # Main package
│   ├── __init__.py            (23 lines)  - Entry point
│   ├── __main__.py            (5 lines)   - Module runner
│   ├── constants.py           (37 lines)  - Configuration
│   ├── card.py                (77 lines)  - Card logic
│   ├── ui.py                  (117 lines) - UI components
│   ├── strategy.py            (111 lines) - Game strategy
│   └── game.py                (711 lines) - Game orchestrator
│
├── docs/                       # Documentation
│   ├── POETRY_GUIDE.md        # Poetry usage
│   ├── ARCHITECTURE.md        # This file
│   └── CONTRIBUTING.md        # Contribution guide
│
├── examples/                   # Example scripts
│   └── standalone_game.py     # Original standalone version
│
├── tests/                      # Test suite
│   └── __init__.py            # Tests placeholder
│
├── dist/                       # Built distributions
│   ├── *.whl                  # Wheel files
│   └── *.tar.gz               # Source distributions
│
├── README.md                   # Project overview
├── LICENSE                     # MIT License
├── CHANGELOG.md                # Version history
├── pyproject.toml              # Poetry configuration
├── poetry.lock                 # Locked dependencies
├── requirements.txt            # Pip compatibility
└── .gitignore                  # Git ignore rules
```

---

## 🏗️ Module Architecture

### Overview

```
┌─────────────────┐
│   __init__.py   │  Entry point - exports main()
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│    game.py      │  Main orchestrator
│  BlackjackGame  │
└────┬─────┬──────┘
     │     │
     │     └──────────┐
     │                │
     ▼                ▼
┌──────────┐   ┌──────────────┐
│ card.py  │   │  strategy.py │
│  Card    │   │  Strategies  │
│  Deck    │   └──────────────┘
└──────────┘          ▼
     │         ┌──────────────┐
     │         │   ui.py      │
     │         │   Widgets    │
     │         └──────────────┘
     │                │
     └────────┬───────┘
              ▼
       ┌─────────────┐
       │constants.py │
       │ Config      │
       └─────────────┘
```

---

## 📦 Module Details

### 1. `__init__.py` - Package Entry Point
**Lines:** 23 | **Purpose:** Clean package initialization

**Exports:**
- `main()` - Entry point function
- `BlackjackGame` - Main game class

**Usage:**
```python
from blackjack_card_counter import main, BlackjackGame

# Run game
main()

# Or create instance
game = BlackjackGame()
game.run()
```

---

### 2. `constants.py` - Configuration
**Lines:** 37 | **Purpose:** Central configuration

**Contains:**
- Screen dimensions (SCREEN_WIDTH, SCREEN_HEIGHT, FPS)
- 20+ color definitions
- Card dimensions
- 6 font definitions
- Game constants (SUITS, RANKS)

**Benefits:**
- Single source of truth
- Easy to modify
- No magic numbers

**Usage:**
```python
from blackjack_card_counter.constants import (
    SCREEN_WIDTH, RED, TITLE_FONT
)
```

---

### 3. `card.py` - Card Logic
**Lines:** 77 | **Purpose:** Card and deck operations

**Classes:**
- `Card` - Represents a playing card

**Functions:**
- `create_deck(num_decks)` - Create and shuffle deck
- `calculate_hand_value(hand)` - Calculate blackjack value

**Usage:**
```python
from blackjack_card_counter.card import (
    Card, create_deck, calculate_hand_value
)

deck = create_deck(num_decks=6)
hand = [Card('A', '♠'), Card('K', '♥')]
value = calculate_hand_value(hand)  # 21
```

---

### 4. `ui.py` - UI Components
**Lines:** 117 | **Purpose:** Reusable UI widgets

**Classes:**
- `TextInput` - Numeric input field
- `Button` - Clickable button

**Features:**
- Event handling
- Hover effects
- Enable/disable states
- Input validation

**Usage:**
```python
from blackjack_card_counter.ui import Button, TextInput

button = Button(100, 100, 200, 50, "Click Me", (255, 0, 0))
text_input = TextInput(100, 200, 200, 50, "Amount:")
```

---

### 5. `strategy.py` - Game Strategy
**Lines:** 111 | **Purpose:** Strategy calculations

**Functions:**
- `get_true_count(running, dealt, decks)` - True count
- `get_betting_advice(true_count)` - Betting recommendations
- `get_basic_strategy(player, dealer)` - Basic strategy

**Usage:**
```python
from blackjack_card_counter.strategy import (
    get_true_count, get_betting_advice, get_basic_strategy
)

true_count = get_true_count(12, 52, 6)
units, advice = get_betting_advice(true_count)
action = get_basic_strategy(player_hand, dealer_hand)
```

---

### 6. `game.py` - Game Orchestrator
**Lines:** 711 | **Purpose:** Main game class

**Class:**
- `BlackjackGame` - Complete game implementation

**Responsibilities:**
- Game state management
- Event handling
- Rendering pipeline
- Game flow (deal, hit, stand, split, etc.)
- UI coordination

**Usage:**
```python
from blackjack_card_counter.game import BlackjackGame

game = BlackjackGame()
game.run()  # Start game loop
```

---

## 🎯 Design Principles

### 1. Single Responsibility
Each module has one clear purpose:
- `constants.py` → Configuration
- `card.py` → Card logic
- `ui.py` → User interface
- `strategy.py` → Game strategy
- `game.py` → Orchestration

### 2. Separation of Concerns
- Game logic ≠ UI ≠ Strategy ≠ Data
- Clear boundaries between modules
- Minimal coupling

### 3. DRY (Don't Repeat Yourself)
- Constants defined once
- Reusable UI components
- Shared utility functions

### 4. Testability
- Pure functions where possible
- Isolated components
- Clear inputs/outputs

### 5. Extensibility
- Easy to add new features
- Clear extension points
- Plugin-friendly design

---

## 🧪 Testing Strategy

### Unit Tests
```python
# tests/test_card.py
def test_blackjack():
    hand = [Card('A', '♠'), Card('K', '♥')]
    assert calculate_hand_value(hand) == 21

# tests/test_strategy.py
def test_true_count():
    assert get_true_count(12, 52, 6) == 2
```

### Integration Tests
```python
# tests/test_game.py
def test_game_initialization():
    game = BlackjackGame()
    assert game.bankroll == 1000
    assert len(game.deck) == 312  # 6 decks
```

---

## 🔄 Data Flow

### Game Initialization
```
User runs: blackjack
    ↓
__init__.py → main()
    ↓
game.py → BlackjackGame()
    ↓
constants.py (load config)
    ↓
card.py → create_deck()
    ↓
ui.py → create_buttons()
    ↓
Game ready!
```

### Game Loop
```
Event → game.py → handle_events()
    ↓
Update state
    ↓
strategy.py (get recommendations)
    ↓
card.py (calculate values)
    ↓
ui.py (render components)
    ↓
Draw frame
```

---

## 📊 Code Metrics

| Module | Lines | Purpose | Testability |
|--------|-------|---------|-------------|
| __init__.py | 23 | Entry point | Low |
| __main__.py | 5 | Runner | Low |
| constants.py | 37 | Config | N/A |
| card.py | 77 | Card logic | High |
| ui.py | 117 | UI widgets | Medium |
| strategy.py | 111 | Strategy | High |
| game.py | 711 | Orchestrator | Medium |
| **Total** | **1,081** | | |

---

## 🚀 Extension Points

### Adding New Features

**New Card Game Variant:**
```python
from blackjack_card_counter.game import BlackjackGame

class SpanishBlackjack(BlackjackGame):
    def initialize_deck(self):
        # Remove 10s from deck
        super().initialize_deck()
        self.deck = [c for c in self.deck if c.rank != '10']
```

**New Strategy:**
```python
# In strategy.py
def get_advanced_strategy(hand, dealer, count):
    # Implement advanced strategy
    pass
```

**New UI Widget:**
```python
# In ui.py
class Slider:
    def __init__(self, x, y, width, min_val, max_val):
        # Implement slider widget
        pass
```

---

## 🎓 Best Practices

### When Adding Code
1. Identify correct module (or create new one)
2. Follow existing patterns
3. Add type hints
4. Write docstrings
5. Keep functions small
6. Write tests

### When Refactoring
1. Keep changes focused
2. Don't mix refactoring with features
3. Test after each change
4. Update documentation

### Code Style
- Use Black for formatting
- Follow PEP 8
- Add type hints
- Write clear docstrings
- Keep functions under 50 lines

---

## 📖 Related Documentation

- **README.md** - Project overview
- **POETRY_GUIDE.md** - Building and packaging
- **CONTRIBUTING.md** - Contribution guidelines
- **CHANGELOG.md** - Version history

---

**Clean, modular, maintainable architecture!** 🏗️✨
