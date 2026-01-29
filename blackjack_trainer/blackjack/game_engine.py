"""Blackjack game engine - state machine implementation."""

from typing import Optional, Set, List
from .config import GameConfig
from .models import (
    Card, Rank, Action, GamePhase, 
    PlayerHandState, TableState
)
from .shoe import Shoe
from .outcomes import Outcome
from .rules import dealer_should_hit, compare_hands, payout_for_outcome
from .hand import best_total_and_soft, is_blackjack, is_bust, can_split
from .counting import update_running_count
from .stats import BlackjackStats


class BlackjackEngine:
    """
    Blackjack game engine implementing a state machine.
    
    Manages the complete flow of a Blackjack game including dealing,
    player actions, dealer turn, and payouts.
    """
    
    def __init__(
        self, 
        config: Optional[GameConfig] = None,
        shoe: Optional[Shoe] = None
    ):
        """
        Initialize the engine.
        
        Args:
            config: Game configuration (uses defaults if None)
            shoe: Card shoe (creates new one if None)
        """
        self.config = config or GameConfig()
        self.shoe = shoe or Shoe(
            num_decks=self.config.num_decks,
            penetration=self.config.penetration
        )
        self.state = TableState(bankroll=self.config.starting_bankroll)
        self.stats = BlackjackStats()
        self.stats.update_bankroll_extremes(self.state.bankroll)
        self._next_hand_id = 0
    
    def new_session(self) -> None:
        """Reset everything for a new session."""
        self.shoe = Shoe(
            num_decks=self.config.num_decks,
            penetration=self.config.penetration
        )
        self.state = TableState(bankroll=self.config.starting_bankroll)
        self.stats = BlackjackStats()
        self.stats.update_bankroll_extremes(self.state.bankroll)
        self._next_hand_id = 0
    
    def _create_hand(self, bet: int) -> PlayerHandState:
        """Create a new player hand."""
        hand = PlayerHandState(hand_id=self._next_hand_id, bet=bet)
        self._next_hand_id += 1
        return hand
    
    def start_round(self, bet: int) -> bool:
        """
        Start a new round with the given bet.
        
        Args:
            bet: Amount to bet
            
        Returns:
            True if round started successfully
        """
        # Validate bet
        if bet < self.config.min_bet:
            self.state.message = f"Minimum bet is ${self.config.min_bet}"
            return False
        
        if bet > self.config.max_bet:
            self.state.message = f"Maximum bet is ${self.config.max_bet}"
            return False

        if bet > self.state.bankroll:
            self.state.message = "Insufficient bankroll"
            return False
        
        # Check for reshuffle
        if self.shoe.needs_reshuffle():
            self.shoe.rebuild_and_shuffle()
            self.state.running_count = 0
            self.state.message = "Shoe reshuffled"
        
        # Deduct bet and create hand
        self.state.bankroll -= bet
        self.state.current_bet = bet
        
        hand = self._create_hand(bet)
        hand.is_active = True
        self.state.player_hands = [hand]
        self.state.dealer_cards = []
        self.state.phase = GamePhase.DEALING
        self.state.insurance_bet = 0
        self.state.active_hand_index = 0
        self.state.split_count = 0
        self.state.message = "Dealing..."
        
        return True
    
    def deal_initial(self) -> None:
        """Deal the initial cards to player and dealer."""
        if self.state.phase != GamePhase.DEALING:
            return
        
        # Deal 2 cards to player, 2 to dealer
        player_hand = self.state.player_hands[0]
        
        player_hand.cards.append(self.shoe.draw())
        self.state.dealer_cards.append(self.shoe.draw())
        player_hand.cards.append(self.shoe.draw())
        self.state.dealer_cards.append(self.shoe.draw())
        
        # Update running count for dealt cards
        all_dealt = player_hand.cards + self.state.dealer_cards
        self.state.running_count = update_running_count(
            self.state.running_count, all_dealt
        )
        self.state.decks_remaining_estimate = self.shoe.decks_remaining_estimate()
        
        # Check for blackjacks and insurance
        player_bj = is_blackjack(player_hand.cards)
        dealer_upcard = self.state.dealer_cards[0]
        dealer_has_ace = dealer_upcard.rank == Rank.ACE
        dealer_bj = is_blackjack(self.state.dealer_cards)
        
        # Insurance offer if dealer shows Ace
        if dealer_has_ace:
            self.state.phase = GamePhase.INSURANCE_OFFER
            self.state.message = "Insurance? Dealer shows Ace"
            return
        
        # Check for immediate resolution
        if player_bj and dealer_bj:
            # Both have blackjack - push
            self._resolve_hand(player_hand, Outcome.PUSH)
            self._finish_round()
            self.state.message = "Both Blackjack! Push"
        elif player_bj:
            # Player blackjack wins
            self._resolve_hand(player_hand, Outcome.BLACKJACK)
            self._finish_round()
            self.state.message = "Blackjack! You win!"
        elif dealer_bj:
            # Dealer blackjack
            self._resolve_hand(player_hand, Outcome.LOSE)
            self._finish_round()
            self.state.message = "Dealer has Blackjack!"
        else:
            # Normal play
            self.state.phase = GamePhase.PLAYER_TURN
            self.state.message = "Your turn"
    
    def take_insurance(self, take: bool) -> None:
        """
        Handle insurance decision.
        
        Args:
            take: True to take insurance
        """
        if self.state.phase != GamePhase.INSURANCE_OFFER:
            return
        
        player_hand = self.state.player_hands[0]
        dealer_bj = is_blackjack(self.state.dealer_cards)
        player_bj = is_blackjack(player_hand.cards)
        
        if take:
            # Insurance costs half the original bet
            insurance_bet = player_hand.bet // 2
            if insurance_bet <= self.state.bankroll:
                self.state.bankroll -= insurance_bet
                self.state.insurance_bet = insurance_bet
                self.stats.insurance_taken += 1
        
        if dealer_bj:
            # Dealer has blackjack
            if take and self.state.insurance_bet > 0:
                # Insurance pays 2:1
                insurance_win = int(self.state.insurance_bet * self.config.insurance_pays)
                self.state.bankroll += self.state.insurance_bet + insurance_win
                self.stats.insurance_won += 1
                self.state.message = f"Dealer Blackjack! Insurance wins ${insurance_win}"
            else:
                self.state.message = "Dealer has Blackjack!"
            
            # Resolve main bet
            if player_bj:
                self._resolve_hand(player_hand, Outcome.PUSH)
                self.state.message += " Main bet pushes."
            else:
                self._resolve_hand(player_hand, Outcome.LOSE)
            
            self._finish_round()
        else:
            # No dealer blackjack
            if take and self.state.insurance_bet > 0:
                self.state.message = f"No dealer Blackjack. Insurance lost (${self.state.insurance_bet})"
            else:
                self.state.message = "No dealer Blackjack"
            
            self.state.insurance_bet = 0  # Lost insurance
            
            # Check if player has blackjack
            if player_bj:
                self._resolve_hand(player_hand, Outcome.BLACKJACK)
                self._finish_round()
                self.state.message = "Blackjack! You win!"
            else:
                self.state.phase = GamePhase.PLAYER_TURN
                self.state.message += ". Your turn."
    
    def available_actions(self) -> Set[Action]:
        """
        Get available actions for the current active hand.
        
        Returns:
            Set of available actions
        """
        if self.state.phase != GamePhase.PLAYER_TURN:
            return set()
        
        hand = self.active_hand()
        if hand is None or hand.resolved:
            return set()
        
        actions = {Action.HIT, Action.STAND}
        
        # Double - only with 2 cards and sufficient bankroll
        if len(hand.cards) == 2:
            can_double = True
            if hand.is_split_child and not self.config.double_after_split:
                can_double = False
            if hand.bet > self.state.bankroll:
                can_double = False
            if can_double:
                actions.add(Action.DOUBLE)
        
        # Split - 2 cards of same rank and under max splits
        if len(hand.cards) == 2:
            if can_split(hand.cards, self.config.allow_split_by_value):
                if self.state.split_count < self.config.max_splits:
                    if hand.bet <= self.state.bankroll:
                        actions.add(Action.SPLIT)
        
        return actions
    
    def active_hand(self) -> Optional[PlayerHandState]:
        """Get the currently active hand."""
        if self.state.active_hand_index < len(self.state.player_hands):
            hand = self.state.player_hands[self.state.active_hand_index]
            if not hand.resolved:
                return hand
        return None
    
    def act(self, action: Action) -> None:
        """
        Perform an action on the current active hand.
        
        Args:
            action: The action to perform
        """
        if self.state.phase != GamePhase.PLAYER_TURN:
            return
        
        hand = self.active_hand()
        if hand is None:
            return
        
        if action == Action.HIT:
            self._do_hit(hand)
        elif action == Action.STAND:
            self._do_stand(hand)
        elif action == Action.DOUBLE:
            self._do_double(hand)
        elif action == Action.SPLIT:
            self._do_split(hand)
    
    def _do_hit(self, hand: PlayerHandState) -> None:
        """Hit - draw one card."""
        card = self.shoe.draw()
        hand.cards.append(card)
        self.state.running_count = update_running_count(
            self.state.running_count, [card]
        )
        self.state.decks_remaining_estimate = self.shoe.decks_remaining_estimate()
        
        if is_bust(hand.cards):
            self._resolve_hand(hand, Outcome.BUST)
            self.state.message = f"Hand {hand.hand_id + 1} busts!"
            self._advance_to_next_hand()
        else:
            total, soft = best_total_and_soft(hand.cards)
            soft_str = " (soft)" if soft else ""
            self.state.message = f"You have {total}{soft_str}"
    
    def _do_stand(self, hand: PlayerHandState) -> None:
        """Stand - finish this hand."""
        hand.is_active = False
        self._advance_to_next_hand()
    
    def _do_double(self, hand: PlayerHandState) -> None:
        """Double down - double bet, draw one card, stand."""
        if hand.bet > self.state.bankroll:
            self.state.message = "Insufficient bankroll to double"
            return
        
        # Deduct additional bet
        self.state.bankroll -= hand.bet
        hand.bet *= 2
        hand.is_doubled = True
        
        # Draw exactly one card
        card = self.shoe.draw()
        hand.cards.append(card)
        self.state.running_count = update_running_count(
            self.state.running_count, [card]
        )
        self.state.decks_remaining_estimate = self.shoe.decks_remaining_estimate()
        
        # Resolve immediately
        if is_bust(hand.cards):
            self._resolve_hand(hand, Outcome.BUST)
            self.state.message = f"Hand {hand.hand_id + 1} doubled and busted!"
        else:
            total, _ = best_total_and_soft(hand.cards)
            self.state.message = f"Doubled! You have {total}"
        
        hand.is_active = False
        self._advance_to_next_hand()
    
    def _do_split(self, hand: PlayerHandState) -> None:
        """Split the hand into two."""
        if hand.bet > self.state.bankroll:
            self.state.message = "Insufficient bankroll to split"
            return
        
        # Deduct bet for new hand
        self.state.bankroll -= hand.bet
        self.state.split_count += 1
        
        # Create new hand with second card
        new_hand = self._create_hand(hand.bet)
        new_hand.cards.append(hand.cards.pop())
        new_hand.is_split_child = True
        hand.is_split_child = True
        
        # Deal one card to each hand
        card1 = self.shoe.draw()
        card2 = self.shoe.draw()
        hand.cards.append(card1)
        new_hand.cards.append(card2)
        
        self.state.running_count = update_running_count(
            self.state.running_count, [card1, card2]
        )
        self.state.decks_remaining_estimate = self.shoe.decks_remaining_estimate()
        
        # Insert new hand after current
        idx = self.state.player_hands.index(hand)
        self.state.player_hands.insert(idx + 1, new_hand)
        
        # Check for split aces rule
        if hand.cards[0].rank == Rank.ACE and self.config.split_aces_one_card_only:
            # Both hands get only one card and are done
            hand.is_active = False
            new_hand.is_active = False
            self.state.message = "Split Aces - one card each"
            self._advance_to_next_hand()
        else:
            self.state.message = "Split! Playing first hand"
    
    def _advance_to_next_hand(self) -> None:
        """Move to the next unresolved hand or dealer turn."""
        # Find next unresolved hand after the current one
        start = self.state.active_hand_index + 1
        for i in range(start, len(self.state.player_hands)):
            hand = self.state.player_hands[i]
            if not hand.resolved and not is_bust(hand.cards):
                # Check if this hand can still act
                if hand.is_split_child and hand.cards[0].rank == Rank.ACE:
                    if self.config.split_aces_one_card_only and len(hand.cards) >= 2:
                        continue
                self.state.active_hand_index = i
                hand.is_active = True
                return
        
        # All hands done, go to dealer turn
        self._dealer_turn()
    
    def _dealer_turn(self) -> None:
        """Execute dealer's turn."""
        self.state.phase = GamePhase.DEALER_TURN
        
        # Check if all player hands busted
        all_busted = all(
            is_bust(h.cards) or h.resolved 
            for h in self.state.player_hands
        )
        
        if all_busted:
            self._resolve_all_hands()
            return
        
        # Dealer draws until standing
        while dealer_should_hit(self.state.dealer_cards, self.config):
            card = self.shoe.draw()
            self.state.dealer_cards.append(card)
            self.state.running_count = update_running_count(
                self.state.running_count, [card]
            )
        
        self.state.decks_remaining_estimate = self.shoe.decks_remaining_estimate()
        self._resolve_all_hands()
    
    def _resolve_hand(self, hand: PlayerHandState, outcome: Outcome) -> None:
        """Resolve a single hand with the given outcome."""
        hand.resolved = True
        hand.is_active = False
        hand.result = outcome.name
        
        profit = payout_for_outcome(outcome, hand.bet, self.config)
        
        # Return bet + profit to bankroll
        if outcome in (Outcome.WIN, Outcome.BLACKJACK):
            self.state.bankroll += hand.bet + profit
        elif outcome == Outcome.PUSH:
            self.state.bankroll += hand.bet
        # LOSE and BUST: bet already deducted
        
        # Update stats
        self.stats.update_for_outcome(
            outcome.name, 
            hand.bet, 
            profit,
            is_doubled=hand.is_doubled,
            is_split=hand.is_split_child
        )
    
    def _resolve_all_hands(self) -> None:
        """Resolve all remaining player hands against dealer."""
        dealer_total, _ = best_total_and_soft(self.state.dealer_cards)
        
        messages = []
        for hand in self.state.player_hands:
            if hand.resolved:
                continue
            
            outcome = compare_hands(hand.cards, self.state.dealer_cards, self.config)
            self._resolve_hand(hand, outcome)
            
            player_total, _ = best_total_and_soft(hand.cards)
            if len(self.state.player_hands) > 1:
                messages.append(f"Hand {hand.hand_id + 1}: {outcome}")
            else:
                messages.append(str(outcome))
        
        self._finish_round()
        
        if messages:
            dealer_bust = " (Dealer busts!)" if is_bust(self.state.dealer_cards) else ""
            self.state.message = f"Dealer: {dealer_total}{dealer_bust}. " + ", ".join(messages)
    
    def _finish_round(self) -> None:
        """Finish the round and update state."""
        self.state.phase = GamePhase.ROUND_OVER
        self.stats.update_bankroll_extremes(self.state.bankroll)
        
        # Deactivate all hands
        for hand in self.state.player_hands:
            hand.is_active = False
    
    def next_round(self) -> None:
        """Reset for the next round."""
        self.state.player_hands = []
        self.state.dealer_cards = []
        self.state.current_bet = 0
        self.state.insurance_bet = 0
        self.state.active_hand_index = 0
        self.state.split_count = 0
        self.state.phase = GamePhase.BETTING
        self.state.message = "Place your bet"
    
    def get_state(self) -> TableState:
        """Get the current table state."""
        return self.state.copy()
    
    def get_stats(self) -> dict:
        """Get game statistics."""
        return self.stats.to_dict()
