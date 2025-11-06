"""Data models for the Blackjack API."""

from pydantic import BaseModel
from typing import List, Optional


class Card(BaseModel):
    """Represents a playing card."""
    rank: str
    suit: str


class GameState(BaseModel):
    """Complete game state."""
    game_id: str
    state: str  # 'betting', 'insurance', 'playing', 'dealer', 'finished'
    player_hand: List[Card]
    dealer_hand: List[Card]
    dealer_visible_card: Optional[Card]
    bankroll: int
    current_bet: int
    running_count: int
    true_count: int
    cards_dealt: int
    num_decks: int
    message: str
    is_split: bool
    split_hands: Optional[List[List[Card]]]
    active_split_hand: int
    insurance_offered: bool
    insurance_bet: int
    can_split: bool
    can_double: bool
    betting_advice: Optional[str]
    strategy_advice: Optional[str]


class BetRequest(BaseModel):
    """Request to place a bet."""
    amount: int


class ActionResponse(BaseModel):
    """Response after a game action."""
    success: bool
    game_state: GameState
    error: Optional[str] = None


class Statistics(BaseModel):
    """Session statistics."""
    hands_played: int
    hands_won: int
    hands_lost: int
    hands_pushed: int
    blackjacks: int
    total_wagered: int
    total_won: int
    total_lost: int
    biggest_win: int
    biggest_loss: int
    win_rate: float
    net_profit: int
    roi: float
    session_duration: str
