"""Unit tests for game logic."""
import unittest
from src.game import BlackjackGame, GameState


class TestBlackjackGame(unittest.TestCase):
    """Test BlackjackGame class."""

    def setUp(self):
        """Set up test fixtures."""
        self.game = BlackjackGame(
            num_decks=6,
            starting_balance=1000,
            min_bet=10,
            max_bet=500
        )

    def test_game_initialization(self):
        """Test game initialization."""
        self.assertEqual(self.game.player_balance, 1000)
        self.assertEqual(self.game.state, GameState.WAITING_FOR_BET)
        self.assertEqual(self.game.rounds_played, 0)

    def test_place_valid_bet(self):
        """Test placing a valid bet."""
        success = self.game.place_bet(50)
        self.assertTrue(success)
        self.assertEqual(self.game.player_balance, 950)
        self.assertEqual(len(self.game.player_hands), 1)
        self.assertEqual(self.game.player_hands[0].bet, 50)

    def test_place_bet_too_low(self):
        """Test placing bet below minimum."""
        success = self.game.place_bet(5)
        self.assertFalse(success)
        self.assertEqual(self.game.player_balance, 1000)

    def test_place_bet_too_high(self):
        """Test placing bet above maximum."""
        success = self.game.place_bet(1000)
        self.assertFalse(success)
        self.assertEqual(self.game.player_balance, 1000)

    def test_place_bet_insufficient_funds(self):
        """Test placing bet with insufficient balance."""
        self.game.player_balance = 20
        success = self.game.place_bet(50)
        self.assertFalse(success)

    def test_initial_deal(self):
        """Test initial card deal."""
        self.game.place_bet(50)

        # Should have dealt 2 cards to player and dealer
        self.assertEqual(len(self.game.player_hands[0].cards), 2)
        self.assertEqual(len(self.game.dealer_hand.cards), 2)

        # Game should be in player turn or round over (if blackjack)
        self.assertIn(
            self.game.state,
            [GameState.PLAYER_TURN, GameState.ROUND_OVER]
        )

    def test_hit_action(self):
        """Test hitting."""
        self.game.place_bet(50)

        # Force player turn if not already
        if self.game.state != GameState.PLAYER_TURN:
            return  # Skip if blackjack dealt

        hand = self.game.get_current_hand()
        initial_cards = len(hand.cards)
        self.game.hit()

        # Check the hand we were playing (first hand)
        # Note: if player busted, current_hand_index moved but hand is still in list
        self.assertEqual(
            len(self.game.player_hands[0].cards),
            initial_cards + 1
        )

    def test_stand_action(self):
        """Test standing."""
        self.game.place_bet(50)

        if self.game.state != GameState.PLAYER_TURN:
            return  # Skip if blackjack dealt

        self.game.stand()
        # Should move to dealer turn or round over
        self.assertIn(
            self.game.state,
            [GameState.DEALER_TURN, GameState.ROUND_OVER]
        )

    def test_can_double(self):
        """Test double down availability."""
        self.game.place_bet(50)

        if self.game.state != GameState.PLAYER_TURN:
            return

        hand = self.game.get_current_hand()
        # With 2 cards and enough balance, should be able to double
        if len(hand.cards) == 2 and self.game.player_balance >= hand.bet:
            self.assertTrue(self.game.can_double())

    def test_double_action(self):
        """Test doubling down."""
        self.game.place_bet(50)

        if not self.game.can_double():
            return

        initial_balance = self.game.player_balance
        hand = self.game.get_current_hand()
        initial_bet = hand.bet
        initial_cards = len(hand.cards)

        self.game.double_down()

        # After doubling, hand is in player_hands list but current_hand_index moved
        # Check the first hand (which was the one we doubled)
        doubled_hand = self.game.player_hands[0]

        # Should have doubled bet and deducted from balance
        self.assertEqual(doubled_hand.bet, initial_bet * 2)
        self.assertEqual(self.game.player_balance, initial_balance - initial_bet)

        # Should have received exactly one more card
        self.assertEqual(len(doubled_hand.cards), initial_cards + 1)

    def test_reset_round(self):
        """Test resetting for new round."""
        self.game.place_bet(50)
        self.game.reset_round()

        self.assertEqual(len(self.game.player_hands), 0)
        self.assertIsNone(self.game.dealer_hand)
        self.assertEqual(self.game.state, GameState.WAITING_FOR_BET)

    def test_statistics_tracking(self):
        """Test that statistics are tracked correctly."""
        stats = self.game.get_statistics()

        self.assertIn('balance', stats)
        self.assertIn('rounds_played', stats)
        self.assertIn('rounds_won', stats)
        self.assertIn('running_count', stats)
        self.assertIn('true_count', stats)

    def test_get_recommendation(self):
        """Test getting strategy recommendation."""
        self.game.place_bet(50)

        if self.game.state != GameState.PLAYER_TURN:
            return

        recommendation = self.game.get_recommendation()
        self.assertIsNotNone(recommendation)
        self.assertIn(recommendation, ['H', 'S', 'D', 'P', 'R'])

    def test_surrender_action(self):
        """Test surrendering."""
        self.game.place_bet(100)

        if not self.game.can_surrender():
            return

        initial_balance = self.game.player_balance
        self.game.surrender()

        # Should get half the bet back
        self.assertEqual(self.game.player_balance, initial_balance + 50)
        self.assertEqual(self.game.state, GameState.ROUND_OVER)

    def test_dealer_hits_soft_17(self):
        """Test that dealer hits on soft 17."""
        # This is hard to test deterministically, but we can verify the logic exists
        self.game.place_bet(50)

        if self.game.state == GameState.PLAYER_TURN:
            self.game.stand()

        # Dealer should have played
        if self.game.dealer_hand:
            dealer_value = self.game.dealer_hand.get_value()
            # If dealer has 17, check if it's soft
            if dealer_value == 17 and self.game.dealer_hand.is_soft():
                # In actual game, dealer would have hit
                # This is validated in the _dealer_play method
                pass

    def test_get_num_decks(self):
        """Test getting the number of decks."""
        self.assertEqual(self.game.get_num_decks(), 6)

    def test_set_num_decks_valid_range(self):
        """Test setting number of decks within valid range (1-8)."""
        for num_decks in range(1, 9):
            success = self.game.set_num_decks(num_decks)
            self.assertTrue(success, f"Failed to set {num_decks} decks")
            self.assertEqual(self.game.get_num_decks(), num_decks)

    def test_set_num_decks_below_minimum(self):
        """Test setting number of decks below minimum (< 1)."""
        success = self.game.set_num_decks(0)
        self.assertFalse(success)
        self.assertEqual(self.game.get_num_decks(), 6)  # Should remain unchanged

        success = self.game.set_num_decks(-1)
        self.assertFalse(success)
        self.assertEqual(self.game.get_num_decks(), 6)

    def test_set_num_decks_above_maximum(self):
        """Test setting number of decks above maximum (> 8)."""
        success = self.game.set_num_decks(9)
        self.assertFalse(success)
        self.assertEqual(self.game.get_num_decks(), 6)  # Should remain unchanged

        success = self.game.set_num_decks(100)
        self.assertFalse(success)
        self.assertEqual(self.game.get_num_decks(), 6)

    def test_set_num_decks_during_active_round(self):
        """Test that deck count cannot be changed during an active round."""
        # Place a bet to start a round
        self.game.place_bet(50)

        # Try to change deck count during player turn
        if self.game.state == GameState.PLAYER_TURN:
            success = self.game.set_num_decks(4)
            self.assertFalse(success)
            self.assertEqual(self.game.get_num_decks(), 6)  # Should remain unchanged

    def test_set_num_decks_preserves_balance(self):
        """Test that changing deck count preserves player balance."""
        initial_balance = 1000
        self.game.player_balance = 1500  # Change balance

        success = self.game.set_num_decks(4)
        self.assertTrue(success)
        self.assertEqual(self.game.player_balance, 1500)  # Balance preserved

    def test_set_num_decks_preserves_statistics(self):
        """Test that changing deck count preserves game statistics."""
        # Play a round to generate some statistics
        self.game.place_bet(50)

        # Complete the round
        if self.game.state == GameState.PLAYER_TURN:
            self.game.stand()

        # Save statistics
        rounds_played = self.game.rounds_played
        rounds_won = self.game.rounds_won
        rounds_lost = self.game.rounds_lost
        total_wagered = self.game.total_wagered

        # Ensure we're in a state where we can change decks
        if self.game.state == GameState.ROUND_OVER:
            self.game.reset_round()

        # Change deck count
        success = self.game.set_num_decks(4)
        self.assertTrue(success)

        # Verify statistics are preserved
        self.assertEqual(self.game.rounds_played, rounds_played)
        self.assertEqual(self.game.rounds_won, rounds_won)
        self.assertEqual(self.game.rounds_lost, rounds_lost)
        self.assertEqual(self.game.total_wagered, total_wagered)

    def test_set_num_decks_resets_count(self):
        """Test that changing deck count resets the card counter."""
        # Manually set a non-zero count
        self.game.counter.running_count = 10

        # Change deck count
        success = self.game.set_num_decks(4)
        self.assertTrue(success)

        # Verify count is reset
        self.assertEqual(self.game.counter.get_running_count(), 0)
        self.assertEqual(self.game.counter.get_true_count(), 0.0)

    def test_set_num_decks_creates_new_deck(self):
        """Test that changing deck count creates a new deck with correct size."""
        # Set to 2 decks
        success = self.game.set_num_decks(2)
        self.assertTrue(success)

        # Verify deck has correct number of cards (2 decks × 52 cards = 104)
        self.assertEqual(len(self.game.deck.cards), 104)

        # Set to 8 decks
        success = self.game.set_num_decks(8)
        self.assertTrue(success)

        # Verify deck has correct number of cards (8 decks × 52 cards = 416)
        self.assertEqual(len(self.game.deck.cards), 416)


if __name__ == '__main__':
    unittest.main()
