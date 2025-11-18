"""Blackjack game logic and state management."""
from typing import List, Optional, Callable
from enum import Enum
from .card import Card, Deck, Hand
from .counter import CardCounter
from .strategy import BasicStrategy


class GameState(Enum):
    """Possible game states."""
    WAITING_FOR_BET = "waiting_for_bet"
    BETTING = "betting"
    DEALING = "dealing"
    PLAYER_TURN = "player_turn"
    DEALER_TURN = "dealer_turn"
    ROUND_OVER = "round_over"
    GAME_OVER = "game_over"


class GameResult(Enum):
    """Possible round results."""
    PLAYER_BLACKJACK = "player_blackjack"
    PLAYER_WIN = "player_win"
    DEALER_WIN = "dealer_win"
    PUSH = "push"
    PLAYER_BUST = "player_bust"
    DEALER_BUST = "dealer_bust"
    SURRENDER = "surrender"


class BlackjackGame:
    """Main Blackjack game controller."""

    def __init__(self, num_decks: int = 6, starting_balance: int = 1000,
                 min_bet: int = 10, max_bet: int = 500,
                 allow_surrender: bool = True,
                 allow_double_after_split: bool = True):
        """Initialize a Blackjack game.

        Args:
            num_decks: Number of decks in the shoe
            starting_balance: Starting player balance
            min_bet: Minimum bet amount
            max_bet: Maximum bet amount
            allow_surrender: Whether surrender is allowed
            allow_double_after_split: Whether double after split is allowed
        """
        self.deck = Deck(num_decks)
        self.counter = CardCounter(self.deck, base_bet=min_bet)
        self.strategy = BasicStrategy()

        self.player_balance = starting_balance
        self.min_bet = min_bet
        self.max_bet = max_bet
        self.allow_surrender = allow_surrender
        self.allow_double_after_split = allow_double_after_split

        self.player_hands: List[Hand] = []
        self.dealer_hand: Optional[Hand] = None
        self.current_hand_index: int = 0
        self.state: GameState = GameState.WAITING_FOR_BET

        # Statistics
        self.rounds_played: int = 0
        self.rounds_won: int = 0
        self.rounds_lost: int = 0
        self.rounds_pushed: int = 0
        self.total_wagered: int = 0
        self.total_won: int = 0

        # Callbacks for GUI updates
        self.on_state_change: Optional[Callable] = None

    def reset_round(self):
        """Reset for a new round."""
        self.player_hands = []
        self.dealer_hand = None
        self.current_hand_index = 0

        # Check if deck needs shuffle
        if self.deck.needs_shuffle():
            self.deck.reset()
            self.counter.reset()

        self.state = GameState.WAITING_FOR_BET
        self._notify_state_change()

    def place_bet(self, amount: int) -> bool:
        """Place a bet for the round.

        Args:
            amount: Bet amount

        Returns:
            bool: True if bet was accepted
        """
        if self.state != GameState.WAITING_FOR_BET:
            return False

        if amount < self.min_bet or amount > self.max_bet:
            return False

        if amount > self.player_balance:
            return False

        # Create player hand with bet
        hand = Hand()
        hand.bet = amount
        self.player_hands = [hand]
        self.player_balance -= amount
        self.total_wagered += amount

        self.state = GameState.DEALING
        self._notify_state_change()

        # Deal initial cards
        self._deal_initial_cards()

        return True

    def _deal_initial_cards(self):
        """Deal initial two cards to player and dealer."""
        self.dealer_hand = Hand()

        # Deal in order: player, dealer, player, dealer
        for _ in range(2):
            card = self.deck.deal_card()
            self.player_hands[0].add_card(card)
            self.counter.update(card)

            card = self.deck.deal_card()
            self.dealer_hand.add_card(card)
            self.counter.update(card)

        # Check for blackjacks
        if self.player_hands[0].is_blackjack():
            if self.dealer_hand.is_blackjack():
                # Push
                self._end_round(GameResult.PUSH)
            else:
                # Player blackjack pays 3:2
                self._end_round(GameResult.PLAYER_BLACKJACK)
        elif self.dealer_hand.is_blackjack():
            # Dealer blackjack
            self._end_round(GameResult.DEALER_WIN)
        else:
            # Normal play
            self.state = GameState.PLAYER_TURN
            self._notify_state_change()

    def get_current_hand(self) -> Optional[Hand]:
        """Get the current active player hand."""
        if self.current_hand_index < len(self.player_hands):
            return self.player_hands[self.current_hand_index]
        return None

    def can_hit(self) -> bool:
        """Check if player can hit."""
        if self.state != GameState.PLAYER_TURN:
            return False
        hand = self.get_current_hand()
        return hand is not None and not hand.is_bust()

    def can_stand(self) -> bool:
        """Check if player can stand."""
        return self.state == GameState.PLAYER_TURN

    def can_double(self) -> bool:
        """Check if player can double down."""
        if self.state != GameState.PLAYER_TURN:
            return False
        hand = self.get_current_hand()
        if hand is None:
            return False
        if not hand.can_double():
            return False
        if hand.is_split and not self.allow_double_after_split:
            return False
        # Check if player has enough balance
        return self.player_balance >= hand.bet

    def can_split(self) -> bool:
        """Check if player can split."""
        if self.state != GameState.PLAYER_TURN:
            return False
        hand = self.get_current_hand()
        if hand is None:
            return False
        if not hand.can_split():
            return False
        # Check if player has enough balance
        return self.player_balance >= hand.bet

    def can_surrender(self) -> bool:
        """Check if player can surrender."""
        if not self.allow_surrender:
            return False
        if self.state != GameState.PLAYER_TURN:
            return False
        hand = self.get_current_hand()
        # Can only surrender on first two cards
        return hand is not None and len(hand.cards) == 2 and not hand.is_split

    def hit(self) -> bool:
        """Player hits (takes another card).

        Returns:
            bool: True if action was successful
        """
        if not self.can_hit():
            return False

        hand = self.get_current_hand()
        card = self.deck.deal_card()
        hand.add_card(card)
        self.counter.update(card)

        # Check if bust
        if hand.is_bust():
            self._next_hand_or_dealer()

        self._notify_state_change()
        return True

    def stand(self) -> bool:
        """Player stands (ends turn for current hand).

        Returns:
            bool: True if action was successful
        """
        if not self.can_stand():
            return False

        self._next_hand_or_dealer()
        self._notify_state_change()
        return True

    def double_down(self) -> bool:
        """Player doubles down (doubles bet, gets one card, ends turn).

        Returns:
            bool: True if action was successful
        """
        if not self.can_double():
            return False

        hand = self.get_current_hand()

        # Double the bet
        self.player_balance -= hand.bet
        self.total_wagered += hand.bet
        hand.bet *= 2
        hand.is_doubled = True

        # Deal one card
        card = self.deck.deal_card()
        hand.add_card(card)
        self.counter.update(card)

        # Move to next hand or dealer
        self._next_hand_or_dealer()

        self._notify_state_change()
        return True

    def split(self) -> bool:
        """Player splits a pair.

        Returns:
            bool: True if action was successful
        """
        if not self.can_split():
            return False

        hand = self.get_current_hand()

        # Create new hand with second card
        new_hand = Hand()
        new_hand.bet = hand.bet
        new_hand.is_split = True
        new_hand.add_card(hand.cards.pop())

        # Deduct bet for new hand
        self.player_balance -= new_hand.bet
        self.total_wagered += new_hand.bet

        # Mark original hand as split
        hand.is_split = True

        # Deal one card to each hand
        card1 = self.deck.deal_card()
        hand.add_card(card1)
        self.counter.update(card1)

        card2 = self.deck.deal_card()
        new_hand.add_card(card2)
        self.counter.update(card2)

        # Insert new hand after current hand
        self.player_hands.insert(self.current_hand_index + 1, new_hand)

        self._notify_state_change()
        return True

    def surrender(self) -> bool:
        """Player surrenders (forfeits half the bet).

        Returns:
            bool: True if action was successful
        """
        if not self.can_surrender():
            return False

        hand = self.get_current_hand()
        hand.is_surrendered = True

        # Return half the bet
        self.player_balance += hand.bet // 2

        self._end_round(GameResult.SURRENDER)
        return True

    def _next_hand_or_dealer(self):
        """Move to next hand or dealer's turn."""
        self.current_hand_index += 1

        if self.current_hand_index >= len(self.player_hands):
            # All player hands done, dealer's turn
            self._dealer_play()
        # Otherwise, continue with next hand (state stays PLAYER_TURN)

    def _dealer_play(self):
        """Execute dealer's turn."""
        self.state = GameState.DEALER_TURN
        self._notify_state_change()

        # Dealer hits on soft 17
        while self.dealer_hand.get_value() < 17 or \
              (self.dealer_hand.get_value() == 17 and self.dealer_hand.is_soft()):
            card = self.deck.deal_card()
            self.dealer_hand.add_card(card)
            self.counter.update(card)

        # Determine results for each hand
        self._determine_results()

    def _determine_results(self):
        """Determine results and payouts for all hands."""
        dealer_value = self.dealer_hand.get_value()
        dealer_bust = self.dealer_hand.is_bust()

        for hand in self.player_hands:
            if hand.is_surrendered:
                continue

            player_value = hand.get_value()
            player_bust = hand.is_bust()

            if player_bust:
                # Player bust, lose bet (already deducted)
                self.rounds_lost += 1
            elif dealer_bust:
                # Dealer bust, player wins
                payout = hand.bet * 2
                self.player_balance += payout
                self.total_won += payout
                self.rounds_won += 1
            elif player_value > dealer_value:
                # Player wins
                payout = hand.bet * 2
                self.player_balance += payout
                self.total_won += payout
                self.rounds_won += 1
            elif player_value < dealer_value:
                # Dealer wins (bet already deducted)
                self.rounds_lost += 1
            else:
                # Push (tie)
                self.player_balance += hand.bet
                self.rounds_pushed += 1

        self.rounds_played += 1
        self.state = GameState.ROUND_OVER
        self._notify_state_change()

    def _end_round(self, result: GameResult):
        """End the round with a specific result.

        Args:
            result: The round result
        """
        self.rounds_played += 1

        if result == GameResult.PLAYER_BLACKJACK:
            # Blackjack pays 3:2
            payout = int(self.player_hands[0].bet * 2.5)
            self.player_balance += payout
            self.total_won += payout
            self.rounds_won += 1
        elif result == GameResult.PUSH:
            # Return bet
            self.player_balance += self.player_hands[0].bet
            self.rounds_pushed += 1
        elif result == GameResult.DEALER_WIN:
            # Bet already deducted
            self.rounds_lost += 1
        elif result == GameResult.SURRENDER:
            # Half bet already returned
            self.rounds_lost += 1

        self.state = GameState.ROUND_OVER
        self._notify_state_change()

    def get_recommendation(self) -> Optional[str]:
        """Get basic strategy recommendation for current hand.

        Returns:
            str: Recommended action code, or None if not in player turn
        """
        if self.state != GameState.PLAYER_TURN:
            return None

        hand = self.get_current_hand()
        if hand is None or self.dealer_hand is None:
            return None

        dealer_up_card = self.dealer_hand.cards[0]

        return self.strategy.get_recommendation(
            hand, dealer_up_card,
            can_double=self.can_double(),
            can_split=self.can_split(),
            can_surrender=self.can_surrender()
        )

    def get_suggested_bet(self) -> int:
        """Get suggested bet based on card count.

        Returns:
            int: Suggested bet amount
        """
        return self.counter.get_suggested_bet(self.min_bet, self.max_bet)

    def _notify_state_change(self):
        """Notify observers of state change."""
        if self.on_state_change:
            self.on_state_change()

    def get_statistics(self) -> dict:
        """Get game statistics.

        Returns:
            dict: Statistics dictionary
        """
        net_profit = self.player_balance - 1000  # Assuming starting balance of 1000
        win_rate = (self.rounds_won / self.rounds_played * 100) if self.rounds_played > 0 else 0

        return {
            'balance': self.player_balance,
            'rounds_played': self.rounds_played,
            'rounds_won': self.rounds_won,
            'rounds_lost': self.rounds_lost,
            'rounds_pushed': self.rounds_pushed,
            'win_rate': win_rate,
            'total_wagered': self.total_wagered,
            'total_won': self.total_won,
            'net_profit': net_profit,
            'running_count': self.counter.get_running_count(),
            'true_count': self.counter.get_true_count(),
            'decks_remaining': self.deck.decks_remaining()
        }
