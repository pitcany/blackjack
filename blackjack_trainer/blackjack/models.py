"""Core data models for Blackjack game."""

from dataclasses import dataclass, field
from enum import Enum, auto
from typing import List, Optional


class Suit(Enum):
    """Card suits."""
    HEARTS = "♥"
    DIAMONDS = "♦"
    CLUBS = "♣"
    SPADES = "♠"


class Rank(Enum):
    """Card ranks with their base values."""
    TWO = (2, "2")
    THREE = (3, "3")
    FOUR = (4, "4")
    FIVE = (5, "5")
    SIX = (6, "6")
    SEVEN = (7, "7")
    EIGHT = (8, "8")
    NINE = (9, "9")
    TEN = (10, "10")
    JACK = (10, "J")
    QUEEN = (10, "Q")
    KING = (10, "K")
    ACE = (11, "A")  # Base value 11, adjusted to 1 in hand calculations
    
    def __init__(self, value: int, symbol: str):
        self._value_ = value
        self.symbol = symbol
    
    @property
    def base_value(self) -> int:
        """Return the base value of the card."""
        return self._value_


class Action(Enum):
    """Player actions in Blackjack."""
    HIT = auto()
    STAND = auto()
    DOUBLE = auto()
    SPLIT = auto()
    INSURANCE = auto()


class GamePhase(Enum):
    """Phases of a Blackjack round."""
    BETTING = auto()
    DEALING = auto()
    INSURANCE_OFFER = auto()
    PLAYER_TURN = auto()
    DEALER_TURN = auto()
    ROUND_OVER = auto()


@dataclass
class Card:
    """Represents a playing card."""
    rank: Rank
    suit: Suit
    
    def __str__(self) -> str:
        """Return string representation like 'A♠'."""
        return f"{self.rank.symbol}{self.suit.value}"
    
    def __repr__(self) -> str:
        return self.__str__()
    
    @property
    def base_value(self) -> int:
        """Return the base value of the card."""
        return self.rank.base_value


@dataclass
class PlayerHandState:
    """State of a player's hand."""
    hand_id: int
    cards: List[Card] = field(default_factory=list)
    bet: int = 0
    is_active: bool = False
    is_doubled: bool = False
    is_split_child: bool = False
    resolved: bool = False
    result: Optional[str] = None
    
    def copy(self) -> 'PlayerHandState':
        """Create a copy of this hand state."""
        return PlayerHandState(
            hand_id=self.hand_id,
            cards=self.cards.copy(),
            bet=self.bet,
            is_active=self.is_active,
            is_doubled=self.is_doubled,
            is_split_child=self.is_split_child,
            resolved=self.resolved,
            result=self.result
        )


@dataclass
class TableState:
    """Complete state of the Blackjack table."""
    bankroll: int = 1000
    current_bet: int = 0
    player_hands: List[PlayerHandState] = field(default_factory=list)
    dealer_cards: List[Card] = field(default_factory=list)
    phase: GamePhase = GamePhase.BETTING
    message: str = "Place your bet"
    running_count: int = 0
    decks_remaining_estimate: float = 6.0
    insurance_bet: int = 0
    active_hand_index: int = 0
    split_count: int = 0
    
    def copy(self) -> 'TableState':
        """Create a deep copy of the table state."""
        return TableState(
            bankroll=self.bankroll,
            current_bet=self.current_bet,
            player_hands=[h.copy() for h in self.player_hands],
            dealer_cards=self.dealer_cards.copy(),
            phase=self.phase,
            message=self.message,
            running_count=self.running_count,
            decks_remaining_estimate=self.decks_remaining_estimate,
            insurance_bet=self.insurance_bet,
            active_hand_index=self.active_hand_index,
            split_count=self.split_count
        )
