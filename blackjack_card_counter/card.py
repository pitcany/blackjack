"""Card class and deck management."""
import random
from typing import List

from .constants import SUITS, RANKS


class Card:
    """Represents a playing card."""

    def __init__(self, rank: str, suit: str):
        self.rank = rank
        self.suit = suit

    def get_count_value(self) -> int:
        """Get the Hi-Lo count value for this card.

        Returns:
            1 for low cards (2-6)
            0 for neutral cards (7-9)
            -1 for high cards (10, J, Q, K, A)
        """
        if self.rank in ['2', '3', '4', '5', '6']:
            return 1
        elif self.rank in ['10', 'J', 'Q', 'K', 'A']:
            return -1
        return 0

    def __repr__(self) -> str:
        return f"{self.rank}{self.suit}"


def create_deck(num_decks: int = 6) -> List[Card]:
    """Create and shuffle a deck of cards.

    Args:
        num_decks: Number of decks to include (1-8)

    Returns:
        A shuffled list of Card objects
    """
    deck = []
    for _ in range(num_decks):
        for suit in SUITS:
            for rank in RANKS:
                deck.append(Card(rank, suit))
    random.shuffle(deck)
    return deck


def calculate_hand_value(hand: List[Card]) -> int:
    """Calculate the blackjack value of a hand.

    Args:
        hand: List of Card objects

    Returns:
        The best blackjack value for the hand
    """
    value = 0
    aces = 0

    for card in hand:
        if card.rank == 'A':
            aces += 1
            value += 11
        elif card.rank in ['J', 'Q', 'K']:
            value += 10
        else:
            value += int(card.rank)

    # Adjust for aces
    while value > 21 and aces > 0:
        value -= 10
        aces -= 1

    return value
