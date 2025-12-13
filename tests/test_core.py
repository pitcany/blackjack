import random
import math
from enum import Enum
from typing import List, Optional, Tuple, Dict, Any

# --- Constants & Enums ---

class Suit(Enum):
    HEARTS = "H"
    DIAMONDS = "D"
    CLUBS = "C"
    SPADES = "S"

class Rank(Enum):
    TWO = "2"
    THREE = "3"
    FOUR = "4"
    FIVE = "5"
    SIX = "6"
    SEVEN = "7"
    EIGHT = "8"
    NINE = "9"
    TEN = "10"
    JACK = "J"
    QUEEN = "Q"
    KING = "K"
    ACE = "A"

class Action(Enum):
    HIT = "Hit"
    STAND = "Stand"
    DOUBLE = "Double"
    SPLIT = "Split"
    SURRENDER = "Surrender" # Not implemented in POC for simplicity, but good to have enum
    INSURANCE = "Insurance"

# --- Card & Deck Logic ---

class Card:
    def __init__(self, rank: Rank, suit: Suit):
        self.rank = rank
        self.suit = suit
        self.is_face_up = True

    def __repr__(self):
        return f"{self.rank.value}{self.suit.value}"

    @property
    def value(self) -> int:
        if self.rank in [Rank.JACK, Rank.QUEEN, Rank.KING]:
            return 10
        if self.rank == Rank.ACE:
            return 11
        return int(self.rank.value)
    
    @property
    def hi_lo_value(self) -> int:
        if self.value >= 2 and self.value <= 6:
            return 1
        if self.value >= 7 and self.value <= 9:
            return 0
        return -1 # 10, J, Q, K, A

class Shoe:
    def __init__(self, num_decks: int = 6, penetration: float = 0.75):
        self.num_decks = num_decks
        self.penetration = penetration
        self.cards: List[Card] = []
        self.cut_card_index = 0
        self.reshuffle()
        
    def reshuffle(self):
        self.cards = []
        for _ in range(self.num_decks):
            for suit in Suit:
                for rank in Rank:
                    self.cards.append(Card(rank, suit))
        random.shuffle(self.cards)
        total_cards = len(self.cards)
        self.cut_card_index = int(total_cards * self.penetration)
        # In a real game, the cut card is placed, and when reached, the shoe ends after the round.
        # For POC, we'll just check decks_remaining or needs_shuffle.

    def deal_card(self) -> Card:
        if not self.cards:
            raise ValueError("Shoe is empty!")
        return self.cards.pop(0)

    @property
    def cards_remaining(self) -> int:
        return len(self.cards)

    @property
    def decks_remaining(self) -> float:
        # Standard: round to nearest half deck or exact
        return max(0.5, round(len(self.cards) / 52.0 * 2) / 2)

    @property
    def needs_shuffle(self) -> bool:
        # Simple check: if we've passed the cut card point (cards used > cut_card_index)
        cards_used = (self.num_decks * 52) - len(self.cards)
        # Note: self.cut_card_index is index from start, so it represents number of cards to play.
        # Wait, usually cut card is "place at 75% depth".
        # So if penetration is 0.75, we play 75% of cards.
        limit = int(self.num_decks * 52 * self.penetration)
        return cards_used >= limit

# --- Hand Logic ---

