"""Strategy calculations for blackjack."""
from typing import List, Tuple

from .card import Card, calculate_hand_value


def get_true_count(running_count: int, cards_dealt: int, num_decks: int) -> int:
    """Calculate the true count.

    Args:
        running_count: Current running count
        cards_dealt: Number of cards dealt so far
        num_decks: Total number of decks in shoe

    Returns:
        The true count (running count / decks remaining)
    """
    decks_remaining = (num_decks * 52 - cards_dealt) / 52
    if decks_remaining > 0:
        return round(running_count / decks_remaining)
    return 0


def get_betting_advice(true_count: int) -> Tuple[int, str]:
    """Get betting advice based on true count.

    Args:
        true_count: The true count

    Returns:
        Tuple of (bet_units, advice_string)
    """
    if true_count <= 0:
        return 1, "Minimum bet - count is neutral or negative"
    elif true_count == 1:
        return 2, "Slight advantage - increase bet moderately"
    elif true_count == 2:
        return 4, "Good advantage - increase bet significantly"
    elif true_count == 3:
        return 6, "Strong advantage - large bet recommended"
    else:
        return 8, "Excellent advantage - maximum bet"


def get_basic_strategy(player_hand: List[Card], dealer_hand: List[Card],
                       is_split: bool = False) -> str:
    """Get basic strategy recommendation.

    Args:
        player_hand: Player's current hand
        dealer_hand: Dealer's hand
        is_split: Whether this is a split hand

    Returns:
        Recommended action: 'HIT', 'STAND', 'DOUBLE', or 'SPLIT'
    """
    if not player_hand or not dealer_hand:
        return 'HIT'

    dealer_card = dealer_hand[0]
    dealer_value = 11 if dealer_card.rank == 'A' else (
        10 if dealer_card.rank in ['J', 'Q', 'K'] else int(dealer_card.rank)
    )
    player_value = calculate_hand_value(player_hand)

    # Check for pairs (only if not already split)
    is_pair = len(player_hand) == 2 and player_hand[0].rank == player_hand[1].rank and not is_split
    has_ace = any(card.rank == 'A' for card in player_hand)
    is_soft = has_ace and player_value <= 21

    # Pair splitting strategy
    if is_pair:
        rank = player_hand[0].rank
        if rank in ['A', '8']:
            return 'SPLIT'
        if rank in ['2', '3', '7'] and dealer_value <= 7:
            return 'SPLIT'
        if rank == '6' and dealer_value <= 6:
            return 'SPLIT'
        if rank == '9' and dealer_value <= 9 and dealer_value != 7:
            return 'SPLIT'
        if rank in ['10', 'J', 'Q', 'K']:
            return 'STAND'

    # Soft hand strategy
    if is_soft and player_value <= 21:
        if player_value >= 19:
            return 'STAND'
        if player_value == 18 and dealer_value >= 9:
            return 'HIT'
        if player_value == 18 and dealer_value <= 6:
            return 'DOUBLE' if len(player_hand) == 2 else 'HIT'
        if player_value == 18:
            return 'STAND'
        return 'HIT'

    # Hard hand strategy
    if player_value >= 17:
        return 'STAND'
    if player_value >= 13:
        return 'STAND' if dealer_value <= 6 else 'HIT'
    if player_value == 12:
        return 'STAND' if 4 <= dealer_value <= 6 else 'HIT'
    if player_value == 11:
        return 'DOUBLE' if len(player_hand) == 2 else 'HIT'
    if player_value == 10:
        return 'DOUBLE' if len(player_hand) == 2 and dealer_value <= 9 else 'HIT'
    if player_value == 9:
        return 'DOUBLE' if len(player_hand) == 2 and 3 <= dealer_value <= 6 else 'HIT'

    return 'HIT'
