"""Unit tests for advanced features."""
import unittest
import os
import json
from src.card import Card, Deck, Hand, Suit
from src.game import BlackjackGame
from src.advanced_counter import AdvancedCounter, CountingSystem, DeviationIndices
from src.persistence import GamePersistence


class TestAdvancedCounter(unittest.TestCase):
    """Test AdvancedCounter class."""

    def setUp(self):
        """Set up test fixtures."""
        self.deck = Deck(num_decks=6)

    def test_hilo_system(self):
        """Test Hi-Lo counting system."""
        counter = AdvancedCounter(self.deck, system=CountingSystem.HI_LO)

        counter.update(Card('5', Suit.HEARTS))
        self.assertEqual(counter.get_running_count(), 1)

        counter.update(Card('10', Suit.CLUBS))
        self.assertEqual(counter.get_running_count(), 0)

    def test_ko_system(self):
        """Test KO (Knock-Out) counting system."""
        counter = AdvancedCounter(self.deck, system=CountingSystem.KO)

        # KO starts at IRC (-4 * num_decks)
        initial_count = counter.get_running_count()
        self.assertEqual(initial_count, -24)  # -4 * 6

        # 7 is +1 in KO (but 0 in Hi-Lo)
        counter.update(Card('7', Suit.HEARTS))
        self.assertEqual(counter.get_running_count(), initial_count + 1)

    def test_omega2_system(self):
        """Test Omega II counting system."""
        counter = AdvancedCounter(self.deck, system=CountingSystem.OMEGA_II)

        # 4,5,6 are +2 in Omega II
        counter.update(Card('4', Suit.HEARTS))
        self.assertEqual(counter.get_running_count(), 2)

        # 9 is -1 in Omega II
        counter.update(Card('9', Suit.CLUBS))
        self.assertEqual(counter.get_running_count(), 1)

        # Ace is 0 in Omega II
        counter.update(Card('A', Suit.SPADES))
        self.assertEqual(counter.get_running_count(), 1)

    def test_system_switching(self):
        """Test switching between counting systems."""
        counter_hilo = AdvancedCounter(self.deck, system=CountingSystem.HI_LO)
        counter_ko = AdvancedCounter(self.deck, system=CountingSystem.KO)

        # Test that systems give different counts for same card
        card = Card('7', Suit.HEARTS)

        initial_hilo = counter_hilo.get_running_count()
        counter_hilo.update(card)
        self.assertEqual(counter_hilo.get_running_count(), initial_hilo)  # 7 is 0 in Hi-Lo

        initial_ko = counter_ko.get_running_count()
        counter_ko.update(card)
        self.assertEqual(counter_ko.get_running_count(), initial_ko + 1)  # 7 is +1 in KO

    def test_advantage_calculation(self):
        """Test advantage calculation for different systems."""
        counter = AdvancedCounter(self.deck, system=CountingSystem.HI_LO)

        # Set up a favorable count
        counter.running_count = 12  # TC = 2
        advantage = counter.get_advantage()
        self.assertAlmostEqual(advantage, 1.0, places=1)  # ~1% advantage

    def test_system_names(self):
        """Test getting system names."""
        counter_hilo = AdvancedCounter(self.deck, system=CountingSystem.HI_LO)
        self.assertEqual(counter_hilo.get_system_name(), "Hi-Lo")

        counter_ko = AdvancedCounter(self.deck, system=CountingSystem.KO)
        self.assertEqual(counter_ko.get_system_name(), "Knock-Out (KO)")


