# Blackjack Card Counting Trainer

A professionally packaged Pygame-based blackjack card counting trainer with a clean modular architecture. Practice card counting techniques, learn basic strategy, and improve your blackjack skills!

![Python Version](https://img.shields.io/badge/python-3.10%2B-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Package](https://img.shields.io/badge/package-Poetry-blue)

## ✨ Features

- 🎴 **Card Counting Training** - Practice the Hi-Lo card counting system
- 🎯 **Basic Strategy** - Get real-time strategy advice for optimal play
- 💰 **Betting Strategy** - Learn to adjust bets based on true count
- 🃏 **Full Blackjack Rules** - Hit, Stand, Double Down, and Split
- ⚙️ **Customizable Setup** - Choose number of decks (1-8) and starting bankroll
- 🏗️ **Modular Architecture** - Clean, testable, maintainable code structure

## 🏗️ Architecture

This project uses a professional modular architecture:

```
blackjack_card_counter/
├── constants.py    # Colors, fonts, dimensions
├── card.py         # Card class & deck logic
├── ui.py           # Button & TextInput widgets
├── strategy.py     # Strategy calculations
└── game.py         # Main game orchestrator
```

See [MODULAR_ARCHITECTURE.md](MODULAR_ARCHITECTURE.md) for detailed architecture documentation.

## 📦 Installation

### Option 1: Using Poetry (Recommended)

```bash
# Clone the repository
git clone https://github.com/pitcany/blackjack.git
cd blackjack

# Install with Poetry
poetry install

# Run the game
poetry run blackjack
```

### Option 2: Using pip (from built wheel)

```bash
# Install from wheel file
pip install dist/blackjack_card_counter-0.1.0-py3-none-any.whl

# Run the game
blackjack
```

### Option 3: Development Mode

```bash
# Clone and install in editable mode
git clone https://github.com/pitcany/blackjack.git
cd blackjack
pip install -e .

# Run the game
blackjack
```

## 🎮 Usage

### Running the Game

There are three ways to run the game:

```bash
# Method 1: Entry point command (after installation)
blackjack

# Method 2: As a Python module
python -m blackjack_card_counter

# Method 3: Original standalone script (still works!)
python game.py
```

### Using Individual Modules

You can import and use individual components:

```python
# Import card logic
from blackjack_card_counter.card import Card, create_deck, calculate_hand_value

# Create and evaluate a hand
hand = [Card('A', '♠'), Card('K', '♥')]
value = calculate_hand_value(hand)  # Returns 21

# Import strategy functions
from blackjack_card_counter.strategy import get_true_count, get_betting_advice

true_count = get_true_count(running_count=12, cards_dealt=52, num_decks=6)
units, advice = get_betting_advice(true_count)

# Import UI components
from blackjack_card_counter.ui import Button, TextInput

button = Button(x=100, y=100, width=200, height=50, text="Click Me", color=(255, 0, 0))
```

## 🎲 Game Controls

- **HIT** - Take another card
- **STAND** - End your turn
- **DOUBLE** - Double your bet and take one more card
- **SPLIT** - Split matching pairs into two hands
- **DEAL CARDS** - Start a new hand after placing your bet
- **NEW HAND** - Start a new round
- **NEW SHOE** - Shuffle a fresh deck
- **Show Help** - Display card counting guide and strategy tips

### Betting Controls

- Quick bet buttons: $10, $20, $50, $100
- Custom bet: Enter any amount manually
- Edit Bankroll: Adjust your starting funds

## 📊 Card Counting System

The game uses the **Hi-Lo** counting system:

| Cards | Count Value |
|-------|-------------|
| 2, 3, 4, 5, 6 | +1 (low cards) |
| 7, 8, 9 | 0 (neutral) |
| 10, J, Q, K, A | -1 (high cards) |

### Key Metrics

- **Running Count** - Running total as cards are dealt
- **True Count** - Running Count ÷ Decks Remaining
- **Betting Strategy** - Increase bets when True Count is +2 or higher

## 🎯 Game Rules

- Dealer must hit on 16 and stand on 17
- Blackjack pays 3:2
- You can split pairs and double down
- Each split hand can be doubled independently

## 💡 Strategy Tips

1. **Basic Strategy** - Follow the recommendations shown during play
2. **Card Counting** - Keep track of the running count
3. **Betting** - Bet minimum when count is negative, increase when positive
4. **Bankroll Management** - Don't bet more than you can afford to lose

## 🛠️ Development

### Development Tools

The project includes development dependencies:

```bash
# Install with dev dependencies
poetry install --extras dev

# Format code
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

### Project Structure

```
blackjack/
├── blackjack_card_counter/  # Main package
│   ├── __init__.py         # Entry point
│   ├── constants.py        # Configuration
│   ├── card.py             # Card logic
│   ├── ui.py               # UI components
│   ├── strategy.py         # Strategy logic
│   └── game.py             # Game orchestrator
├── dist/                   # Built distributions
├── tests/                  # Test directory
├── pyproject.toml          # Poetry configuration
├── poetry.lock             # Locked dependencies
└── README.md               # This file
```

### Building

#### Quick Build
```bash
# Build both wheel and source distribution
poetry build
```

**Output:**
```
dist/
├── blackjack_card_counter-0.1.0-py3-none-any.whl  # Wheel (fast install)
└── blackjack_card_counter-0.1.0.tar.gz            # Source distribution
```

#### Build Workflows

**Standard Build:**
```bash
# 1. Install dependencies
poetry install

# 2. Verify configuration
poetry check

# 3. Build packages
poetry build
```

**Clean Build:**
```bash
# Remove old builds
rm -rf dist/

# Build fresh
poetry build
```

**Build Specific Format:**
```bash
# Build only wheel
poetry build --format wheel

# Build only source distribution
poetry build --format sdist
```

**Version Bump & Build:**
```bash
# Bump version (patch: 0.1.0 → 0.1.1)
poetry version patch

# Build with new version
poetry build
```

#### Pre-Build Checklist
```bash
# Format code
poetry run black blackjack_card_counter/

# Sort imports
poetry run isort blackjack_card_counter/

# Lint
poetry run flake8 blackjack_card_counter/

# Verify config
poetry check

# Build
poetry build
```

#### Verify Build
```bash
# Check built files
ls -lh dist/

# Inspect wheel contents
unzip -l dist/blackjack_card_counter-*.whl

# Test installation
pip install dist/blackjack_card_counter-*.whl
blackjack
```

#### Distribute
```bash
# Share wheel file
cp dist/blackjack_card_counter-*.whl ~/Downloads/

# Or create archive
zip -r blackjack-dist.zip dist/

# Upload to GitHub releases or share directly
```

### Testing

```python
# Example unit tests
from blackjack_card_counter.card import Card, calculate_hand_value

def test_blackjack():
    hand = [Card('A', '♠'), Card('K', '♥')]
    assert calculate_hand_value(hand) == 21

def test_soft_hand():
    hand = [Card('A', '♠'), Card('6', '♥')]
    assert calculate_hand_value(hand) == 17  # Soft 17
```

## 📚 Documentation

- **[SETUP_COMPLETE.md](SETUP_COMPLETE.md)** - Complete Poetry setup guide
- **[POETRY_GUIDE.md](POETRY_GUIDE.md)** - Poetry commands reference
- **[MODULAR_ARCHITECTURE.md](MODULAR_ARCHITECTURE.md)** - Architecture documentation
- **[PROJECT_TREE.txt](PROJECT_TREE.txt)** - Project structure overview

## 🤝 Contributing

Contributions are welcome! The modular architecture makes it easy to:

1. Add new features (create new modules)
2. Fix bugs (isolated components)
3. Improve strategy (edit `strategy.py`)
4. Enhance UI (modify `ui.py`)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🎓 Educational Purpose

This is a training tool for educational purposes. Card counting is legal but may not be welcome in casinos. Use this tool to:

- Learn probability and statistics
- Practice mental arithmetic
- Understand game theory
- Improve decision-making skills

## 🙏 Acknowledgments

- Built with [Pygame](https://www.pygame.org/)
- Packaged with [Poetry](https://python-poetry.org/)
- Follows [PEP 621](https://peps.python.org/pep-0621/) standards

## 📞 Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Check the documentation files
- Review the modular architecture guide

---

**Enjoy practicing your blackjack skills!** 🎰✨
