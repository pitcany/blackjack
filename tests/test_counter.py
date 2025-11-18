"""Unit tests for card counting."""
import unittest
from src.card import Card, Deck, Suit
from src.counter import CardCounter


class TestCardCounter(unittest.TestCase):
    """Test CardCounter class."""

    def setUp(self):
        """Set up test fixtures."""
        self.deck = Deck(num_decks=6)
        self.counter = CardCounter(self.deck, base_bet=10)

    def test_counter_initialization(self):
        """Test counter initialization."""
        self.assertEqual(self.counter.running_count, 0)
        self.assertEqual(self.counter.base_bet, 10)

    def test_running_count_updates(self):
        """Test running count updates correctly."""
        # Low card (+1)
        self.counter.update(Card('5', Suit.HEARTS))
        self.assertEqual(self.counter.get_running_count(), 1)

        # Another low card (+1)
        self.counter.update(Card('6', Suit.CLUBS))
        self.assertEqual(self.counter.get_running_count(), 2)

        # Neutral card (0)
        self.counter.update(Card('8', Suit.DIAMONDS))
        self.assertEqual(self.counter.get_running_count(), 2)

        # High card (-1)
        self.counter.update(Card('K', Suit.SPADES))
        self.assertEqual(self.counter.get_running_count(), 1)

    def test_true_count_calculation(self):
        """Test true count calculation."""
        # With full shoe (6 decks), true count should be running count / 6
        self.counter.running_count = 12
        self.assertAlmostEqual(self.counter.get_true_count(), 2.0, places=1)

        # Deal 3 decks (156 cards)
        for _ in range(156):
            self.deck.deal_card()

        # Now 3 decks remaining, true count = 12 / 3 = 4
        self.assertAlmostEqual(self.counter.get_true_count(), 4.0, places=1)

    def test_reset(self):
        """Test counter reset."""
        self.counter.running_count = 10
        self.counter.reset()
        self.assertEqual(self.counter.get_running_count(), 0)

    def test_suggested_bet(self):
        """Test bet suggestion based on count."""
        # True count <= 1: bet minimum
        self.counter.running_count = 0
        self.assertEqual(self.counter.get_suggested_bet(), 10)

        # True count = 2: bet 2x
        self.counter.running_count = 12  # TC = 2
        suggested = self.counter.get_suggested_bet()
        self.assertEqual(suggested, 20)

        # True count = 3: bet 3x
        self.counter.running_count = 18  # TC = 3
        suggested = self.counter.get_suggested_bet()
        self.assertEqual(suggested, 30)

    def test_suggested_bet_limits(self):
        """Test bet suggestions respect min/max."""
        # Very negative count: should return min_bet
        self.counter.running_count = -30
        self.assertEqual(self.counter.get_suggested_bet(min_bet=10), 10)

        # Very positive count: should cap at max_bet
        self.counter.running_count = 100
        self.assertLessEqual(
            self.counter.get_suggested_bet(min_bet=10, max_bet=50),
            50
        )

    def test_advantage_estimation(self):
        """Test player advantage estimation."""
        # True count of 2 = ~1% advantage
        self.counter.running_count = 12  # TC = 2
        self.assertAlmostEqual(self.counter.get_advantage(), 1.0, places=1)

        # True count of -2 = ~-1% advantage
        self.counter.running_count = -12  # TC = -2
        self.assertAlmostEqual(self.counter.get_advantage(), -1.0, places=1)

    def test_count_status(self):
        """Test count status descriptions."""
        # Very unfavorable
        self.counter.running_count = -18  # TC = -3
        status = self.counter.get_count_status()
        self.assertIn("Unfavorable", status)

        # Neutral
        self.counter.running_count = 0
        status = self.counter.get_count_status()
        self.assertIn("Neutral", status)

        # Favorable
        self.counter.running_count = 18  # TC = 3
        status = self.counter.get_count_status()
        self.assertIn("Favorable", status)


if __name__ == '__main__':
    unittest.main()
