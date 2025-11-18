"""Basic strategy engine for Blackjack.

This module implements optimal basic strategy for:
- Multi-Deck (6-8 decks)
- Dealer Hits Soft 17 (H17)
- Double After Split allowed (DAS)
"""
from enum import Enum
from typing import Optional
from .card import Hand, Card


class Action(Enum):
    """Possible player actions in Blackjack."""
    HIT = 'H'
    STAND = 'S'
    DOUBLE = 'D'
    DOUBLE_OR_HIT = 'D/H'  # Double if allowed, otherwise hit
    DOUBLE_OR_STAND = 'D/S'  # Double if allowed, otherwise stand
    SPLIT = 'P'
    SURRENDER = 'R'
    SURRENDER_OR_HIT = 'R/H'  # Surrender if allowed, otherwise hit
    SURRENDER_OR_STAND = 'R/S'  # Surrender if allowed, otherwise stand
    SURRENDER_OR_SPLIT = 'R/P'  # Surrender if allowed, otherwise split


class BasicStrategy:
    """Implements optimal basic strategy for Blackjack."""

    def __init__(self):
        """Initialize the basic strategy tables."""
        self._init_pair_strategy()
        self._init_soft_strategy()
        self._init_hard_strategy()

    def _init_pair_strategy(self):
        """Initialize pair splitting strategy.

        Multi-deck, DAS, H17
        Rows: Player's pair (A-A through 2-2)
        Cols: Dealer's up-card (2-10, A)
        """
        self.pair_strategy = {
            # Pair: {dealer_card: action}
            'A': {2: 'P', 3: 'P', 4: 'P', 5: 'P', 6: 'P', 7: 'P', 8: 'P', 9: 'P', 10: 'P', 1: 'P'},
            'K': {2: 'S', 3: 'S', 4: 'S', 5: 'S', 6: 'S', 7: 'S', 8: 'S', 9: 'S', 10: 'S', 1: 'S'},
            'Q': {2: 'S', 3: 'S', 4: 'S', 5: 'S', 6: 'S', 7: 'S', 8: 'S', 9: 'S', 10: 'S', 1: 'S'},
            'J': {2: 'S', 3: 'S', 4: 'S', 5: 'S', 6: 'S', 7: 'S', 8: 'S', 9: 'S', 10: 'S', 1: 'S'},
            '10': {2: 'S', 3: 'S', 4: 'S', 5: 'S', 6: 'S', 7: 'S', 8: 'S', 9: 'S', 10: 'S', 1: 'S'},
            '9': {2: 'P', 3: 'P', 4: 'P', 5: 'P', 6: 'P', 7: 'S', 8: 'P', 9: 'P', 10: 'S', 1: 'S'},
            '8': {2: 'P', 3: 'P', 4: 'P', 5: 'P', 6: 'P', 7: 'P', 8: 'P', 9: 'P', 10: 'P', 1: 'R/P'},
            '7': {2: 'P', 3: 'P', 4: 'P', 5: 'P', 6: 'P', 7: 'P', 8: 'H', 9: 'H', 10: 'H', 1: 'H'},
            '6': {2: 'P', 3: 'P', 4: 'P', 5: 'P', 6: 'P', 7: 'H', 8: 'H', 9: 'H', 10: 'H', 1: 'H'},
            '5': {2: 'D', 3: 'D', 4: 'D', 5: 'D', 6: 'D', 7: 'D', 8: 'D', 9: 'D', 10: 'H', 1: 'H'},
            '4': {2: 'H', 3: 'H', 4: 'H', 5: 'P', 6: 'P', 7: 'H', 8: 'H', 9: 'H', 10: 'H', 1: 'H'},
            '3': {2: 'P', 3: 'P', 4: 'P', 5: 'P', 6: 'P', 7: 'P', 8: 'H', 9: 'H', 10: 'H', 1: 'H'},
            '2': {2: 'P', 3: 'P', 4: 'P', 5: 'P', 6: 'P', 7: 'P', 8: 'H', 9: 'H', 10: 'H', 1: 'H'},
        }

    def _init_soft_strategy(self):
        """Initialize soft hand strategy.

        Multi-deck, DAS, H17
        Rows: Player's soft total (A-2 through A-9)
        Cols: Dealer's up-card (2-10, A)
        """
        self.soft_strategy = {
            # Soft total: {dealer_card: action}
            20: {2: 'S', 3: 'S', 4: 'S', 5: 'S', 6: 'S', 7: 'S', 8: 'S', 9: 'S', 10: 'S', 1: 'S'},
            19: {2: 'S', 3: 'S', 4: 'S', 5: 'S', 6: 'D/S', 7: 'S', 8: 'S', 9: 'S', 10: 'S', 1: 'S'},
            18: {2: 'D/S', 3: 'D/S', 4: 'D/S', 5: 'D/S', 6: 'D/S', 7: 'S', 8: 'S', 9: 'H', 10: 'H', 1: 'H'},
            17: {2: 'H', 3: 'D/H', 4: 'D/H', 5: 'D/H', 6: 'D/H', 7: 'H', 8: 'H', 9: 'H', 10: 'H', 1: 'H'},
            16: {2: 'H', 3: 'H', 4: 'D/H', 5: 'D/H', 6: 'D/H', 7: 'H', 8: 'H', 9: 'H', 10: 'H', 1: 'H'},
            15: {2: 'H', 3: 'H', 4: 'D/H', 5: 'D/H', 6: 'D/H', 7: 'H', 8: 'H', 9: 'H', 10: 'H', 1: 'H'},
            14: {2: 'H', 3: 'H', 4: 'D/H', 5: 'D/H', 6: 'D/H', 7: 'H', 8: 'H', 9: 'H', 10: 'H', 1: 'H'},
            13: {2: 'H', 3: 'H', 4: 'D/H', 5: 'D/H', 6: 'D/H', 7: 'H', 8: 'H', 9: 'H', 10: 'H', 1: 'H'},
        }

    def _init_hard_strategy(self):
        """Initialize hard hand strategy.

        Multi-deck, DAS, H17
        Rows: Player's hard total (5 through 20)
        Cols: Dealer's up-card (2-10, A)
        """
        self.hard_strategy = {
            # Hard total: {dealer_card: action}
            20: {2: 'S', 3: 'S', 4: 'S', 5: 'S', 6: 'S', 7: 'S', 8: 'S', 9: 'S', 10: 'S', 1: 'S'},
            19: {2: 'S', 3: 'S', 4: 'S', 5: 'S', 6: 'S', 7: 'S', 8: 'S', 9: 'S', 10: 'S', 1: 'S'},
            18: {2: 'S', 3: 'S', 4: 'S', 5: 'S', 6: 'S', 7: 'S', 8: 'S', 9: 'S', 10: 'S', 1: 'S'},
            17: {2: 'S', 3: 'S', 4: 'S', 5: 'S', 6: 'S', 7: 'S', 8: 'S', 9: 'S', 10: 'S', 1: 'R/S'},
            16: {2: 'S', 3: 'S', 4: 'S', 5: 'S', 6: 'S', 7: 'H', 8: 'H', 9: 'R/H', 10: 'R/H', 1: 'R/H'},
            15: {2: 'S', 3: 'S', 4: 'S', 5: 'S', 6: 'S', 7: 'H', 8: 'H', 9: 'H', 10: 'R/H', 1: 'R/H'},
            14: {2: 'S', 3: 'S', 4: 'S', 5: 'S', 6: 'S', 7: 'H', 8: 'H', 9: 'H', 10: 'H', 1: 'H'},
            13: {2: 'S', 3: 'S', 4: 'S', 5: 'S', 6: 'S', 7: 'H', 8: 'H', 9: 'H', 10: 'H', 1: 'H'},
            12: {2: 'H', 3: 'H', 4: 'S', 5: 'S', 6: 'S', 7: 'H', 8: 'H', 9: 'H', 10: 'H', 1: 'H'},
            11: {2: 'D', 3: 'D', 4: 'D', 5: 'D', 6: 'D', 7: 'D', 8: 'D', 9: 'D', 10: 'D', 1: 'D'},
            10: {2: 'D', 3: 'D', 4: 'D', 5: 'D', 6: 'D', 7: 'D', 8: 'D', 9: 'D', 10: 'H', 1: 'H'},
            9: {2: 'H', 3: 'D', 4: 'D', 5: 'D', 6: 'D', 7: 'H', 8: 'H', 9: 'H', 10: 'H', 1: 'H'},
            8: {2: 'H', 3: 'H', 4: 'H', 5: 'H', 6: 'H', 7: 'H', 8: 'H', 9: 'H', 10: 'H', 1: 'H'},
            7: {2: 'H', 3: 'H', 4: 'H', 5: 'H', 6: 'H', 7: 'H', 8: 'H', 9: 'H', 10: 'H', 1: 'H'},
            6: {2: 'H', 3: 'H', 4: 'H', 5: 'H', 6: 'H', 7: 'H', 8: 'H', 9: 'H', 10: 'H', 1: 'H'},
            5: {2: 'H', 3: 'H', 4: 'H', 5: 'H', 6: 'H', 7: 'H', 8: 'H', 9: 'H', 10: 'H', 1: 'H'},
        }

    def _get_dealer_value(self, dealer_card: Card) -> int:
        """Get the dealer's up-card value for strategy lookup.

        Args:
            dealer_card: Dealer's up-card

        Returns:
            int: 1 for Ace, 10 for face cards, otherwise face value
        """
        if dealer_card.rank == 'A':
            return 1
        elif dealer_card.rank in ['J', 'Q', 'K']:
            return 10
        else:
            return int(dealer_card.rank)

    def get_recommendation(self, player_hand: Hand, dealer_card: Card,
                          can_double: bool = True,
                          can_split: bool = True,
                          can_surrender: bool = True) -> str:
        """Get the basic strategy recommendation.

        Args:
            player_hand: Player's current hand
            dealer_card: Dealer's up-card
            can_double: Whether doubling is allowed
            can_split: Whether splitting is allowed
            can_surrender: Whether surrender is allowed

        Returns:
            str: Recommended action code
        """
        dealer_value = self._get_dealer_value(dealer_card)

        # Check for pairs first (if splitting is relevant)
        if player_hand.can_split() and can_split and len(player_hand.cards) == 2:
            card_rank = player_hand.cards[0].rank
            if card_rank in self.pair_strategy:
                action = self.pair_strategy[card_rank].get(dealer_value, 'H')
                return self._resolve_action(action, can_double, can_split, can_surrender)

        # Check for soft hands
        if player_hand.is_soft():
            soft_value = player_hand.get_values()[0]
            if soft_value in self.soft_strategy:
                action = self.soft_strategy[soft_value].get(dealer_value, 'H')
                return self._resolve_action(action, can_double, can_split, can_surrender)

        # Hard hands
        hard_value = player_hand.get_value()
        if hard_value in self.hard_strategy:
            action = self.hard_strategy[hard_value].get(dealer_value, 'H')
            return self._resolve_action(action, can_double, can_split, can_surrender)

        # Default: stand on 17+, hit otherwise
        return 'S' if hard_value >= 17 else 'H'

    def _resolve_action(self, action: str, can_double: bool,
                       can_split: bool, can_surrender: bool) -> str:
        """Resolve conditional actions based on what's allowed.

        Args:
            action: The strategy table action
            can_double: Whether doubling is allowed
            can_split: Whether splitting is allowed
            can_surrender: Whether surrender is allowed

        Returns:
            str: Final resolved action
        """
        if action == 'D/H':
            return 'D' if can_double else 'H'
        elif action == 'D/S':
            return 'D' if can_double else 'S'
        elif action == 'R/H':
            return 'R' if can_surrender else 'H'
        elif action == 'R/S':
            return 'R' if can_surrender else 'S'
        elif action == 'R/P':
            return 'R' if can_surrender else ('P' if can_split else 'H')
        elif action == 'P':
            return 'P' if can_split else 'H'
        elif action == 'D':
            return 'D' if can_double else 'H'
        else:
            return action

    def get_action_name(self, action_code: str) -> str:
        """Get human-readable action name.

        Args:
            action_code: Action code (H, S, D, P, R)

        Returns:
            str: Human-readable action name
        """
        action_names = {
            'H': 'Hit',
            'S': 'Stand',
            'D': 'Double Down',
            'P': 'Split',
            'R': 'Surrender'
        }
        return action_names.get(action_code, action_code)

    def get_explanation(self, action_code: str, player_hand: Hand,
                       dealer_card: Card) -> str:
        """Get an explanation for the recommended action.

        Args:
            action_code: Action code
            player_hand: Player's hand
            dealer_card: Dealer's up-card

        Returns:
            str: Explanation text
        """
        action_name = self.get_action_name(action_code)
        player_value = player_hand.get_value()
        dealer_value = self._get_dealer_value(dealer_card)

        explanations = {
            'H': f"Hit - Your {player_value} vs dealer's {dealer_card.rank} requires another card",
            'S': f"Stand - Your {player_value} is strong enough vs dealer's {dealer_card.rank}",
            'D': f"Double Down - Your {player_value} vs dealer's {dealer_card.rank} is optimal for doubling",
            'P': f"Split - Splitting your pair vs dealer's {dealer_card.rank} maximizes expected value",
            'R': f"Surrender - Your {player_value} vs dealer's {dealer_card.rank} has poor odds, minimize loss"
        }

        return explanations.get(action_code,
                               f"{action_name} - Recommended action for this situation")
