# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A Pygame-based blackjack card counting trainer with a professionally structured modular architecture. The application helps users practice the Hi-Lo card counting system and basic blackjack strategy.

**Key Technologies:** Python 3.10+, Pygame 2.6+, Poetry for dependency management

## Development Commands

### Running the Application

```bash
# Method 1: Entry point command (after installation)
blackjack

# Method 2: As a Python module
python -m blackjack_card_counter

# Method 3: Direct script execution
python game.py
```

### Building and Installing

```bash
# Install dependencies with Poetry
poetry install

# Install with dev dependencies
poetry install --with dev

# Build distributions
poetry build
# Creates: dist/blackjack_card_counter-0.1.0-py3-none-any.whl
#          dist/blackjack_card_counter-0.1.0.tar.gz

# Install from built wheel
pip install dist/blackjack_card_counter-0.1.0-py3-none-any.whl
```

### Code Quality Tools

```bash
# Format code (line length: 100)
poetry run black blackjack_card_counter/

# Sort imports
poetry run isort blackjack_card_counter/

# Lint code
poetry run flake8 blackjack_card_counter/

# Type check
poetry run mypy blackjack_card_counter/

# Run tests (when available)
poetry run pytest
```

## Architecture

### Module Structure

The codebase follows a **separation of concerns** pattern with 6 focused modules:

```
blackjack_card_counter/
├── __init__.py       # Package entry point - exports main() and BlackjackGame
├── __main__.py       # Module runner (python -m support)
├── constants.py      # Centralized configuration (colors, fonts, dimensions, game constants)
├── card.py           # Card logic (Card class, deck creation, hand value calculation)
├── ui.py             # Reusable UI widgets (Button, TextInput)
├── strategy.py       # Strategy calculations (true count, betting advice, basic strategy)
└── game.py           # Main game orchestrator (BlackjackGame class)
```

### Dependency Flow

```
__init__.py
    ↓
game.py (BlackjackGame)
    ↓
    ├── card.py (Card, create_deck, calculate_hand_value)
    ├── strategy.py (get_true_count, get_betting_advice, get_basic_strategy)
    ├── ui.py (Button, TextInput)
    └── constants.py (all configuration)
```

**Key principle:** Lower-level modules (card.py, ui.py, strategy.py, constants.py) have no dependencies on game.py. Only game.py orchestrates the other modules.

### Module Responsibilities

- **constants.py**: All magic numbers, colors, fonts, screen dimensions, game constants (SUITS, RANKS)
- **card.py**: Card representation, deck management, blackjack hand value calculation, Hi-Lo count values
- **ui.py**: Reusable UI components with event handling and rendering (Button, TextInput)
- **strategy.py**: Pure strategy logic - true count calculation, betting advice based on count, basic strategy recommendations
- **game.py**: Game state management, event loop, rendering coordination, game flow (betting → playing → dealer → finished)

### Game State Machine

The game follows a state machine pattern in `BlackjackGame`:

```
betting → playing → dealer → finished
   ↑                            ↓
   └────────────────────────────┘
```

States:
- **betting**: Player places bet and deals cards
- **playing**: Player makes decisions (hit, stand, double, split)
- **dealer**: Dealer plays automatically (must hit on 16, stand on 17)
- **finished**: Hand resolved, showing results

### Split Hand Logic

Split hands are managed via:
- `is_split`: Boolean flag
- `split_hands`: List of 2 hands
- `active_split_hand`: Index (0 or 1) of currently active hand
- `split_doubled`: Tracks if each hand was doubled

When split, the game plays hand 1 first, then hand 2. Winnings/losses are calculated independently for each hand.

## Hi-Lo Card Counting System

The core counting logic is in `card.py:Card.get_count_value()`:

- **+1**: Cards 2, 3, 4, 5, 6 (low cards favor dealer)
- **0**: Cards 7, 8, 9 (neutral)
- **-1**: Cards 10, J, Q, K, A (high cards favor player)

**Running Count**: Cumulative sum updated as each card is dealt
**True Count**: Running Count ÷ Decks Remaining (calculated in `strategy.py:get_true_count()`)

The count is updated in `game.py` whenever cards are dealt to player/dealer or revealed.

## Basic Strategy Implementation

Strategy recommendations are in `strategy.py:get_basic_strategy()`. The logic follows standard blackjack basic strategy:

