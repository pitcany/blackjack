"""Configuration classes for Blackjack game and counting trainer."""

from dataclasses import dataclass, field
from typing import Literal


@dataclass
class GameConfig:
    """Configuration for the Blackjack game."""
    
    num_decks: int = 6
    starting_bankroll: int = 1000
    min_bet: int = 10
    max_bet: int = 500
    blackjack_payout: float = 1.5  # 3:2 payout
    dealer_hits_soft_17: bool = False  # S17 by default
    double_after_split: bool = True
    split_aces_one_card_only: bool = True
    max_splits: int = 3
    insurance_pays: float = 2.0
    penetration: float = 0.75  # Reshuffle at 75% dealt
    allow_split_by_value: bool = False  # Default: same rank only for split


@dataclass
class CountingTrainerConfig:
    """Configuration for the card counting trainer."""
    
    num_decks: int = 6
    drill_type: Literal["single_card", "hand", "round"] = "single_card"
    cards_per_round: int = 1  # For single_card; auto-set for others
    ask_true_count: bool = False
    speed_ms_per_card: int = 1000  # Milliseconds per card in flash mode
    time_limit_seconds: int | None = None
    show_history: bool = True
    
    def __post_init__(self):
        """Adjust cards_per_round based on drill_type if not explicitly set."""
        if self.drill_type == "hand":
            self.cards_per_round = 2
        elif self.drill_type == "round":
            self.cards_per_round = 4  # 2 player + 2 dealer
