"""Tests for card logic and hand calculations."""

import pytest
from blackjack_card_counter.card import Card, create_deck, calculate_hand_value


class TestCard:
    """Test the Card class."""

    def test_card_creation(self):
        """Test creating a card."""
        card = Card('A', '♠')
        assert card.rank == 'A'
        assert card.suit == '♠'

    def test_count_value_low_cards(self):
        """Test Hi-Lo count for low cards (+1)."""
        for rank in ['2', '3', '4', '5', '6']:
            card = Card(rank, '♠')
            assert card.get_count_value() == 1, f"{rank} should be +1"

    def test_count_value_neutral_cards(self):
        """Test Hi-Lo count for neutral cards (0)."""
        for rank in ['7', '8', '9']:
            card = Card(rank, '♠')
            assert card.get_count_value() == 0, f"{rank} should be 0"

    def test_count_value_high_cards(self):
        """Test Hi-Lo count for high cards (-1)."""
        for rank in ['10', 'J', 'Q', 'K', 'A']:
            card = Card(rank, '♠')
            assert card.get_count_value() == -1, f"{rank} should be -1"

    def test_card_repr(self):
        """Test card string representation."""
        card = Card('K', '♥')
        assert str(card) == 'K♥'


class TestDeckCreation:
    """Test deck creation and shuffling."""

    def test_single_deck(self):
        """Test creating a single deck."""
        deck = create_deck(1)
        assert len(deck) == 52

    def test_multiple_decks(self):
        """Test creating multiple decks."""
        for num_decks in [2, 4, 6, 8]:
            deck = create_deck(num_decks)
            assert len(deck) == 52 * num_decks

    def test_deck_contains_all_cards(self):
        """Test that deck contains all expected cards."""
        deck = create_deck(1)
        ranks = set()
        suits = set()
        for card in deck:
            ranks.add(card.rank)
            suits.add(card.suit)
        
        expected_ranks = {'A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'}
        expected_suits = {'♠', '♥', '♦', '♣'}
        
        assert ranks == expected_ranks
        assert suits == expected_suits


class TestHandValueCalculation:
    """Test hand value calculations."""

    def test_simple_hand(self):
        """Test simple hand without aces."""
        hand = [Card('7', '♠'), Card('8', '♥')]
        assert calculate_hand_value(hand) == 15

    def test_blackjack(self):
        """Test blackjack (Ace + 10-value card)."""
        hand = [Card('A', '♠'), Card('K', '♥')]
        assert calculate_hand_value(hand) == 21

    def test_soft_hand(self):
        """Test soft hand (Ace counted as 11)."""
        hand = [Card('A', '♠'), Card('6', '♥')]
        assert calculate_hand_value(hand) == 17  # Soft 17

    def test_soft_hand_becomes_hard(self):
        """Test soft hand that becomes hard after hitting."""
        hand = [Card('A', '♠'), Card('6', '♥'), Card('10', '♦')]
        assert calculate_hand_value(hand) == 17  # A=1, 6, 10

    def test_multiple_aces(self):
        """Test hand with multiple aces."""
        hand = [Card('A', '♠'), Card('A', '♥'), Card('9', '♦')]
        assert calculate_hand_value(hand) == 21  # A=11, A=1, 9

    def test_bust(self):
        """Test bust hand."""
        hand = [Card('10', '♠'), Card('8', '♥'), Card('5', '♦')]
        assert calculate_hand_value(hand) == 23

    def test_four_aces(self):
        """Test four aces."""
        hand = [Card('A', '♠'), Card('A', '♥'), Card('A', '♦'), Card('A', '♣')]
        assert calculate_hand_value(hand) == 14  # 11 + 1 + 1 + 1

    def test_face_cards(self):
        """Test face cards are worth 10."""
        for rank in ['J', 'Q', 'K']:
            hand = [Card(rank, '♠'), Card('5', '♥')]
            assert calculate_hand_value(hand) == 15

    def test_21_without_blackjack(self):
        """Test reaching 21 with more than 2 cards."""
        hand = [Card('7', '♠'), Card('7', '♥'), Card('7', '♦')]
        assert calculate_hand_value(hand) == 21