1. **Pair splitting**: Always split Aces and 8s, conditional splits for other pairs
2. **Soft hands** (with Ace): Stand on soft 19+, conditional double on soft 18
3. **Hard hands**: Stand on 17+, stand on 12-16 vs dealer 2-6, else hit

The function takes `player_hand`, `dealer_hand`, and `is_split` flag, returning recommendation: 'HIT', 'STAND', 'DOUBLE', or 'SPLIT'.

## Configuration and Customization

All configuration lives in `constants.py`:

- **Screen**: SCREEN_WIDTH (1400), SCREEN_HEIGHT (900), FPS (60)
- **Colors**: 20+ named colors (GREEN, DARK_GREEN, GOLD, etc.)
- **Fonts**: 6 different font sizes (TITLE_FONT through TINY_FONT, plus CARD_FONT)
- **Cards**: CARD_WIDTH (70), CARD_HEIGHT (100)
- **Game**: SUITS, RANKS lists

To modify appearance, edit `constants.py` only - changes propagate throughout.

## Testing Approach

The modular structure enables unit testing of isolated components:

```python
# Test card logic
from blackjack_card_counter.card import Card, calculate_hand_value
hand = [Card('A', '♠'), Card('K', '♥')]
assert calculate_hand_value(hand) == 21

# Test strategy
from blackjack_card_counter.strategy import get_true_count
assert get_true_count(12, 52, 6) == 2

# Test count values
card = Card('5', '♠')
assert card.get_count_value() == 1
```

Tests should be placed in `tests/` directory (create if needed) with `test_*.py` naming convention.

## Common Development Workflows

### Adding New Features

1. Identify the appropriate module (or create new one)
2. Keep modules focused on single responsibility
3. Use constants from `constants.py` - never hardcode values
4. Update game.py to orchestrate new feature if needed

### Modifying Game Rules

- **Card values**: Edit `card.py:calculate_hand_value()`
- **Strategy recommendations**: Edit `strategy.py:get_basic_strategy()`
- **Betting advice**: Edit `strategy.py:get_betting_advice()`
- **Dealer rules**: Edit `game.py:dealer_play()`

### Adding UI Components

1. Create reusable widget in `ui.py` (follow Button/TextInput pattern)
2. Initialize in `game.py:create_buttons()`
3. Handle events in `game.py:handle_events()`
4. Draw in `game.py:draw()`

### Performance Considerations

- Card drawing happens every frame (60 FPS)
- Dealer plays with 500ms delay between cards (`pygame.time.wait(500)`)
- Deck reshuffles when <20 cards remain
- No heavy computation - all calculations are O(hand_size) or less

## Important Implementation Details

### Card Visibility and Count Updates

The running count is updated strategically:
- Player cards: Immediately when dealt
- Dealer's first card: Immediately (face-up)
- Dealer's second card: Only when revealed (on dealer's turn)

This mimics real casino conditions where you can't count the dealer's hole card.

### Hand Value Calculation

Aces are handled dynamically in `calculate_hand_value()`:
- Initially counted as 11
- Reduced to 1 (by subtracting 10) if hand would bust
- Multiple aces handled correctly (only one can be 11)

### Button Enable/Disable Logic

Buttons (double, split) are enabled/disabled based on game state:
- **Double**: Only on 2-card hands with sufficient bankroll
- **Split**: Only on matching pairs (same rank) that aren't already split, with sufficient bankroll

This is calculated in `game.py:draw()` around line 615-628.

## Package Entry Points

Three equivalent ways to launch, all defined in pyproject.toml:

1. `blackjack` command - configured via `[project.scripts]`
2. `python -m blackjack_card_counter` - uses `__main__.py`
3. `python game.py` - legacy standalone script (backward compatibility)

All three initialize Pygame and call `BlackjackGame().run()`.

## Code Style

- **Line length**: 100 characters (Black formatter)
- **Import order**: isort with Black profile
- **Type hints**: Present on function signatures, not enforced strictly (mypy configured loose)
- **Docstrings**: Google-style docstrings on public functions
- **Naming**: snake_case for functions/variables, PascalCase for classes

## Known Patterns and Conventions

- All game state is in `BlackjackGame` class attributes (no global state)
- UI elements created in `create_buttons()`, stored as instance attributes
- Event handling returns boolean: `handle_event()` returns True if event was "consumed"
- Drawing functions take `screen` parameter explicitly
- Colors/fonts passed by name from constants, not inline RGB tuples
