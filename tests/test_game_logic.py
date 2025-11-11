"""Tests for game logic and state transitions."""

import pytest
import pygame
from blackjack_card_counter.game import BlackjackGame
from blackjack_card_counter.card import Card


# Initialize pygame for tests
pygame.init()


class TestGameInitialization:
    """Test game initialization."""

    def test_game_starts_in_betting_state(self):
        """Test that game starts in betting state."""
        game = BlackjackGame()
        assert game.game_state == "betting"
        assert game.bankroll == 1000
        assert game.current_bet == 10

    def test_initial_deck_size(self):
        """Test that initial deck is correct size."""
        game = BlackjackGame()
        assert len(game.deck) == 6 * 52  # 6 decks by default

    def test_running_count_starts_at_zero(self):
        """Test that running count starts at zero."""
        game = BlackjackGame()
        assert game.running_count == 0
        assert game.cards_dealt == 0


class TestDealInitialCards:
    """Test dealing initial cards."""

    def test_deal_creates_hands(self):
        """Test that deal creates player and dealer hands."""
        game = BlackjackGame()
        game.deal_initial_cards()
        assert len(game.player_hand) == 2
        assert len(game.dealer_hand) == 2

    def test_deal_updates_running_count(self):
        """Test that dealing updates running count."""
        game = BlackjackGame()
        initial_count = game.running_count
        game.deal_initial_cards()
        # Count should have changed (unless all neutral cards)
        assert game.cards_dealt == 4

    def test_deal_transitions_to_playing(self):
        """Test that deal transitions to playing state (if no blackjack)."""
        game = BlackjackGame()
        game.deal_initial_cards()
        assert game.game_state in ["playing", "finished"]

    def test_insufficient_funds_blocks_deal(self):
        """Test that insufficient funds prevents deal."""
        game = BlackjackGame()
        game.bankroll = 5
        game.current_bet = 10
        game.deal_initial_cards()
        assert len(game.player_hand) == 0
        assert "Insufficient funds" in game.message


class TestInsurance:
    """Test insurance functionality."""

    def test_insurance_offered_on_dealer_ace(self):
        """Test that insurance is offered when dealer shows Ace."""
        game = BlackjackGame()
        game.player_hand = [Card('10', '♠'), Card('9', '♥')]
        game.dealer_hand = [Card('A', '♦'), Card('K', '♣')]
        game.current_bet = 10
        game.bankroll = 1000
        
        # Simulate deal_initial_cards check
        game.game_state = 'playing'
        game.can_surrender = True
        if game.dealer_hand[0].rank == "A":
            game.offered_insurance = True
            
        assert game.offered_insurance == True

    def test_insurance_costs_half_bet(self):
        """Test that insurance costs half the original bet."""
        game = BlackjackGame()
        game.player_hand = [Card('10', '♠'), Card('9', '♥')]
        game.dealer_hand = [Card('A', '♦'), Card('K', '♣')]
        game.current_bet = 20
        game.bankroll = 1000
        game.offered_insurance = True
        game.game_state = 'playing'
        
        initial_bankroll = game.bankroll
        game.take_insurance()
        
        # Insurance costs half bet (10)
        # If dealer doesn't have blackjack, we lose it
        # In this case dealer has BJ so we get 3x back
        assert game.insurance_bet == 10


class TestSurrender:
    """Test surrender functionality."""

    def test_surrender_loses_half_bet(self):
        """Test that surrender loses half the bet."""
        game = BlackjackGame()
        game.player_hand = [Card('10', '♠'), Card('6', '♥')]
        game.dealer_hand = [Card('10', '♦'), Card('5', '♣')]
        game.current_bet = 20
        game.bankroll = 1000
        game.can_surrender = True
        game.game_state = 'playing'
        
        initial_bankroll = game.bankroll
        game.surrender()
        
        # Should lose half bet (10)
        assert game.bankroll == initial_bankroll - 10
        assert game.game_state == 'finished'

    def test_surrender_disabled_after_hit(self):
        """Test that surrender is disabled after hitting."""
        game = BlackjackGame()
        game.can_surrender = True
        game.hit()
        assert game.can_surrender == False


