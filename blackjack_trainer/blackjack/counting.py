"""Hi-Lo card counting system and training logic."""

from typing import List, Dict, Any, Optional
from .models import Card, Rank
from .config import CountingTrainerConfig
from .shoe import Shoe
from .stats import TrainingStats


def hi_lo_value(card: Card) -> int:
    """
    Get the Hi-Lo count value for a card.
    
    Hi-Lo system:
    - 2-6: +1
    - 7-9: 0
    - 10-A: -1
    
    Args:
        card: The card to evaluate
        
    Returns:
        Hi-Lo value (-1, 0, or +1)
    """
    rank = card.rank
    if rank in (Rank.TWO, Rank.THREE, Rank.FOUR, Rank.FIVE, Rank.SIX):
        return 1
    elif rank in (Rank.SEVEN, Rank.EIGHT, Rank.NINE):
        return 0
    else:  # TEN, JACK, QUEEN, KING, ACE
        return -1


def update_running_count(running_count: int, cards: List[Card]) -> int:
    """
    Update the running count with a list of new cards.
    
    Args:
        running_count: Current running count
        cards: New cards to add to the count
        
    Returns:
        Updated running count
    """
    for card in cards:
        running_count += hi_lo_value(card)
    return running_count


def true_count(running_count: int, decks_remaining: float) -> float:
    """
    Calculate the true count from running count.
    
    True Count = Running Count / Decks Remaining
    
    Args:
        running_count: Current running count
        decks_remaining: Estimated decks remaining
        
    Returns:
        True count (rounded to 1 decimal)
    """
    if decks_remaining < 0.5:
        decks_remaining = 0.5  # Guard against division issues
    return round(running_count / decks_remaining, 1)


class CountingTrainer:
    """
    Card counting training system.
    
    Provides drills for practicing Hi-Lo counting with immediate feedback.
    """
    
    def __init__(self):
        """Initialize the trainer."""
        self.config: Optional[CountingTrainerConfig] = None
        self.shoe: Optional[Shoe] = None
        self.running_count: int = 0
        self.last_round_cards: List[Card] = []
        self.expected_rc: int = 0
        self.stats: TrainingStats = TrainingStats()
        self.is_running: bool = False
        self.card_history: List[List[Card]] = []
    
    def start(self, config: CountingTrainerConfig) -> None:
        """
        Start a new training session.
        
        Args:
            config: Training configuration
        """
        self.config = config
        self.shoe = Shoe(num_decks=config.num_decks, penetration=0.9)
        self.running_count = 0
        self.expected_rc = 0
        self.last_round_cards = []
        self.stats = TrainingStats()
        self.is_running = True
        self.card_history = []
    
    def next_round(self) -> List[Card]:
        """
        Deal the next round of cards.
        
        Returns:
            List of cards for this round
        """
        if not self.is_running or self.config is None or self.shoe is None:
            return []
        
        # Check if we need to reshuffle
        if self.shoe.needs_reshuffle():
            self.shoe.rebuild_and_shuffle()
            self.running_count = 0
        
        # Determine number of cards based on configuration
        num_cards = self.config.cards_per_round
        
        # Draw cards
        cards = []
        for _ in range(num_cards):
            if self.shoe.cards_remaining() > 0:
                cards.append(self.shoe.draw())
        
        self.last_round_cards = cards
        
        # Update running count and store expected value
        self.expected_rc = update_running_count(self.running_count, cards)
        
        # Add to history
        self.card_history.append(cards.copy())
        
        return cards
    
    def submit_guess(
        self, 
        rc_guess: int, 
        tc_guess: Optional[float] = None
    ) -> Dict[str, Any]:
        """
        Submit a guess and get feedback.
        
        Args:
            rc_guess: Running count guess
            tc_guess: True count guess (optional)
            
        Returns:
            Feedback dictionary with results
        """
        if not self.is_running or self.config is None or self.shoe is None:
            return {"error": "Training not started"}
        
        # Calculate expected values
        expected_rc = self.expected_rc
        decks_remaining = self.shoe.decks_remaining_estimate()
        expected_tc = true_count(expected_rc, decks_remaining)
        
        # Check running count
        is_correct_rc = rc_guess == expected_rc
        
        # Check true count if requested
        is_correct_tc = None
        if self.config.ask_true_count and tc_guess is not None:
            # Allow for rounding differences (within 0.5)
            is_correct_tc = abs(tc_guess - expected_tc) <= 0.5
        
        # Calculate card-by-card values for explanation
        delta_explanation = []
        for card in self.last_round_cards:
            value = hi_lo_value(card)
            sign = "+" if value > 0 else ""
            delta_explanation.append(f"{card}: {sign}{value}")
        
        # Update stats
        self.stats.attempts += 1
        if is_correct_rc:
            self.stats.correct_rc += 1
            self.stats.streak += 1
            if self.stats.streak > self.stats.best_streak:
                self.stats.best_streak = self.stats.streak
        else:
            self.stats.streak = 0
        
        if is_correct_tc is not None and is_correct_tc:
            self.stats.correct_tc += 1
        
        # Update running count for next round
        self.running_count = expected_rc
        
        return {
            "is_correct_rc": is_correct_rc,
            "expected_rc": expected_rc,
            "user_rc": rc_guess,
            "is_correct_tc": is_correct_tc,
            "expected_tc": expected_tc,
            "user_tc": tc_guess,
            "decks_remaining": round(decks_remaining, 2),
            "delta_explanation": delta_explanation,
            "previous_rc": self.running_count - sum(hi_lo_value(c) for c in self.last_round_cards),
            "stats": self.stats.to_dict()
        }
    
    def get_stats(self) -> Dict[str, Any]:
        """Get current training statistics."""
        return self.stats.to_dict()
    
    def get_decks_remaining(self) -> float:
        """Get estimated decks remaining."""
        if self.shoe is None:
            return 0.0
        return self.shoe.decks_remaining_estimate()
    
    def stop(self) -> Dict[str, Any]:
        """
        Stop the training session.
        
        Returns:
            Final statistics
        """
        self.is_running = False
        return self.stats.to_dict()
