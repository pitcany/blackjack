"""Unit tests for basic strategy."""
import unittest
from src.card import Card, Hand, Suit
from src.strategy import BasicStrategy


class TestBasicStrategy(unittest.TestCase):
    """Test BasicStrategy class."""

    def setUp(self):
        """Set up test fixtures."""
        self.strategy = BasicStrategy()

    def test_hard_hand_strategies(self):
        """Test basic strategy for hard hands."""
        # Hard 16 vs dealer 10: Surrender or Hit
        hand = Hand()
        hand.add_card(Card('10', Suit.HEARTS))
        hand.add_card(Card('6', Suit.CLUBS))
        dealer_card = Card('10', Suit.SPADES)

        action = self.strategy.get_recommendation(
            hand, dealer_card, can_surrender=True
        )
        self.assertEqual(action, 'R')

        # Hard 17 vs dealer 2: Stand
        hand2 = Hand()
        hand2.add_card(Card('10', Suit.HEARTS))
        hand2.add_card(Card('7', Suit.CLUBS))
        dealer_card2 = Card('2', Suit.SPADES)

        action2 = self.strategy.get_recommendation(hand2, dealer_card2)
        self.assertEqual(action2, 'S')

        # Hard 11 vs dealer 10: Double
        hand3 = Hand()
        hand3.add_card(Card('6', Suit.HEARTS))
        hand3.add_card(Card('5', Suit.CLUBS))
        dealer_card3 = Card('10', Suit.SPADES)

        action3 = self.strategy.get_recommendation(hand3, dealer_card3)
        self.assertEqual(action3, 'D')

        # Hard 12 vs dealer 2: Hit
        hand4 = Hand()
        hand4.add_card(Card('10', Suit.HEARTS))
        hand4.add_card(Card('2', Suit.CLUBS))
        dealer_card4 = Card('2', Suit.SPADES)

        action4 = self.strategy.get_recommendation(hand4, dealer_card4)
        self.assertEqual(action4, 'H')

    def test_soft_hand_strategies(self):
        """Test basic strategy for soft hands."""
        # Soft 18 (A-7) vs dealer 9: Hit
        hand = Hand()
        hand.add_card(Card('A', Suit.SPADES))
        hand.add_card(Card('7', Suit.HEARTS))
        dealer_card = Card('9', Suit.CLUBS)

        action = self.strategy.get_recommendation(hand, dealer_card)
        self.assertEqual(action, 'H')

        # Soft 18 (A-7) vs dealer 6: Double or Stand
        dealer_card2 = Card('6', Suit.CLUBS)
        action2 = self.strategy.get_recommendation(
            hand, dealer_card2, can_double=True
        )
        self.assertEqual(action2, 'D')

        # Soft 19 (A-8) vs dealer 6: Stand (or Double on some tables)
        hand3 = Hand()
        hand3.add_card(Card('A', Suit.SPADES))
        hand3.add_card(Card('8', Suit.HEARTS))
        action3 = self.strategy.get_recommendation(hand3, dealer_card2)
        self.assertIn(action3, ['S', 'D'])

    def test_pair_strategies(self):
        """Test basic strategy for pairs."""
        # Always split Aces
        hand = Hand()
        hand.add_card(Card('A', Suit.SPADES))
        hand.add_card(Card('A', Suit.HEARTS))
        dealer_card = Card('10', Suit.CLUBS)

        action = self.strategy.get_recommendation(hand, dealer_card)
        self.assertEqual(action, 'P')

        # Always split 8s
        hand2 = Hand()
        hand2.add_card(Card('8', Suit.SPADES))
        hand2.add_card(Card('8', Suit.HEARTS))
        action2 = self.strategy.get_recommendation(hand2, dealer_card)
        self.assertIn(action2, ['P', 'R'])  # Split or Surrender vs 10

        # Never split 10s
        hand3 = Hand()
        hand3.add_card(Card('10', Suit.SPADES))
        hand3.add_card(Card('K', Suit.HEARTS))
        dealer_card3 = Card('6', Suit.CLUBS)

        action3 = self.strategy.get_recommendation(hand3, dealer_card3)
        self.assertEqual(action3, 'S')

        # Split 9s vs dealer 7: Stand
        hand4 = Hand()
        hand4.add_card(Card('9', Suit.SPADES))
        hand4.add_card(Card('9', Suit.HEARTS))
        dealer_card4 = Card('7', Suit.CLUBS)

        action4 = self.strategy.get_recommendation(hand4, dealer_card4)
        self.assertEqual(action4, 'S')

    def test_double_restrictions(self):
        """Test that strategy respects doubling restrictions."""
        # Soft 18 vs dealer 6: normally Double, but if can't double, Stand
        hand = Hand()
        hand.add_card(Card('A', Suit.SPADES))
        hand.add_card(Card('7', Suit.HEARTS))
        dealer_card = Card('6', Suit.CLUBS)

        action_can_double = self.strategy.get_recommendation(
            hand, dealer_card, can_double=True
        )
        self.assertEqual(action_can_double, 'D')

        action_cant_double = self.strategy.get_recommendation(
            hand, dealer_card, can_double=False
        )
        self.assertEqual(action_cant_double, 'S')

    def test_surrender_restrictions(self):
        """Test that strategy respects surrender restrictions."""
        # Hard 16 vs dealer 10: normally Surrender, but if can't surrender, Hit
        hand = Hand()
        hand.add_card(Card('10', Suit.HEARTS))
        hand.add_card(Card('6', Suit.CLUBS))
        dealer_card = Card('10', Suit.SPADES)

        action_can_surrender = self.strategy.get_recommendation(
            hand, dealer_card, can_surrender=True
        )
        self.assertEqual(action_can_surrender, 'R')

        action_cant_surrender = self.strategy.get_recommendation(
            hand, dealer_card, can_surrender=False
        )
        self.assertEqual(action_cant_surrender, 'H')

    def test_action_explanations(self):
        """Test action explanations."""
        hand = Hand()
        hand.add_card(Card('10', Suit.HEARTS))
        hand.add_card(Card('6', Suit.CLUBS))
        dealer_card = Card('10', Suit.SPADES)

        explanation = self.strategy.get_explanation('R', hand, dealer_card)
        self.assertIn("Surrender", explanation)
        self.assertIsInstance(explanation, str)

    def test_action_names(self):
        """Test action name conversion."""
        self.assertEqual(self.strategy.get_action_name('H'), 'Hit')
        self.assertEqual(self.strategy.get_action_name('S'), 'Stand')
        self.assertEqual(self.strategy.get_action_name('D'), 'Double Down')
        self.assertEqual(self.strategy.get_action_name('P'), 'Split')
        self.assertEqual(self.strategy.get_action_name('R'), 'Surrender')


if __name__ == '__main__':
    unittest.main()