class Hand:
    def __init__(self):
        self.cards: List[Card] = []
        self.bet = 0

    def add_card(self, card: Card):
        self.cards.append(card)

    @property
    def value(self) -> int:
        total = sum(c.value for c in self.cards)
        aces = sum(1 for c in self.cards if c.rank == Rank.ACE)
        while total > 21 and aces > 0:
            total -= 10
            aces -= 1
        return total

    @property
    def is_soft(self) -> bool:
        total = sum(c.value for c in self.cards)
        aces = sum(1 for c in self.cards if c.rank == Rank.ACE)
        # Calculate how many aces are counted as 11
        # If any ace is counted as 11, it's soft.
        # total - 10*aces_reduced <= 21
        # If we reduce all aces, total is minimum.
        # If total with at least one ace as 11 is <= 21, it's soft.
        # Actually simpler: if value != hard_value (where all aces=1) it's soft? No.
        # Common definition: A hand is soft if it contains an Ace that can be counted as 11 without busting.
        
        # Calculate total treating all aces as 1
        hard_total = sum((c.value if c.rank != Rank.ACE else 1) for c in self.cards)
        if hard_total > 21: return False # Should never happen if logic is right
        
        # We want to know if 'value' property uses an Ace as 11.
        # The 'value' property automatically maximizes.
        # So if 'value' > 'hard_total', then we are using an Ace as 11.
        return self.value > hard_total

    @property
    def is_blackjack(self) -> bool:
        return len(self.cards) == 2 and self.value == 21

    @property
    def is_busted(self) -> bool:
        return self.value > 21

    @property
    def is_pair(self) -> bool:
        return len(self.cards) == 2 and self.cards[0].value == self.cards[1].value # value or rank? 10 and J is usually not a split pair in some casinos but mostly 10-value is split. 
        # Strategy tables usually denote pairs by Rank (e.g. 10-10 vs 10-J). 
        # But actually standard strategy treats 10, J, Q, K as same for splitting usually?
        # Actually most casinos allow splitting 10-value cards even if ranks differ (J+K). 
        # Let's stick to value for now, or rank for strictness. Standard BJ: 10 values can be split.
        
    def __repr__(self):
        return f"[{','.join(str(c) for c in self.cards)}] ({self.value})"

# --- Strategy Engine ---

