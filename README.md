# Blackjack Game with Card Counting Simulator & Basic Strategy Integration

A comprehensive desktop application for playing Blackjack with integrated card counting simulation and basic strategy guidance.

![Python Version](https://img.shields.io/badge/python-3.7%2B-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## Features

### Core Game Mechanics
- **Full Blackjack Implementation**
  - Multi-deck shoe (6 decks by default, configurable)
  - Dealer hits soft 17 (H17 rules)
  - Double After Split (DAS) allowed
  - Standard splitting, doubling, and surrender options
  - Blackjack pays 3:2

### Card Counting System
- **Hi-Lo Counting Method**
  - Real-time running count display
  - True count calculation based on remaining decks
  - Suggested bet sizing based on count
  - Player advantage estimation
  - Count status indicators (Favorable/Unfavorable)

### Basic Strategy Integration
- **Optimal Play Recommendations**
  - Real-time strategy suggestions for every hand
  - Covers all scenarios: hard hands, soft hands, and pairs
  - Accurate for Multi-Deck, H17, DAS rules
  - Action explanations available

### Graphical User Interface
- **Clean, Intuitive Design**
  - Visual card representation with suits
  - Real-time statistics display
  - Session tracking (wins, losses, win rate)
  - Balance management
  - Context-sensitive action buttons
  - Color-coded card counting information

## Installation

### Prerequisites
- Python 3.7 or higher
- Tkinter (usually comes with Python)

### Setup

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd blackjack
   ```

2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

   Note: This project uses only Python standard library, so no external packages are required.

3. **Run the game:**
   ```bash
   python main.py
   ```

## Usage

### Starting a Game

1. **Launch the application:**
   ```bash
   python main.py
   ```

2. **Place your bet:**
   - Enter a bet amount (between $10-$500 by default)
   - Or use quick bet buttons ($10, $25, $50, $100)
   - Or click "Use Suggested Bet" to use the card counting recommendation
   - Click "DEAL" to start the round

3. **Play your hand:**
   - The game will display your cards and the dealer's up-card
   - Available actions will be highlighted:
     - **HIT**: Take another card
     - **STAND**: End your turn
     - **DOUBLE DOWN**: Double your bet and receive one card (only on first two cards)
     - **SPLIT**: Split pairs into two hands (requires additional bet)
     - **SURRENDER**: Forfeit half your bet and end the hand (only on first two cards)

4. **Follow the strategy recommendation:**
   - The green text shows the optimal play based on basic strategy
   - This recommendation considers your hand, dealer's up-card, and available actions

5. **Watch the dealer play:**
   - After you stand, the dealer reveals their hole card
   - Dealer hits on 16 or less, stands on hard 17 or higher
   - Dealer hits on soft 17 (Ace-6)

6. **Start a new round:**
   - Click "NEW ROUND" after the current round ends
   - Your winnings/losses are automatically calculated

### Understanding Card Counting

#### The Hi-Lo System
The application uses the Hi-Lo card counting system:

- **Low cards (2-6):** +1
- **Neutral cards (7-9):** 0
- **High cards (10-A):** -1

#### Running Count vs. True Count
- **Running Count:** The cumulative sum of card values dealt
- **True Count:** Running count divided by remaining decks (more accurate)

#### Using the Count
- **True Count ≤ 1:** Minimum bet (house advantage)
- **True Count > 1:** Increase bet (player advantage)
- The "Suggested Bet" uses the formula: Base Bet × True Count (capped at table limits)

#### Count Status
- **Very Unfavorable:** True count ≤ -2 (strong house edge)
- **Unfavorable:** True count ≤ 0
- **Neutral:** True count ≈ 1
- **Favorable:** True count 2-3 (player edge)
- **Very Favorable:** True count > 3 (strong player edge)

### Basic Strategy Chart

The application implements optimal basic strategy for:
- **Rules:** Multi-Deck, H17, DAS
- **Hard Hands:** 5-20
- **Soft Hands:** A-2 through A-9
- **Pairs:** 2-2 through A-A

#### Key Strategy Points
- **Always split Aces and 8s**
- **Never split 10s**
- **Always hit 11 or less**
- **Always stand on hard 17+**
- **Surrender 16 vs dealer 9, 10, A (if allowed)**
- **Double on 11 vs any dealer card**
- **Soft 18 is tricky:** Hit vs 9,10,A; Double vs 2-6; Stand vs 7-8

## Game Statistics

The application tracks:
- **Balance:** Current bankroll
- **Rounds Played:** Total hands played
- **Wins/Losses:** Win-loss record
- **Win Rate:** Percentage of hands won
- **Total Wagered:** Lifetime bets placed
- **Total Won:** Lifetime winnings
- **Net Profit/Loss:** Overall profit/loss

## Project Structure

```
blackjack/
├── src/
│   ├── __init__.py          # Package initialization
│   ├── card.py              # Card, Deck, and Hand classes
│   ├── counter.py           # Card counting logic (Hi-Lo)
│   ├── strategy.py          # Basic strategy engine
│   ├── game.py              # Game logic and state management
│   └── gui.py               # Tkinter GUI implementation
├── tests/
│   ├── __init__.py
│   ├── test_card.py         # Card/Deck/Hand tests
│   ├── test_counter.py      # Card counting tests
│   ├── test_strategy.py     # Strategy engine tests
│   └── test_game.py         # Game logic tests
├── main.py                  # Application entry point
├── requirements.txt         # Python dependencies
└── README.md               # This file
```

## Running Tests

Run the full test suite:
```bash
python -m unittest discover tests
```

Run specific test modules:
```bash
python -m unittest tests.test_card
python -m unittest tests.test_counter
python -m unittest tests.test_strategy
python -m unittest tests.test_game
```

## Configuration

You can modify game parameters in `main.py` or when initializing `BlackjackGame`:

```python
game = BlackjackGame(
    num_decks=6,              # Number of decks in shoe
    starting_balance=1000,     # Starting player balance
    min_bet=10,                # Minimum bet
    max_bet=500,               # Maximum bet
    allow_surrender=True,      # Enable/disable surrender
    allow_double_after_split=True  # Enable/disable DAS
)
```

## Technical Details

### Card Counting Implementation
- **Running count** is updated in real-time as cards are dealt
- **True count** is calculated by dividing running count by remaining decks
- **Bet suggestions** follow the Kelly Criterion approximation
- Count resets when deck is shuffled (75% penetration by default)

### Basic Strategy Engine
- Uses lookup tables for optimal play decisions
- Separate tables for pairs, soft hands, and hard hands
- Handles conditional actions (e.g., "Double if allowed, otherwise Hit")
- Accounts for game rules (H17, DAS)

### Game Rules
- **Dealer:** Hits soft 17, stands on hard 17+
- **Blackjack:** Pays 3:2
- **Insurance:** Not implemented (never optimal per basic strategy)
- **Splitting:** Allowed up to 4 hands (with sufficient balance)
- **Double After Split:** Allowed
- **Resplit Aces:** Not allowed (standard casino rules)

## Tips for Players

1. **Practice Basic Strategy:** The recommendations are mathematically optimal—follow them!
2. **Use Card Counting Wisely:** Bet more when the count is favorable, minimum when unfavorable
3. **Manage Your Bankroll:** Don't bet more than 1-2% of your balance per hand
4. **Understand Variance:** Even with perfect play, you'll have losing streaks
5. **Never Take Insurance:** It's a sucker bet (not even offered in this simulator)

## Common Blackjack Terms

- **Hard Hand:** Hand without an Ace counted as 11
- **Soft Hand:** Hand with an Ace counted as 11
- **Bust:** Hand value exceeds 21
- **Push:** Tie with dealer (bet returned)
- **Blackjack/Natural:** Ace + 10-value card on initial deal
- **Hole Card:** Dealer's face-down card
- **Up Card:** Dealer's face-up card
- **Shoe:** Container holding multiple decks
- **Penetration:** Percentage of cards dealt before shuffle

## Development

### Adding New Features
The codebase is modular and extensible:

- **New counting systems:** Extend `CardCounter` class
- **Different rules:** Modify `BasicStrategy` tables or `BlackjackGame` parameters
- **Enhanced GUI:** Extend `BlackjackGUI` class
- **Statistics/Analytics:** Add tracking to `BlackjackGame.get_statistics()`

### Contributing
Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

## Known Limitations

- Single player only (no multiplayer support)
- No persistence (statistics reset when application closes)
- Basic card visualization (no custom card images)
- No sound effects
- No tutorials/help system within the app

## Future Enhancements

Potential improvements:
- [ ] Multiple players at the table
- [ ] Save/load game sessions
- [ ] Enhanced card graphics
- [ ] Sound effects and animations
- [ ] Tutorial mode for beginners
- [ ] CSV export of game statistics
- [ ] Additional counting systems (KO, Omega II, etc.)
- [ ] Deviation indices for count-based strategy adjustments
- [ ] Risk of ruin calculator

## License

This project is licensed under the MIT License. See LICENSE file for details.

## Disclaimer

This software is for **educational and entertainment purposes only**. Card counting is legal but may be prohibited by casinos. Always gamble responsibly and within your means. The developers are not responsible for any gambling losses incurred using knowledge from this application.

## Acknowledgments

- Basic strategy based on professional Blackjack literature
- Hi-Lo counting system developed by Harvey Dubner
- Game rules follow standard casino practices

## Support

For bugs, feature requests, or questions:
- Open an issue on GitHub
- Check existing documentation
- Review the test files for usage examples

## Version History

### Version 1.0.0 (Current)
- Initial release
- Full Blackjack implementation
- Hi-Lo card counting system
- Basic strategy engine
- Tkinter GUI
- Comprehensive test suite

---

**Enjoy the game and happy counting!** 🃏♠️♥️♣️♦️
