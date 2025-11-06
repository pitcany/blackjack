"""Core blackjack game logic."""

import random
import uuid
from typing import List, Tuple, Optional
from models import Card


SUITS = ["♠", "♥", "♦", "♣"]
RANKS = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"]


class BlackjackEngine:
    """Core blackjack game engine."""

    def __init__(self, num_decks: int = 6, starting_bankroll: int = 1000):
        self.game_id = str(uuid.uuid4())
        self.num_decks = num_decks
        self.deck: List[Card] = []
        self.player_hand: List[Card] = []
        self.dealer_hand: List[Card] = []
        self.running_count = 0
        self.cards_dealt = 0
        self.bankroll = starting_bankroll
        self.starting_bankroll = starting_bankroll
        self.current_bet = 0
        self.game_state = "betting"
        self.message = "Place your bet to start"

        # Split handling
        self.is_split = False
        self.split_hands: List[List[Card]] = [[], []]
        self.active_split_hand = 0
        self.split_doubled = [False, False]

        # Insurance
        self.insurance_bet = 0
        self.insurance_offered = False

        self.initialize_deck()

    def initialize_deck(self):
        """Create and shuffle a new deck."""
        self.deck = []
        for _ in range(self.num_decks):
            for suit in SUITS:
                for rank in RANKS:
                    self.deck.append(Card(rank=rank, suit=suit))
        random.shuffle(self.deck)
        self.running_count = 0
        self.cards_dealt = 0

    def get_card_count_value(self, card: Card) -> int:
        """Get Hi-Lo count value for a card."""
        if card.rank in ["2", "3", "4", "5", "6"]:
            return 1
        elif card.rank in ["10", "J", "Q", "K", "A"]:
            return -1
        return 0

    def calculate_hand_value(self, hand: List[Card]) -> int:
        """Calculate blackjack value of a hand."""
        value = 0
        aces = 0

        for card in hand:
            if card.rank == "A":
                aces += 1
                value += 11
            elif card.rank in ["J", "Q", "K"]:
                value += 10
            else:
                value += int(card.rank)

        while value > 21 and aces > 0:
            value -= 10
            aces -= 1

        return value

    def get_true_count(self) -> int:
        """Calculate true count."""
        decks_remaining = (self.num_decks * 52 - self.cards_dealt) / 52
        if decks_remaining > 0:
            return round(self.running_count / decks_remaining)
        return 0

    def get_betting_advice(self) -> Tuple[int, str]:
        """Get betting advice based on true count."""
        true_count = self.get_true_count()
        if true_count <= 0:
            return 1, "Minimum bet - count is neutral or negative"
        elif true_count == 1:
            return 2, "Slight advantage - increase bet moderately"
        elif true_count == 2:
            return 4, "Good advantage - increase bet significantly"
        elif true_count == 3:
            return 6, "Strong advantage - large bet recommended"
        else:
            return 8, "Excellent advantage - maximum bet"

    def get_basic_strategy(self) -> Optional[str]:
        """Get basic strategy recommendation."""
        if not self.player_hand or not self.dealer_hand:
            return None

        if self.game_state != "playing":
            return None

        hand = self.split_hands[self.active_split_hand] if self.is_split else self.player_hand
        dealer_card = self.dealer_hand[0]
        dealer_value = (
            11
            if dealer_card.rank == "A"
            else (10 if dealer_card.rank in ["J", "Q", "K"] else int(dealer_card.rank))
        )
        player_value = self.calculate_hand_value(hand)

        # Check for pairs
        is_pair = (
            len(hand) == 2
            and hand[0].rank == hand[1].rank
            and not self.is_split
        )
        has_ace = any(card.rank == "A" for card in hand)

        # Calculate if soft hand
        sum_aces_as_one = sum(
            1 if card.rank == "A" else (10 if card.rank in ["J", "Q", "K"] else int(card.rank))
            for card in hand
        )
        is_soft = has_ace and player_value <= 21 and (sum_aces_as_one + 10) == player_value

        # Pair splitting
        if is_pair:
            rank = hand[0].rank
            if rank in ["A", "8"]:
                return "SPLIT"
            if rank in ["2", "3", "7"] and dealer_value <= 7:
                return "SPLIT"
            if rank == "6" and dealer_value <= 6:
                return "SPLIT"
            if rank == "9" and dealer_value <= 9 and dealer_value != 7:
                return "SPLIT"
            if rank in ["10", "J", "Q", "K"]:
                return "STAND"

        # Soft hand
        if is_soft and player_value <= 21:
            if player_value >= 19:
                return "STAND"
            if player_value == 18 and dealer_value >= 9:
                return "HIT"
            if player_value == 18 and dealer_value <= 6:
                return "DOUBLE" if len(hand) == 2 else "HIT"
            if player_value == 18:
                return "STAND"
            return "HIT"

        # Hard hand
        if player_value >= 17:
            return "STAND"
        if player_value >= 13:
            return "STAND" if dealer_value <= 6 else "HIT"
        if player_value == 12:
            return "STAND" if 4 <= dealer_value <= 6 else "HIT"
        if player_value == 11:
            return "DOUBLE" if len(hand) == 2 else "HIT"
        if player_value == 10:
            return "DOUBLE" if len(hand) == 2 and dealer_value <= 9 else "HIT"
        if player_value == 9:
            return "DOUBLE" if len(hand) == 2 and 3 <= dealer_value <= 6 else "HIT"

        return "HIT"

    def place_bet(self, amount: int) -> Tuple[bool, str]:
        """Place a bet."""
        if self.game_state != "betting":
            return False, "Can only bet in betting state"
        if amount <= 0:
            return False, "Bet must be positive"
        if amount > self.bankroll:
            return False, "Insufficient funds"

        self.current_bet = amount
        return True, "Bet placed"

    def deal_initial_cards(self) -> Tuple[bool, str]:
        """Deal initial cards."""
        if self.game_state != "betting":
            return False, "Can only deal in betting state"
        if self.current_bet <= 0:
            return False, "Must place bet first"
        if self.current_bet > self.bankroll:
            return False, "Insufficient funds"

        self.player_hand = []
        self.dealer_hand = []
        self.is_split = False
        self.split_hands = [[], []]
        self.active_split_hand = 0
        self.split_doubled = [False, False]
        self.insurance_bet = 0
        self.insurance_offered = False

        # Deal cards
        for _ in range(2):
            card = self.deck.pop(0)
            self.player_hand.append(card)
            self.running_count += self.get_card_count_value(card)
            self.cards_dealt += 1

        for i in range(2):
            card = self.deck.pop(0)
            self.dealer_hand.append(card)
            if i == 0:
                self.running_count += self.get_card_count_value(card)
            self.cards_dealt += 1

        # Check for insurance
        if self.dealer_hand[0].rank == "A":
            self.insurance_offered = True
            self.game_state = "insurance"
            true_count = self.get_true_count()
            if true_count >= 3:
                self.message = "Insurance available! (True count +3: Consider taking it)"
            else:
                self.message = "Insurance available? (Not recommended at this count)"
            return True, self.message

        # Check for blackjack
        player_value = self.calculate_hand_value(self.player_hand)
        if player_value == 21:
            dealer_value = self.calculate_hand_value(self.dealer_hand)
            self.running_count += self.get_card_count_value(self.dealer_hand[1])

            if dealer_value == 21:
                self.message = "Push! Both have blackjack"
            else:
                blackjack_winnings = int(self.current_bet * 1.5)
                self.bankroll += blackjack_winnings
                self.message = f"Blackjack! You win ${blackjack_winnings} (3:2 payout)"
            self.game_state = "finished"
        else:
            self.game_state = "playing"
            self.message = "Make your move"

        return True, self.message

    def take_insurance(self) -> Tuple[bool, str]:
        """Take insurance bet."""
        if self.game_state != "insurance":
            return False, "Insurance not available"

        insurance_cost = self.current_bet // 2
        if insurance_cost > self.bankroll:
            return False, "Insufficient funds for insurance"

        self.insurance_bet = insurance_cost
        return self._check_dealer_blackjack()

    def decline_insurance(self) -> Tuple[bool, str]:
        """Decline insurance."""
        if self.game_state != "insurance":
            return False, "Insurance not available"

        self.insurance_bet = 0
        return self._check_dealer_blackjack()

    def _check_dealer_blackjack(self) -> Tuple[bool, str]:
        """Check for dealer blackjack after insurance decision."""
        dealer_value = self.calculate_hand_value(self.dealer_hand)
        self.running_count += self.get_card_count_value(self.dealer_hand[1])

        if dealer_value == 21:
            player_value = self.calculate_hand_value(self.player_hand)

            if self.insurance_bet > 0:
                insurance_payout = self.insurance_bet * 2
                self.bankroll += insurance_payout
                self.message = f"Dealer has blackjack! Insurance pays ${insurance_payout}"
            else:
                self.message = "Dealer has blackjack!"

            if player_value == 21:
                self.message += " | Main bet pushes"
            else:
                self.bankroll -= self.current_bet

            self.game_state = "finished"
        else:
            if self.insurance_bet > 0:
                self.bankroll -= self.insurance_bet
                self.message = f"No dealer blackjack. Lost ${self.insurance_bet} on insurance"

            player_value = self.calculate_hand_value(self.player_hand)
            if player_value == 21:
                blackjack_winnings = int(self.current_bet * 1.5)
                self.bankroll += blackjack_winnings
                self.message = f"Blackjack! You win ${blackjack_winnings}"
                self.game_state = "finished"
            else:
                self.game_state = "playing"
                if self.insurance_bet == 0:
                    self.message = "Make your move"

        return True, self.message

    def hit(self) -> Tuple[bool, str]:
        """Player hits."""
        if self.game_state != "playing":
            return False, "Can only hit during playing state"

        if self.is_split:
            card = self.deck.pop(0)
            self.split_hands[self.active_split_hand].append(card)
            self.running_count += self.get_card_count_value(card)
            self.cards_dealt += 1

            value = self.calculate_hand_value(self.split_hands[self.active_split_hand])
            if value > 21:
                if self.active_split_hand == 0:
                    self.active_split_hand = 1
                    self.message = "Hand 1 busted. Playing hand 2"
                else:
                    self.game_state = "dealer"
                    self._dealer_play()
        else:
            card = self.deck.pop(0)
            self.player_hand.append(card)
            self.running_count += self.get_card_count_value(card)
            self.cards_dealt += 1

            if self.calculate_hand_value(self.player_hand) > 21:
                self.message = "Bust! Dealer wins"
                self.bankroll -= self.current_bet
                self.game_state = "finished"

        return True, self.message

    def stand(self) -> Tuple[bool, str]:
        """Player stands."""
        if self.game_state != "playing":
            return False, "Can only stand during playing state"

        if self.is_split and self.active_split_hand == 0:
            self.active_split_hand = 1
            self.message = "Playing hand 2"
        else:
            self.game_state = "dealer"
            self._dealer_play()

        return True, self.message

    def double_down(self) -> Tuple[bool, str]:
        """Player doubles down."""
        if self.game_state != "playing":
            return False, "Can only double during playing state"

        hand = self.split_hands[self.active_split_hand] if self.is_split else self.player_hand
        if len(hand) != 2:
            return False, "Can only double on initial 2 cards"

        if self.is_split:
            other_hand_idx = 1 - self.active_split_hand
            other_hand_bet = self.current_bet * 2 if self.split_doubled[other_hand_idx] else self.current_bet
            total_exposure = other_hand_bet + self.current_bet * 2
            if total_exposure > self.bankroll:
                return False, "Insufficient funds to double"
            self.split_doubled[self.active_split_hand] = True
        else:
            if self.current_bet * 2 > self.bankroll:
                return False, "Insufficient funds to double"
            self.current_bet *= 2

        # Take one card
        if self.is_split:
            card = self.deck.pop(0)
            self.split_hands[self.active_split_hand].append(card)
            self.running_count += self.get_card_count_value(card)
            self.cards_dealt += 1

            if self.active_split_hand == 0:
                self.active_split_hand = 1
                self.message = "Playing hand 2"
            else:
                self.game_state = "dealer"
                self._dealer_play()
        else:
            card = self.deck.pop(0)
            self.player_hand.append(card)
            self.running_count += self.get_card_count_value(card)
            self.cards_dealt += 1

            if self.calculate_hand_value(self.player_hand) > 21:
                self.message = "Bust! Dealer wins"
                self.bankroll -= self.current_bet
                self.game_state = "finished"
            else:
                self.game_state = "dealer"
                self._dealer_play()

        return True, self.message

    def split(self) -> Tuple[bool, str]:
        """Player splits."""
        if self.game_state != "playing":
            return False, "Can only split during playing state"
        if len(self.player_hand) != 2:
            return False, "Can only split with 2 cards"
        if self.player_hand[0].rank != self.player_hand[1].rank:
            return False, "Can only split matching pairs"
        if self.current_bet * 2 > self.bankroll:
            return False, "Insufficient funds to split"

        self.is_split = True
        self.split_hands = [[self.player_hand[0]], [self.player_hand[1]]]

        for i in range(2):
            card = self.deck.pop(0)
            self.split_hands[i].append(card)
            self.running_count += self.get_card_count_value(card)
            self.cards_dealt += 1

        self.active_split_hand = 0
        self.message = "Playing hand 1"
        return True, self.message

    def _dealer_play(self):
        """Dealer plays their hand."""
        self.running_count += self.get_card_count_value(self.dealer_hand[1])

        while self.calculate_hand_value(self.dealer_hand) < 17:
            card = self.deck.pop(0)
            self.dealer_hand.append(card)
            self.running_count += self.get_card_count_value(card)
            self.cards_dealt += 1

        self._finish_hand()

    def _finish_hand(self):
        """Finish the hand and calculate winnings."""
        dealer_value = self.calculate_hand_value(self.dealer_hand)

        if self.is_split:
            total_win = 0
            results = []

            for i in range(2):
                hand_value = self.calculate_hand_value(self.split_hands[i])
                hand_bet = self.current_bet * 2 if self.split_doubled[i] else self.current_bet

                if hand_value > 21:
                    results.append(f"Hand {i+1}: Bust")
                    total_win -= hand_bet
                elif dealer_value > 21:
                    results.append(f"Hand {i+1}: Win")
                    total_win += hand_bet
                elif hand_value > dealer_value:
                    results.append(f"Hand {i+1}: Win")
                    total_win += hand_bet
                elif hand_value < dealer_value:
                    results.append(f"Hand {i+1}: Loss")
                    total_win -= hand_bet
                else:
                    results.append(f"Hand {i+1}: Push")

            self.bankroll += total_win
            self.message = " | ".join(results) + f" | Net: {'+' if total_win >= 0 else ''}${total_win}"
        else:
            player_value = self.calculate_hand_value(self.player_hand)

            if dealer_value > 21:
                self.message = f"Dealer busts! You win with {player_value}!"
                self.bankroll += self.current_bet
            elif player_value > dealer_value:
                self.message = f"You win! {player_value} beats {dealer_value}"
                self.bankroll += self.current_bet
            elif player_value < dealer_value:
                self.message = f"Dealer wins. {dealer_value} beats {player_value}"
                self.bankroll -= self.current_bet
            else:
                self.message = f"Push! Both have {player_value}"

        self.game_state = "finished"

    def new_hand(self) -> Tuple[bool, str]:
        """Start a new hand."""
        if self.game_state != "finished":
            return False, "Can only start new hand after finishing current hand"

        if len(self.deck) < 20:
            self.initialize_deck()

        self.player_hand = []
        self.dealer_hand = []
        self.is_split = False
        self.split_hands = [[], []]
        self.active_split_hand = 0
        self.split_doubled = [False, False]
        self.insurance_bet = 0
        self.insurance_offered = False
        self.game_state = "betting"
        self.message = "Place your bet to start"
        return True, self.message

    def can_split(self) -> bool:
        """Check if player can split."""
        return (
            len(self.player_hand) == 2
            and self.player_hand[0].rank == self.player_hand[1].rank
            and not self.is_split
            and self.current_bet * 2 <= self.bankroll
            and self.game_state == "playing"
        )

    def can_double(self) -> bool:
        """Check if player can double down."""
        if self.game_state != "playing":
            return False

        hand = self.split_hands[self.active_split_hand] if self.is_split else self.player_hand
        if len(hand) != 2:
            return False

        if self.is_split:
            other_hand_idx = 1 - self.active_split_hand
            other_hand_bet = self.current_bet * 2 if self.split_doubled[other_hand_idx] else self.current_bet
            total_exposure = other_hand_bet + self.current_bet * 2
            return total_exposure <= self.bankroll
        else:
            return self.current_bet * 2 <= self.bankroll
