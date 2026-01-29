"""Statistics tracking for Blackjack and training sessions."""

from dataclasses import dataclass, field
from typing import Dict, Any


@dataclass
class BlackjackStats:
    """Statistics for Blackjack game sessions."""
    
    hands_played: int = 0
    hands_won: int = 0
    hands_lost: int = 0
    hands_pushed: int = 0
    blackjacks: int = 0
    busts: int = 0
    doubles_won: int = 0
    doubles_lost: int = 0
    splits_played: int = 0
    insurance_taken: int = 0
    insurance_won: int = 0
    total_wagered: int = 0
    total_won: int = 0
    total_lost: int = 0
    peak_bankroll: int = 0
    lowest_bankroll: int = 0
    
    def update_for_outcome(
        self, 
        outcome: str, 
        bet: int, 
        profit: int,
        is_doubled: bool = False,
        is_split: bool = False
    ) -> None:
        """Update stats after a hand completes."""
        self.hands_played += 1
        self.total_wagered += bet
        
        if outcome == "BLACKJACK":
            self.hands_won += 1
            self.blackjacks += 1
            self.total_won += profit
        elif outcome == "WIN":
            self.hands_won += 1
            self.total_won += profit
            if is_doubled:
                self.doubles_won += 1
        elif outcome == "LOSE":
            self.hands_lost += 1
            self.total_lost += abs(profit)
            if is_doubled:
                self.doubles_lost += 1
        elif outcome == "BUST":
            self.hands_lost += 1
            self.busts += 1
            self.total_lost += abs(profit)
        elif outcome == "PUSH":
            self.hands_pushed += 1
        
        if is_split:
            self.splits_played += 1
    
    def update_bankroll_extremes(self, bankroll: int) -> None:
        """Track peak and lowest bankroll values."""
        if bankroll > self.peak_bankroll:
            self.peak_bankroll = bankroll
        if self.lowest_bankroll == 0 or bankroll < self.lowest_bankroll:
            self.lowest_bankroll = bankroll
    
    def win_rate(self) -> float:
        """Calculate win rate percentage."""
        if self.hands_played == 0:
            return 0.0
        return (self.hands_won / self.hands_played) * 100
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert stats to dictionary."""
        return {
            "hands_played": self.hands_played,
            "hands_won": self.hands_won,
            "hands_lost": self.hands_lost,
            "hands_pushed": self.hands_pushed,
            "blackjacks": self.blackjacks,
            "busts": self.busts,
            "doubles_won": self.doubles_won,
            "doubles_lost": self.doubles_lost,
            "splits_played": self.splits_played,
            "insurance_taken": self.insurance_taken,
            "insurance_won": self.insurance_won,
            "total_wagered": self.total_wagered,
            "total_won": self.total_won,
            "total_lost": self.total_lost,
            "peak_bankroll": self.peak_bankroll,
            "lowest_bankroll": self.lowest_bankroll,
            "win_rate": round(self.win_rate(), 1)
        }


@dataclass
class TrainingStats:
    """Statistics for card counting training sessions."""
    
    attempts: int = 0
    correct_rc: int = 0
    correct_tc: int = 0
    streak: int = 0
    best_streak: int = 0
    total_time_seconds: float = 0.0
    
    def accuracy_rc(self) -> float:
        """Calculate running count accuracy percentage."""
        if self.attempts == 0:
            return 0.0
        return (self.correct_rc / self.attempts) * 100
    
    def accuracy_tc(self) -> float:
        """Calculate true count accuracy percentage."""
        if self.attempts == 0:
            return 0.0
        return (self.correct_tc / self.attempts) * 100
    
    def avg_response_time(self) -> float:
        """Calculate average response time in seconds."""
        if self.attempts == 0:
            return 0.0
        return self.total_time_seconds / self.attempts
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert stats to dictionary."""
        return {
            "attempts": self.attempts,
            "correct_rc": self.correct_rc,
            "correct_tc": self.correct_tc,
            "streak": self.streak,
            "best_streak": self.best_streak,
            "accuracy_rc": round(self.accuracy_rc(), 1),
            "accuracy_tc": round(self.accuracy_tc(), 1),
            "avg_response_time": round(self.avg_response_time(), 2)
        }
