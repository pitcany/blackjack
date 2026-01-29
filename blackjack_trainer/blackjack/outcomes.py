"""Game outcome definitions for Blackjack."""

from enum import Enum, auto


class Outcome(Enum):
    """Possible outcomes for a Blackjack hand."""
    WIN = auto()
    LOSE = auto()
    PUSH = auto()
    BLACKJACK = auto()
    BUST = auto()
    
    def __str__(self) -> str:
        """Return human-readable outcome string."""
        return self.name.replace("_", " ").title()
