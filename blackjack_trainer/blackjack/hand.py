"""Hand calculation functions for Blackjack."""

from typing import List, Tuple
from .models import Card, Rank


def best_total_and_soft(cards: List[Card]) -> Tuple[int, bool]:
    """
    Calculate the best total for a hand and whether it's soft.
    
    A soft hand contains an Ace counted as 11.
    
    Args:
        cards: List of cards in the hand
        
    Returns:
        Tuple of (total, is_soft)
    """
    if not cards:
        return 0, False
    
    total = 0
    ace_count = 0
    
    for card in cards:
        total += card.base_value
        if card.rank == Rank.ACE:
            ace_count += 1
    
    # Adjust for aces if over 21
    while total > 21 and ace_count > 0:
        total -= 10  # Convert an Ace from 11 to 1
        ace_count -= 1
    
    # A hand is soft if there's at least one Ace still counted as 11
    is_soft = ace_count > 0 and total <= 21
    
    return total, is_soft


def is_blackjack(cards: List[Card]) -> bool:
    """
    Check if the hand is a natural blackjack.
    
    Args:
        cards: List of cards in the hand
        
    Returns:
        True if hand is exactly 2 cards totaling 21
    """
    if len(cards) != 2:
        return False
    total, _ = best_total_and_soft(cards)
    return total == 21


def is_bust(cards: List[Card]) -> bool:
    """
    Check if the hand is bust (over 21).
    
    Args:
        cards: List of cards in the hand
        
    Returns:
        True if hand total exceeds 21
    """
    total, _ = best_total_and_soft(cards)
    return total > 21


def can_split(cards: List[Card], allow_by_value: bool = False) -> bool:
    """
    Check if the hand can be split.
    
    Args:
        cards: List of cards in the hand
        allow_by_value: If True, allow split by same value (e.g., K-Q)
                       If False (default), require same rank
        
    Returns:
        True if hand can be split
    """
    if len(cards) != 2:
        return False
    
    if allow_by_value:
        return cards[0].base_value == cards[1].base_value
    else:
        return cards[0].rank == cards[1].rank


def format_hand(cards: List[Card]) -> str:
    """
    Format a hand for display.
    
    Args:
        cards: List of cards in the hand
        
    Returns:
        String representation like "A♠ K♥ (21)"
    """
    if not cards:
        return "Empty"
    
    cards_str = " ".join(str(card) for card in cards)
    total, is_soft = best_total_and_soft(cards)
    soft_indicator = " (soft)" if is_soft else ""
    
    return f"{cards_str} ({total}{soft_indicator})"