class StrategyEngine:
    def __init__(self, rules=None):
        self.rules = rules or {}
        # Hardcoded 6-deck S17 DAS strategy
        self.basic_strategy = {
            "hard": {
                 4: {k: Action.HIT for k in range(2, 12)},
                 5: {k: Action.HIT for k in range(2, 12)},
                 6: {k: Action.HIT for k in range(2, 12)},
                 7: {k: Action.HIT for k in range(2, 12)},
                 8: {k: Action.HIT for k in range(2, 12)},
                 9: {2: Action.HIT, 3: Action.DOUBLE, 4: Action.DOUBLE, 5: Action.DOUBLE, 6: Action.DOUBLE, 7: Action.HIT, 8: Action.HIT, 9: Action.HIT, 10: Action.HIT, 11: Action.HIT},
                10: {k: Action.DOUBLE if k <= 9 else Action.HIT for k in range(2, 12)},
                11: {k: Action.DOUBLE for k in range(2, 12)}, # Always double
                12: {2: Action.HIT, 3: Action.HIT, 4: Action.STAND, 5: Action.STAND, 6: Action.STAND, 7: Action.HIT, 8: Action.HIT, 9: Action.HIT, 10: Action.HIT, 11: Action.HIT},
                13: {k: Action.STAND if 2 <= k <= 6 else Action.HIT for k in range(2, 12)},
                14: {k: Action.STAND if 2 <= k <= 6 else Action.HIT for k in range(2, 12)},
                15: {k: Action.STAND if 2 <= k <= 6 else Action.HIT for k in range(2, 12)},
                16: {k: Action.STAND if 2 <= k <= 6 else Action.HIT for k in range(2, 12)},
                17: {k: Action.STAND for k in range(2, 12)},
                18: {k: Action.STAND for k in range(2, 12)},
                19: {k: Action.STAND for k in range(2, 12)},
                20: {k: Action.STAND for k in range(2, 12)},
                21: {k: Action.STAND for k in range(2, 12)},
            },
            "soft": {
                13: {5: Action.DOUBLE, 6: Action.DOUBLE, **{k: Action.HIT for k in [2,3,4,7,8,9,10,11]}},
                14: {5: Action.DOUBLE, 6: Action.DOUBLE, **{k: Action.HIT for k in [2,3,4,7,8,9,10,11]}},
                15: {4: Action.DOUBLE, 5: Action.DOUBLE, 6: Action.DOUBLE, **{k: Action.HIT for k in [2,3,7,8,9,10,11]}},
                16: {4: Action.DOUBLE, 5: Action.DOUBLE, 6: Action.DOUBLE, **{k: Action.HIT for k in [2,3,7,8,9,10,11]}},
                17: {3: Action.DOUBLE, 4: Action.DOUBLE, 5: Action.DOUBLE, 6: Action.DOUBLE, **{k: Action.HIT for k in [2,7,8,9,10,11]}},
                18: {2: Action.STAND, 7: Action.STAND, 8: Action.STAND, 3: Action.DOUBLE, 4: Action.DOUBLE, 5: Action.DOUBLE, 6: Action.DOUBLE, **{k: Action.HIT for k in [9,10,11]}}, # S18 vs 2,7,8. D vs 3-6. H vs 9,10,A
                19: {6: Action.DOUBLE, **{k: Action.STAND for k in [2,3,4,5,7,8,9,10,11]}},
                20: {k: Action.STAND for k in range(2, 12)},
            },
            "pairs": {
                # Map pair card value to dict. 
                # 2,2 -> 2
                2: {k: Action.SPLIT if k <= 7 else Action.HIT for k in range(2, 12)},
                3: {k: Action.SPLIT if k <= 7 else Action.HIT for k in range(2, 12)},
                4: {5: Action.SPLIT, 6: Action.SPLIT, **{k: Action.HIT for k in [2,3,4,7,8,9,10,11]}},
                5: {k: Action.DOUBLE if k <= 9 else Action.HIT for k in range(2, 12)}, # Never split 5s, treat as 10 hard
                6: {k: Action.SPLIT if k <= 6 else Action.HIT for k in range(2, 12)},
                7: {k: Action.SPLIT if k <= 7 else Action.HIT for k in range(2, 12)},
                8: {k: Action.SPLIT for k in range(2, 12)}, # Always split 8s
                9: {7: Action.STAND, 10: Action.STAND, 11: Action.STAND, **{k: Action.SPLIT for k in [2,3,4,5,6,8,9]}},
                10: {k: Action.STAND for k in range(2, 12)}, # Never split 10s
                11: {k: Action.SPLIT for k in range(2, 12)}, # Always split Aces
            }
        }
    
    def get_basic_strategy_move(self, player_hand: Hand, dealer_up_card: Card) -> Action:
        dealer_val = dealer_up_card.value
        # If dealer has Ace, use 11 as key
        if dealer_val == 1: dealer_val = 11 # Should be covered by value property but just in case
        
        # Check Pairs first
        if player_hand.is_pair:
             # Basic check: do we split?
             card_val = player_hand.cards[0].value
             # Special case: 5s are hard 10 usually in strategies but key exists
             action = self.basic_strategy["pairs"][card_val].get(dealer_val, Action.HIT)
             # If action is SPLIT but we can't (e.g. max splits), caller handles. 
             # Strategy engine just says "Best move is Split".
             return action

        # Soft totals
        if player_hand.is_soft:
            # Soft total is usually described by the non-ace part? Or total?
            # My table keys are totals (13-20).
            total = player_hand.value
            if total >= 20: return Action.STAND # Soft 20, 21 stand
            if total <= 12: return Action.HIT # Soft 12 (AA) is usually split or 12. Soft 2 is just AA?
            
            return self.basic_strategy["soft"].get(total, {}).get(dealer_val, Action.HIT)

        # Hard totals
        total = player_hand.value
        if total >= 21: return Action.STAND
        if total <= 4: return Action.HIT
        
        return self.basic_strategy["hard"].get(total, {}).get(dealer_val, Action.HIT)

    def get_deviations(self, basic_move: Action, player_hand: Hand, dealer_up_card: Card, true_count: float) -> Tuple[Action, str]:
        """
        Returns (RecommendedAction, ReasonString)
        """
        dealer_val = dealer_up_card.value
        player_val = player_hand.value
        
        # Fab 4 / Illustrious 18 examples
        
        # Insurance: Dealer Ace, TC >= 3
        if dealer_val == 11 and true_count >= 3:
            return Action.INSURANCE, "Insurance is profitable at True Count +3 or higher."

        # 16 vs 10: Stand if TC >= 0
        if player_val == 16 and dealer_val == 10 and not player_hand.is_soft and not player_hand.is_pair:
             if true_count >= 0:
                 return Action.STAND, "With True Count >= 0, stand on 16 vs 10 due to high density of 10s."
        
        # 15 vs 10: Stand if TC >= 4
        if player_val == 15 and dealer_val == 10 and not player_hand.is_soft:
            if true_count >= 4:
                return Action.STAND, "At True Count +4, standing on 15 vs 10 becomes EV positive."

        # 10 vs 10: Double if TC >= 4
        if player_val == 10 and dealer_val == 10 and not player_hand.is_soft:
             if true_count >= 4:
                 return Action.DOUBLE, "At True Count +4, doubling 10 vs 10 captures the advantage."

        # 12 vs 3: Stand if TC >= 2
        if player_val == 12 and dealer_val == 3 and not player_hand.is_soft:
            if true_count >= 2:
                return Action.STAND, "Stand on 12 vs 3 when True Count is +2 or higher."
        
        # 12 vs 2: Stand if TC >= 3
        if player_val == 12 and dealer_val == 2 and not player_hand.is_soft:
            if true_count >= 3:
                return Action.STAND, "Stand on 12 vs 2 when True Count is +3 or higher."

        return basic_move, "Basic Strategy"