class TestDeviationIndices(unittest.TestCase):
    """Test DeviationIndices class."""

    def test_illustrious_18_deviation(self):
        """Test basic deviation from Illustrious 18."""
        # 16 vs 10: Basic strategy says surrender/hit, but stand at TC 0+
        hand = Hand()
        hand.add_card(Card('10', Suit.HEARTS))
        hand.add_card(Card('6', Suit.CLUBS))
        dealer_card = Card('10', Suit.SPADES)

        # At TC 0 or higher, should deviate to stand
        deviation = DeviationIndices.get_deviation(
            hand, dealer_card, true_count=0.0, basic_action='H'
        )
        self.assertEqual(deviation, 'S')  # Deviate to Stand

        # Below TC 0, should follow basic strategy
        deviation = DeviationIndices.get_deviation(
            hand, dealer_card, true_count=-1.0, basic_action='H'
        )
        self.assertEqual(deviation, 'H')  # Follow basic strategy

    def test_double_deviation(self):
        """Test doubling deviation."""
        # 11 vs A: Basic says hit, double at TC +1
        hand = Hand()
        hand.add_card(Card('6', Suit.HEARTS))
        hand.add_card(Card('5', Suit.CLUBS))
        dealer_card = Card('A', Suit.SPADES)

        # At TC +1 or higher, should deviate to double
        deviation = DeviationIndices.get_deviation(
            hand, dealer_card, true_count=1.0, basic_action='H'
        )
        self.assertEqual(deviation, 'D')

        # Below TC +1, follow basic strategy
        deviation = DeviationIndices.get_deviation(
            hand, dealer_card, true_count=0.0, basic_action='H'
        )
        self.assertEqual(deviation, 'H')

    def test_fab_four_surrenders(self):
        """Test Fab Four surrender deviations."""
        # 15 vs 10: Surrender at TC 0+
        hand = Hand()
        hand.add_card(Card('10', Suit.HEARTS))
        hand.add_card(Card('5', Suit.CLUBS))
        dealer_card = Card('10', Suit.SPADES)

        surrender = DeviationIndices.get_fab_four(hand, dealer_card, true_count=0.0)
        self.assertEqual(surrender, 'R')

        # Below TC 0, don't surrender
        surrender = DeviationIndices.get_fab_four(hand, dealer_card, true_count=-1.0)
        self.assertIsNone(surrender)

    def test_insurance_decision(self):
        """Test insurance decision based on count."""
        # Should take insurance at TC +3 or higher
        self.assertTrue(DeviationIndices.should_take_insurance(3.0))
        self.assertTrue(DeviationIndices.should_take_insurance(4.5))

        # Should not take insurance below TC +3
        self.assertFalse(DeviationIndices.should_take_insurance(2.5))
        self.assertFalse(DeviationIndices.should_take_insurance(0.0))


class TestGamePersistence(unittest.TestCase):
    """Test GamePersistence class."""

    def setUp(self):
        """Set up test fixtures."""
        self.game = BlackjackGame()
        # Play a few rounds to generate statistics
        self.game.place_bet(50)
        self.game.reset_round()

    def tearDown(self):
        """Clean up test files."""
        # Remove test save files
        if os.path.exists(GamePersistence.SAVE_DIR):
            for filename in os.listdir(GamePersistence.SAVE_DIR):
                if filename.startswith('test_'):
                    filepath = os.path.join(GamePersistence.SAVE_DIR, filename)
                    os.remove(filepath)

    def test_save_game(self):
        """Test saving game state."""
        filepath = GamePersistence.save_game(self.game, filename="test_save.json")
        self.assertTrue(os.path.exists(filepath))

        # Verify JSON structure
        with open(filepath, 'r') as f:
            data = json.load(f)

        self.assertIn('version', data)
        self.assertIn('game_config', data)
        self.assertIn('player_state', data)
        self.assertIn('statistics', data)

    def test_load_game(self):
        """Test loading game state."""
        # Save first
        filepath = GamePersistence.save_game(self.game, filename="test_load.json")

        # Load
        game_state = GamePersistence.load_game(filepath)

        self.assertIsInstance(game_state, dict)
        self.assertEqual(game_state['version'], '1.0')

    def test_restore_game(self):
        """Test restoring game from saved state."""
        # Modify game state
        self.game.player_balance = 1500
        self.game.rounds_won = 10

        # Save
        filepath = GamePersistence.save_game(self.game, filename="test_restore.json")

        # Create new game and restore
        new_game = BlackjackGame()
        game_state = GamePersistence.load_game(filepath)
        GamePersistence.restore_game(new_game, game_state)

        self.assertEqual(new_game.player_balance, 1500)
        self.assertEqual(new_game.rounds_won, 10)

    def test_list_saves(self):
        """Test listing saved games."""
        # Create a few saves
        GamePersistence.save_game(self.game, filename="test_save1.json")
        GamePersistence.save_game(self.game, filename="test_save2.json")

        saves = GamePersistence.list_saves()
        save_filenames = [s[0] for s in saves]

        self.assertIn("test_save1.json", save_filenames)
        self.assertIn("test_save2.json", save_filenames)

    def test_export_csv(self):
        """Test CSV export."""
        filepath = GamePersistence.export_statistics_csv(
            self.game, filepath="test_stats.csv"
        )

        self.assertTrue(os.path.exists(filepath))

        # Verify CSV has content
        with open(filepath, 'r') as f:
            content = f.read()

        self.assertIn('Blackjack Session Statistics', content)
        self.assertIn('Balance', content)
        self.assertIn('Rounds Played', content)

        # Clean up
        os.remove(filepath)


if __name__ == '__main__':
    unittest.main()
