"""Unit tests for card and deck classes."""
import unittest
from src.card import Card, Deck, Hand, Suit


class TestCard(unittest.TestCase):
    """Test Card class."""

    def test_card_creation(self):
        """Test creating a card."""
        card = Card('A', Suit.SPADES)
        self.assertEqual(card.rank, 'A')
        self.assertEqual(card.suit, Suit.SPADES)

    def test_card_value(self):
        """Test card values."""
        # Number cards
        self.assertEqual(Card('2', Suit.HEARTS).value, 2)
        self.assertEqual(Card('10', Suit.CLUBS).value, 10)

        # Face cards
        self.assertEqual(Card('J', Suit.DIAMONDS).value, 10)
        self.assertEqual(Card('Q', Suit.HEARTS).value, 10)
        self.assertEqual(Card('K', Suit.SPADES).value, 10)

        # Ace (counted as 1, special handling in Hand)
        self.assertEqual(Card('A', Suit.CLUBS).value, 1)

    def test_count_value(self):
        """Test Hi-Lo count values."""
        # Low cards (2-6) = +1
        self.assertEqual(Card('2', Suit.HEARTS).count_value, 1)
        self.assertEqual(Card('6', Suit.CLUBS).count_value, 1)

        # Neutral cards (7-9) = 0
        self.assertEqual(Card('7', Suit.DIAMONDS).count_value, 0)
        self.assertEqual(Card('9', Suit.SPADES).count_value, 0)

        # High cards (10-A) = -1
        self.assertEqual(Card('10', Suit.HEARTS).count_value, -1)
        self.assertEqual(Card('K', Suit.CLUBS).count_value, -1)
        self.assertEqual(Card('A', Suit.DIAMONDS).count_value, -1)

    def test_invalid_rank(self):
        """Test invalid card rank."""
        with self.assertRaises(ValueError):
            Card('X', Suit.HEARTS)


class TestDeck(unittest.TestCase):
    """Test Deck class."""

    def test_deck_creation(self):
        """Test creating a deck."""
        deck = Deck(num_decks=1)
        self.assertEqual(len(deck.cards), 52)

        deck = Deck(num_decks=6)
        self.assertEqual(len(deck.cards), 312)

    def test_deal_card(self):
        """Test dealing cards."""
        deck = Deck(num_decks=1)
        initial_count = len(deck.cards)

        card = deck.deal_card()
        self.assertIsInstance(card, Card)
        self.assertEqual(len(deck.cards), initial_count - 1)
        self.assertEqual(len(deck.dealt_cards), 1)

    def test_decks_remaining(self):
        """Test decks remaining calculation."""
        deck = Deck(num_decks=6)
        self.assertAlmostEqual(deck.decks_remaining(), 6.0, places=1)

        # Deal 52 cards (1 deck)
        for _ in range(52):
            deck.deal_card()
        self.assertAlmostEqual(deck.decks_remaining(), 5.0, places=1)

    def test_needs_shuffle(self):
        """Test shuffle detection."""
        deck = Deck(num_decks=6)
        self.assertFalse(deck.needs_shuffle(penetration=0.75))

        # Deal 75% of cards
        cards_to_deal = int(312 * 0.75)
        for _ in range(cards_to_deal):
            deck.deal_card()
        self.assertTrue(deck.needs_shuffle(penetration=0.75))

    def test_reset(self):
        """Test deck reset."""
        deck = Deck(num_decks=1)

        # Deal some cards
        for _ in range(10):
            deck.deal_card()

        deck.reset()
        self.assertEqual(len(deck.cards), 52)
        self.assertEqual(len(deck.dealt_cards), 0)


class TestHand(unittest.TestCase):
    """Test Hand class."""

    def test_hand_creation(self):
        """Test creating a hand."""
        hand = Hand()
        self.assertEqual(len(hand.cards), 0)
        self.assertEqual(hand.bet, 0)

    def test_hard_hand_value(self):
        """Test hard hand values."""
        hand = Hand()
        hand.add_card(Card('7', Suit.HEARTS))
        hand.add_card(Card('9', Suit.CLUBS))

        soft, hard = hand.get_values()
        self.assertEqual(hard, 16)
        self.assertEqual(hand.get_value(), 16)
        self.assertFalse(hand.is_soft())

    def test_soft_hand_value(self):
        """Test soft hand values."""
        hand = Hand()
        hand.add_card(Card('A', Suit.SPADES))
        hand.add_card(Card('6', Suit.HEARTS))

        soft, hard = hand.get_values()
        self.assertEqual(soft, 17)  # A+6 = soft 17
        self.assertEqual(hard, 7)
        self.assertTrue(hand.is_soft())

    def test_soft_hand_becomes_hard(self):
        """Test soft hand becoming hard after hitting."""
        hand = Hand()
        hand.add_card(Card('A', Suit.SPADES))
        hand.add_card(Card('6', Suit.HEARTS))
        self.assertTrue(hand.is_soft())  # Soft 17

        hand.add_card(Card('9', Suit.CLUBS))
        self.assertFalse(hand.is_soft())  # Hard 16 (A now counts as 1)
        self.assertEqual(hand.get_value(), 16)

    def test_blackjack(self):
        """Test blackjack detection."""
        hand = Hand()
        hand.add_card(Card('A', Suit.SPADES))
        hand.add_card(Card('K', Suit.HEARTS))

        self.assertTrue(hand.is_blackjack())
        self.assertEqual(hand.get_value(), 21)

    def test_not_blackjack_with_three_cards(self):
        """Test that three cards totaling 21 is not blackjack."""
        hand = Hand()
        hand.add_card(Card('7', Suit.SPADES))
        hand.add_card(Card('7', Suit.HEARTS))
        hand.add_card(Card('7', Suit.CLUBS))

        self.assertFalse(hand.is_blackjack())
        self.assertEqual(hand.get_value(), 21)

    def test_bust(self):
        """Test bust detection."""
        hand = Hand()
        hand.add_card(Card('10', Suit.SPADES))
        hand.add_card(Card('K', Suit.HEARTS))
        hand.add_card(Card('5', Suit.CLUBS))

        self.assertTrue(hand.is_bust())
        self.assertEqual(hand.get_value(), 25)

    def test_pair_detection(self):
        """Test pair detection for splitting."""
        # Number pair
        hand = Hand()
        hand.add_card(Card('8', Suit.SPADES))
        hand.add_card(Card('8', Suit.HEARTS))
        self.assertTrue(hand.is_pair())

        # Face card pair (same value)
        hand2 = Hand()
        hand2.add_card(Card('K', Suit.SPADES))
        hand2.add_card(Card('Q', Suit.HEARTS))
        self.assertTrue(hand2.is_pair())  # Both value 10

        # Not a pair
        hand3 = Hand()
        hand3.add_card(Card('8', Suit.SPADES))
        hand3.add_card(Card('7', Suit.HEARTS))
        self.assertFalse(hand3.is_pair())


if __name__ == '__main__':
    unittest.main()