# --- Game & Counting Logic ---

class Counter:
    def __init__(self):
        self.running_count = 0
    
    def update(self, card: Card):
        self.running_count += card.hi_lo_value

    def get_true_count(self, decks_remaining: float) -> float:
        if decks_remaining <= 0: return self.running_count # Edge case
        # Common practice: floor, or truncate? 
        # Usually floor for betting, round for playing?
        # Let's use float for precision then display trunc.
        return self.running_count / decks_remaining

    def reset(self):
        self.running_count = 0

class BetSystem:
    def __init__(self, min_bet=10, max_bet=1000, bankroll=10000):
        self.min_bet = min_bet
        self.max_bet = max_bet
        self.bankroll = bankroll
    
    def get_recommendation(self, true_count: float) -> Tuple[int, str]:
        """
        Returns (BetAmount, Explanation)
        """
        # Simple Ramp
        # TC <= 0.5: 1 unit
        # TC 1: 2 units
        # TC 2: 4 units
        # TC 3: 6 units
        # TC >= 4: 8 units (or max)
        
        units = 1
        edge_est = 0.5 * true_count - 0.5 # Rough approximation: Start at -0.5% edge, +0.5% per TC point.
        # At TC +1 -> Edge 0%. At TC +2 -> Edge 0.5%.
        
        if true_count < 1:
            units = 1
            reason = "House has the edge. Bet minimum."
        elif true_count < 2:
            units = 2
            reason = "Count is slightly positive. Increase bet."
        elif true_count < 3:
            units = 4
            reason = "Good advantage. Bet 4 units."
        elif true_count < 4:
            units = 6
            reason = "Strong advantage. Bet 6 units."
        else:
            units = 8
            reason = "Maximum advantage. Bet max cap."
        
        amount = units * self.min_bet
        amount = min(amount, self.max_bet)
        amount = min(amount, self.bankroll) # Can't bet more than bankroll
        
        return amount, f"{reason} (Est. Edge: {edge_est:.1f}%)"


# --- Test Runner ---

