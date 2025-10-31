# Blackjack Card Counting Trainer

A Pygame-based blackjack card counting trainer application that helps users practice card counting techniques and basic blackjack strategy.

## Features

- **Card Counting Training**: Practice the Hi-Lo card counting system
- **Basic Strategy**: Get real-time strategy advice for optimal play
- **Betting Strategy**: Learn to adjust bets based on true count
- **Full Blackjack Rules**: Hit, Stand, Double Down, and Split
- **Customizable Setup**: Choose number of decks (1-8) and starting bankroll

## Installation

### Using Conda (Recommended)

If you have a conda environment with pygame already installed:
```bash
conda activate ykp
python game.py
```

### Using pip

1. Install Python 3.8 or higher
2. Install dependencies:
```bash
pip install -r requirements.txt
```

### Creating a New Conda Environment

```bash
conda create -n blackjack python=3.10
conda activate blackjack
pip install pygame
```

## Usage

Run the game:
```bash
python game.py
```

### Game Controls

- **HIT**: Take another card
- **STAND**: End your turn
- **DOUBLE**: Double your bet and take one more card
- **SPLIT**: Split matching pairs into two hands
- **DEAL CARDS**: Start a new hand after placing your bet
- **NEW HAND**: Start a new round
- **NEW SHOE**: Shuffle a fresh deck
- **Show Help**: Display card counting guide and strategy tips

### Betting Buttons

- Quick bet buttons: $10, $20, $50, $100
- Custom bet: Enter any amount manually
- Edit Bankroll: Adjust your starting funds

### Card Counting System

The game uses the **Hi-Lo** counting system:
- **+1**: Cards 2, 3, 4, 5, 6 (low cards)
- **0**: Cards 7, 8, 9 (neutral)
- **-1**: Cards 10, J, Q, K, A (high cards)

**Running Count**: Running total as cards are dealt
**True Count**: Running Count ÷ Decks Remaining
**Betting**: Increase bets when True Count is +2 or higher

## Game Rules

- Dealer must hit on 16 and stand on 17
- Blackjack pays 3:2
- You can split pairs and double down
- Each split hand can be doubled independently

## Strategy Tips

1. **Basic Strategy**: Follow the recommendations shown during play
2. **Card Counting**: Keep track of the running count
3. **Betting**: Bet minimum when count is negative, increase when positive
4. **Bankroll Management**: Don't bet more than you can afford to lose

## License

This is a training tool for educational purposes.

