"""Blackjack rules and game logic."""

from typing import List
from .models import Card
from .config import GameConfig
from .outcomes import Outcome
from .hand import best_total_and_soft, is_blackjack, is_bust


def dealer_should_hit(dealer_cards: List[Card], config: GameConfig) -> bool:
    """
    Determine if dealer should hit based on their hand and rules.
    
    Args:
        dealer_cards: Dealer's current cards
        config: Game configuration
        
    Returns:
        True if dealer should hit
    """
    total, is_soft = best_total_and_soft(dealer_cards)
    
    if total < 17:
        return True
    elif total == 17 and is_soft and config.dealer_hits_soft_17:
        # H17 rule: dealer hits on soft 17
        return True
    else:
        return False


def compare_hands(
    player_cards: List[Card],
    dealer_cards: List[Card],
    config: GameConfig,
    is_split_hand: bool = False
) -> Outcome:
    """
    Compare player hand to dealer hand and determine outcome.

    Assumes dealer has finished drawing. Handles busts.

    Args:
        player_cards: Player's cards
        dealer_cards: Dealer's cards
        config: Game configuration
        is_split_hand: Whether this hand resulted from a split.
                       A 21 from a split is not a natural blackjack.

    Returns:
        Outcome of the hand
    """
    player_total, _ = best_total_and_soft(player_cards)
    dealer_total, _ = best_total_and_soft(dealer_cards)

    # A 2-card 21 from a split is NOT a natural blackjack
    player_bj = is_blackjack(player_cards) and not is_split_hand
    dealer_bj = is_blackjack(dealer_cards)
    player_bust = is_bust(player_cards)
    dealer_bust = is_bust(dealer_cards)

    # Player bust always loses
    if player_bust:
        return Outcome.BUST

    # Both have blackjack - push
    if player_bj and dealer_bj:
        return Outcome.PUSH

    # Only player has blackjack
    if player_bj:
        return Outcome.BLACKJACK

    # Only dealer has blackjack
    if dealer_bj:
        return Outcome.LOSE

    # Dealer busts - player wins
    if dealer_bust:
        return Outcome.WIN

    # Compare totals
    if player_total > dealer_total:
        return Outcome.WIN
    elif player_total < dealer_total:
        return Outcome.LOSE
    else:
        return Outcome.PUSH


def payout_for_outcome(outcome: Outcome, bet: int, config: GameConfig) -> int:
    """
    Calculate the net profit/loss for an outcome.
    
    Args:
        outcome: The hand outcome
        bet: The bet amount
        config: Game configuration
        
    Returns:
        Net profit (positive) or loss (negative), or 0 for push
    """
    if outcome == Outcome.BLACKJACK:
        # Blackjack pays 3:2 (or configured payout)
        return int(bet * config.blackjack_payout)
    elif outcome == Outcome.WIN:
        # Regular win pays 1:1
        return bet
    elif outcome == Outcome.LOSE or outcome == Outcome.BUST:
        return -bet
    elif outcome == Outcome.PUSH:
        return 0
    else:
        return 0
