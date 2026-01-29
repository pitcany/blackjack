"""Card shoe management for Blackjack."""

import random
from typing import List, Optional
from .models import Card, Suit, Rank


class Shoe:
    """
    Manages a shoe of cards for Blackjack.
    
    Supports multiple decks, shuffling, and penetration-based reshuffling.
    """
    
    def __init__(
        self, 
        num_decks: int = 6, 
        penetration: float = 0.75,
        preset_cards: Optional[List[Card]] = None
    ):
        """
        Initialize the shoe.
        
        Args:
            num_decks: Number of decks in the shoe
            penetration: Fraction of cards dealt before reshuffling
            preset_cards: Optional list of cards for deterministic testing
        """
        self.num_decks = num_decks
        self.penetration = penetration
        self._preset_cards = preset_cards
        self._cards: List[Card] = []
        self._total_cards = num_decks * 52
        self.reshuffled = False
        
        if preset_cards is not None:
            self._cards = preset_cards.copy()
            self._total_cards = len(preset_cards)
        else:
            self._build_and_shuffle()
    
    def _build_and_shuffle(self) -> None:
        """Build the shoe with all decks and shuffle."""
        self._cards = []
        for _ in range(self.num_decks):
            for suit in Suit:
                for rank in Rank:
                    self._cards.append(Card(rank=rank, suit=suit))
        self._total_cards = len(self._cards)
        random.shuffle(self._cards)
    
    def shuffle(self) -> None:
        """Shuffle the current cards."""
        random.shuffle(self._cards)
    
    def rebuild_and_shuffle(self) -> None:
        """Rebuild the shoe with all decks and shuffle."""
        if self._preset_cards is not None:
            self._cards = self._preset_cards.copy()
            self._total_cards = len(self._preset_cards)
        else:
            self._build_and_shuffle()
    
    def draw(self) -> Card:
        """
        Draw a card from the shoe.

        If the shoe is empty and preset cards are not being used,
        the shoe is automatically rebuilt and reshuffled.

        Returns:
            The drawn card

        Raises:
            ValueError: If shoe is empty and using preset cards (test mode)
        """
        if not self._cards:
            if self._preset_cards is not None:
                raise ValueError("Shoe is empty! (preset cards exhausted)")
            self._build_and_shuffle()
            self.reshuffled = True
        return self._cards.pop()
    
    def cards_remaining(self) -> int:
        """Return the number of cards remaining in the shoe."""
        return len(self._cards)
    
    def decks_remaining_estimate(self) -> float:
        """Estimate the number of decks remaining."""
        return len(self._cards) / 52.0
    
    def needs_reshuffle(self) -> bool:
        """
        Check if the shoe needs reshuffling based on penetration.
        
        Returns:
            True if penetration threshold has been reached
        """
        if self._total_cards == 0:
            return True
        cards_dealt = self._total_cards - len(self._cards)
        return cards_dealt >= (self._total_cards * self.penetration)
    
    def peek(self, count: int = 1) -> List[Card]:
        """
        Peek at the top cards without removing them.
        
        Args:
            count: Number of cards to peek at
            
        Returns:
            List of cards (top of deck last)
        """
        return self._cards[-count:] if count <= len(self._cards) else self._cards.copy()
    
    def __len__(self) -> int:
        """Return the number of cards in the shoe."""
        return len(self._cards)
