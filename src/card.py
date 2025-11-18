"""Card and Deck classes for Blackjack game."""
import random
from typing import List, Tuple
from enum import Enum


class Suit(Enum):
    """Card suits."""
    HEARTS = '♥'
    DIAMONDS = '♦'
    CLUBS = '♣'
    SPADES = '♠'


class Card:
    """Represents a playing card."""

    RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']

    def __init__(self, rank: str, suit: Suit):
        """Initialize a card.

        Args:
            rank: Card rank (A, 2-10, J, Q, K)
            suit: Card suit (Suit enum)
        """
        if rank not in self.RANKS:
            raise ValueError(f"Invalid rank: {rank}")
        self.rank = rank
        self.suit = suit

    @property
    def value(self) -> int:
        """Get the blackjack value of the card (not counting Ace as 11)."""
        if self.rank == 'A':
            return 1  # Aces handled separately in hand evaluation
        elif self.rank in ['J', 'Q', 'K']:
            return 10
        else:
            return int(self.rank)

    @property
    def count_value(self) -> int:
        """Get the Hi-Lo count value of the card."""
        if self.rank in ['2', '3', '4', '5', '6']:
            return 1
        elif self.rank in ['10', 'J', 'Q', 'K', 'A']:
            return -1
        else:
            return 0

    def __str__(self) -> str:
        """String representation of the card."""
        return f"{self.rank}{self.suit.value}"

    def __repr__(self) -> str:
        """Detailed representation of the card."""
        return f"Card({self.rank}, {self.suit.name})"


class Deck:
    """Represents a multi-deck shoe for Blackjack."""

    def __init__(self, num_decks: int = 6):
        """Initialize a multi-deck shoe.

        Args:
            num_decks: Number of decks to use (default: 6)
        """
        self.num_decks = num_decks
        self.cards: List[Card] = []
        self.dealt_cards: List[Card] = []
        self.reset()

    def reset(self):
        """Reset and shuffle the deck."""
        self.cards = []
        self.dealt_cards = []

        # Create multiple decks
        for _ in range(self.num_decks):
            for suit in Suit:
                for rank in Card.RANKS:
                    self.cards.append(Card(rank, suit))

        # Shuffle
        random.shuffle(self.cards)

    def deal_card(self) -> Card:
        """Deal a single card from the deck.

        Returns:
            Card: The dealt card

        Raises:
            ValueError: If deck is empty
        """
        if not self.cards:
            raise ValueError("Deck is empty")

        card = self.cards.pop()
        self.dealt_cards.append(card)
        return card

    def cards_remaining(self) -> int:
        """Get the number of cards remaining in the deck."""
        return len(self.cards)

    def decks_remaining(self) -> float:
        """Get the approximate number of decks remaining."""
        cards_per_deck = 52
        return self.cards_remaining() / cards_per_deck

    def needs_shuffle(self, penetration: float = 0.75) -> bool:
        """Check if deck needs reshuffling based on penetration.

        Args:
            penetration: Fraction of cards that should be dealt before shuffle

        Returns:
            bool: True if deck should be reshuffled
        """
        total_cards = self.num_decks * 52
        dealt_fraction = len(self.dealt_cards) / total_cards
        return dealt_fraction >= penetration


class Hand:
    """Represents a hand of cards in Blackjack."""

    def __init__(self):
        """Initialize an empty hand."""
        self.cards: List[Card] = []
        self.bet: int = 0
        self.is_split: bool = False
        self.is_doubled: bool = False
        self.is_surrendered: bool = False

    def add_card(self, card: Card):
        """Add a card to the hand."""
        self.cards.append(card)

    def get_values(self) -> Tuple[int, int]:
        """Get possible values of the hand (soft, hard).

        Returns:
            Tuple of (soft_total, hard_total)
            - soft_total: Value with Ace counted as 11 (or 0 if bust)
            - hard_total: Value with all Aces counted as 1
        """
        hard_total = sum(card.value for card in self.cards)
        aces = sum(1 for card in self.cards if card.rank == 'A')

        # Try to use one Ace as 11
        soft_total = hard_total
        if aces > 0 and hard_total + 10 <= 21:
            soft_total = hard_total + 10

        return (soft_total, hard_total)

    def get_value(self) -> int:
        """Get the best value of the hand."""
        soft, hard = self.get_values()
        # Use soft value if it doesn't bust
        return soft if soft <= 21 else hard

    def is_soft(self) -> bool:
        """Check if hand is soft (has an Ace counted as 11)."""
        soft, hard = self.get_values()
        return soft != hard and soft <= 21

    def is_bust(self) -> bool:
        """Check if hand is bust (over 21)."""
        return self.get_value() > 21

    def is_blackjack(self) -> bool:
        """Check if hand is a natural blackjack."""
        return len(self.cards) == 2 and self.get_value() == 21

    def is_pair(self) -> bool:
        """Check if hand is a pair (for splitting)."""
        if len(self.cards) != 2:
            return False
        # Consider 10-value cards as pairs for splitting purposes
        return self.cards[0].value == self.cards[1].value

    def can_split(self) -> bool:
        """Check if hand can be split."""
        return self.is_pair() and not self.is_split

    def can_double(self) -> bool:
        """Check if hand can be doubled down."""
        return len(self.cards) == 2 and not self.is_doubled

    def __str__(self) -> str:
        """String representation of the hand."""
        cards_str = ', '.join(str(card) for card in self.cards)
        value = self.get_value()
        soft_str = " (soft)" if self.is_soft() else ""
        return f"[{cards_str}] = {value}{soft_str}"

    def __repr__(self) -> str:
        """Detailed representation of the hand."""
        return f"Hand({self.cards}, value={self.get_value()})"
