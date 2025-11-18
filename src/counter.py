"""Card counting system for Blackjack (Hi-Lo method)."""
from typing import Optional
from .card import Card, Deck


class CardCounter:
    """Implements the Hi-Lo card counting system."""

    def __init__(self, deck: Deck, base_bet: int = 10):
        """Initialize the card counter.

        Args:
            deck: The deck being used
            base_bet: Base betting unit (default: $10)
        """
        self.deck = deck
        self.base_bet = base_bet
        self.running_count: int = 0

    def reset(self):
        """Reset the count (called when deck is shuffled)."""
        self.running_count = 0

    def update(self, card: Card):
        """Update the count based on a dealt card.

        Args:
            card: The card that was dealt
        """
        self.running_count += card.count_value

    def get_running_count(self) -> int:
        """Get the current running count.

        Returns:
            int: The running count
        """
        return self.running_count

    def get_true_count(self) -> float:
        """Calculate the true count.

        True count = Running count / Remaining decks

        Returns:
            float: The true count
        """
        decks_remaining = self.deck.decks_remaining()
        if decks_remaining <= 0:
            return 0.0
        return self.running_count / decks_remaining

    def get_suggested_bet(self, min_bet: Optional[int] = None,
                         max_bet: Optional[int] = None) -> int:
        """Calculate suggested bet based on true count.

        Betting strategy:
        - True count <= 1: Bet minimum (base_bet)
        - True count > 1: Bet base_bet * (true_count - 1) rounded up
        - Never exceed max_bet

        Args:
            min_bet: Minimum bet allowed (default: base_bet)
            max_bet: Maximum bet allowed (default: base_bet * 10)

        Returns:
            int: Suggested bet amount
        """
        if min_bet is None:
            min_bet = self.base_bet
        if max_bet is None:
            max_bet = self.base_bet * 10

        true_count = self.get_true_count()

        if true_count <= 1:
            bet = min_bet
        else:
            # Bet more when count is favorable
            multiplier = int(true_count)
            bet = self.base_bet * multiplier

        # Ensure bet is within limits
        bet = max(min_bet, min(bet, max_bet))
        return bet

    def get_advantage(self) -> float:
        """Estimate player's advantage based on true count.

        Rough estimate: Each true count point = ~0.5% advantage

        Returns:
            float: Estimated advantage as a percentage
        """
        return self.get_true_count() * 0.5

    def should_bet_big(self, threshold: float = 2.0) -> bool:
        """Determine if the count is favorable for large bets.

        Args:
            threshold: True count threshold for betting big

        Returns:
            bool: True if true count exceeds threshold
        """
        return self.get_true_count() >= threshold

    def get_count_status(self) -> str:
        """Get a human-readable description of the count status.

        Returns:
            str: Status description
        """
        true_count = self.get_true_count()

        if true_count <= -2:
            return "Very Unfavorable (Dealer Advantage)"
        elif true_count < 0:
            return "Unfavorable (Dealer Advantage)"
        elif true_count <= 1:
            return "Neutral"
        elif true_count <= 3:
            return "Favorable (Player Advantage)"
        else:
            return "Very Favorable (Strong Player Advantage)"

    def __str__(self) -> str:
        """String representation of the counter."""
        return (f"Running Count: {self.running_count}, "
                f"True Count: {self.get_true_count():.2f}, "
                f"Status: {self.get_count_status()}")
