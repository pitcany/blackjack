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

    def __post_init__(self):
        """Validate configuration values."""
        if self.num_decks < 1 or self.num_decks > 8:
            raise ValueError(f"num_decks must be 1-8, got {self.num_decks}")
        if self.starting_bankroll <= 0:
            raise ValueError(f"starting_bankroll must be positive, got {self.starting_bankroll}")
        if self.min_bet <= 0:
            raise ValueError(f"min_bet must be positive, got {self.min_bet}")
        if self.max_bet < self.min_bet:
            raise ValueError(f"max_bet ({self.max_bet}) must be >= min_bet ({self.min_bet})")
        if self.blackjack_payout <= 0:
            raise ValueError(f"blackjack_payout must be positive, got {self.blackjack_payout}")
        if not (0.1 <= self.penetration <= 1.0):
            raise ValueError(f"penetration must be 0.1-1.0, got {self.penetration}")
        if self.max_splits < 0:
            raise ValueError(f"max_splits must be non-negative, got {self.max_splits}")
        if self.insurance_pays <= 0:
            raise ValueError(f"insurance_pays must be positive, got {self.insurance_pays}")


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
        """Set default cards_per_round based on drill_type when left at default."""
        default_cpr = 1  # default field value
        if self.cards_per_round == default_cpr:
            if self.drill_type == "hand":
                self.cards_per_round = 2
            elif self.drill_type == "round":
                self.cards_per_round = 4  # 2 player + 2 dealer