def test_deck_logic():
    print("--- Testing Deck Logic ---")
    shoe = Shoe(num_decks=6, penetration=0.75)
    print(f"Initial cards: {len(shoe.cards)}")
    assert len(shoe.cards) == 6 * 52
    
    c = shoe.deal_card()
    print(f"Dealt: {c} (Value: {c.value}, HiLo: {c.hi_lo_value})")
    assert len(shoe.cards) == 6 * 52 - 1

def test_hand_logic():
    print("\n--- Testing Hand Logic ---")
    h = Hand()
    h.add_card(Card(Rank.ACE, Suit.SPADES))
    h.add_card(Card(Rank.FIVE, Suit.HEARTS))
    print(f"Hand: {h} IsSoft: {h.is_soft}")
    assert h.value == 16
    assert h.is_soft == True
    
    h.add_card(Card(Rank.TEN, Suit.CLUBS))
    print(f"Hand: {h} IsSoft: {h.is_soft}")
    assert h.value == 16
    assert h.is_soft == False

def test_counting():
    print("\n--- Testing Counting ---")
    counter = Counter()
    cards = [Card(Rank.TWO, Suit.S), Card(Rank.FIVE, Suit.H), Card(Rank.TEN, Suit.D), Card(Rank.ACE, Suit.C)] 
    # Values: +1, +1, -1, -1 = 0
    for c in cards:
        counter.update(c)
        print(f"Card: {c}, RC: {counter.running_count}")
    
    assert counter.running_count == 0
    
    # Test True Count
    # Suppose 2 decks remaining, RC = 4
    counter.running_count = 4
    tc = counter.get_true_count(2.0)
    print(f"RC: 4, Decks: 2.0 -> TC: {tc}")
    assert tc == 2.0

def test_strategy():
    print("\n--- Testing Strategy ---")
    engine = StrategyEngine()
    
    # 16 vs 10
    h = Hand()
    h.add_card(Card(Rank.TEN, Suit.S))
    h.add_card(Card(Rank.SIX, Suit.H))
    dealer = Card(Rank.TEN, Suit.C)
    
    move = engine.get_basic_strategy_move(h, dealer)
    print(f"16 vs 10 Basic: {move}")
    assert move == Action.HIT # Basic strategy says Hit 16 vs 10? Wait table says 16 vs 10 is HIT?
    # Let's check table.
    # Hard 16 vs 10. Table: "H" (Hit).
    # Wait, 16 vs 10 is usually Hit in BS? 
    # Ah, standard BS is Hit 16 vs 7-A if not surrender. 
    # Actually, 16 vs 10 is Hit.
    # Deviation: Stand if TC >= 0.
    
    tc_move, reason = engine.get_deviations(move, h, dealer, true_count=1)
    print(f"16 vs 10 TC+1: {tc_move} ({reason})")
    assert tc_move == Action.STAND

    # 12 vs 2
    h2 = Hand()
    h2.add_card(Card(Rank.TEN, Suit.S))
    h2.add_card(Card(Rank.TWO, Suit.H))
    dealer2 = Card(Rank.TWO, Suit.D)
    move2 = engine.get_basic_strategy_move(h2, dealer2)
    print(f"12 vs 2 Basic: {move2}")
    assert move2 == Action.HIT
    
    tc_move2, reason2 = engine.get_deviations(move2, h2, dealer2, true_count=4)
    print(f"12 vs 2 TC+4: {tc_move2} ({reason2})")
    assert tc_move2 == Action.STAND

def test_betting():
    print("\n--- Testing Betting ---")
    bs = BetSystem(min_bet=10)
    
    amt, reason = bs.get_recommendation(true_count=-1)
    print(f"TC -1: ${amt} - {reason}")
    assert amt == 10
    
    amt, reason = bs.get_recommendation(true_count=2)
    print(f"TC +2: ${amt} - {reason}")
    assert amt == 40 # 4 units

if __name__ == "__main__":
    test_deck_logic()
    test_hand_logic()
    test_counting()
    test_strategy()
    test_betting()
    print("\nAll Core Tests Passed!")