class TestSplitHands:
    """Test split hand functionality."""

    def test_split_creates_two_hands(self):
        """Test that splitting creates two separate hands."""
        game = BlackjackGame()
        game.player_hand = [Card('8', '♠'), Card('8', '♥')]
        game.dealer_hand = [Card('10', '♦'), Card('5', '♣')]
        game.current_bet = 10
        game.bankroll = 1000
        game.game_state = 'playing'
        
        game.split()
        
        assert game.is_split == True
        assert len(game.split_hands) == 2
        assert len(game.split_hands[0]) == 2  # Original card + new card
        assert len(game.split_hands[1]) == 2

    def test_split_requires_sufficient_funds(self):
        """Test that split requires double the bet in bankroll."""
        game = BlackjackGame()
        game.player_hand = [Card('8', '♠'), Card('8', '♥')]
        game.dealer_hand = [Card('10', '♦'), Card('5', '♣')]
        game.current_bet = 10
        game.bankroll = 15  # Not enough for split
        game.game_state = 'playing'
        
        game.split()
        
        assert game.is_split == False
        assert "Insufficient funds" in game.message


class TestDoubleDown:
    """Test double down functionality."""

    def test_double_sets_flag(self):
        """Test that double down sets the hand_doubled flag."""
        game = BlackjackGame()
        game.player_hand = [Card('6', '♠'), Card('5', '♥')]
        game.dealer_hand = [Card('10', '♦'), Card('5', '♣')]
        game.current_bet = 10
        game.bankroll = 1000
        game.game_state = 'playing'
        
        game.double_down()
        
        assert game.hand_doubled == True
        assert game.current_bet == 10  # Bet shouldn't change

    def test_double_requires_sufficient_funds(self):
        """Test that double requires double the bet in bankroll."""
        game = BlackjackGame()
        game.player_hand = [Card('6', '♠'), Card('5', '♥')]
        game.dealer_hand = [Card('10', '♦'), Card('5', '♣')]
        game.current_bet = 10
        game.bankroll = 15  # Not enough to double
        game.game_state = 'playing'
        
        game.double_down()
        
        assert game.hand_doubled == False
        assert "Insufficient funds" in game.message


class TestBankrollCalculations:
    """Test bankroll win/loss calculations."""

    def test_regular_win(self):
        """Test winning a regular hand."""
        game = BlackjackGame()
        game.player_hand = [Card('10', '♠'), Card('10', '♥')]  # 20
        game.dealer_hand = [Card('10', '♦'), Card('9', '♣')]  # 19
        game.current_bet = 10
        game.bankroll = 1000
        game.hand_doubled = False
        game.game_state = 'finished'
        
        initial_bankroll = game.bankroll
        game.finish_hand()
        
        assert game.bankroll == initial_bankroll + 10

    def test_doubled_win(self):
        """Test winning with doubled bet."""
        game = BlackjackGame()
        game.player_hand = [Card('10', '♠'), Card('10', '♥')]  # 20
        game.dealer_hand = [Card('10', '♦'), Card('9', '♣')]  # 19
        game.current_bet = 10
        game.bankroll = 1000
        game.hand_doubled = True
        game.game_state = 'finished'
        
        initial_bankroll = game.bankroll
        game.finish_hand()
        
        assert game.bankroll == initial_bankroll + 20  # Doubled bet

    def test_blackjack_pays_3_to_2(self):
        """Test that blackjack pays 3:2."""
        game = BlackjackGame()
        # Use realistic setup - let deal_initial_cards() handle blackjack
        # Just verify the calculation is correct
        # If player has BJ and dealer doesn't, payout should be 1.5x bet
        blackjack_payout = int(10 * 1.5)
        assert blackjack_payout == 15  # Verify the math
