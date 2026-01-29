"""Tests for hand calculations."""

import pytest
from blackjack import Card, Rank, Suit
from blackjack.hand import best_total_and_soft, is_blackjack, is_bust, can_split, format_hand


class TestBestTotalAndSoft:
    """Tests for best_total_and_soft function."""
    
    def test_empty_hand(self):
        """Empty hand should return 0."""
        total, is_soft = best_total_and_soft([])
        assert total == 0
        assert is_soft is False
    
    def test_simple_hand(self):
        """Two number cards."""
        cards = [
            Card(Rank.FIVE, Suit.HEARTS),
            Card(Rank.SEVEN, Suit.SPADES)
        ]
        total, is_soft = best_total_and_soft(cards)
        assert total == 12
        assert is_soft is False
    
    def test_soft_hand_with_ace(self):
        """Ace + low card = soft hand."""
        cards = [
            Card(Rank.ACE, Suit.HEARTS),
            Card(Rank.SIX, Suit.SPADES)
        ]
        total, is_soft = best_total_and_soft(cards)
        assert total == 17
        assert is_soft is True
    
    def test_hard_hand_with_ace(self):
        """Ace must count as 1 to avoid bust."""
        cards = [
            Card(Rank.ACE, Suit.HEARTS),
            Card(Rank.EIGHT, Suit.SPADES),
            Card(Rank.SEVEN, Suit.CLUBS)
        ]
        total, is_soft = best_total_and_soft(cards)
        assert total == 16  # 1 + 8 + 7
        assert is_soft is False
    
    def test_multiple_aces(self):
        """Multiple aces adjust properly."""
        cards = [
            Card(Rank.ACE, Suit.HEARTS),
            Card(Rank.ACE, Suit.SPADES),
            Card(Rank.NINE, Suit.CLUBS)
        ]
        total, is_soft = best_total_and_soft(cards)
        assert total == 21  # 11 + 1 + 9
        assert is_soft is True
    
    def test_three_aces(self):
        """Three aces = 13 (11 + 1 + 1)."""
        cards = [
            Card(Rank.ACE, Suit.HEARTS),
            Card(Rank.ACE, Suit.SPADES),
            Card(Rank.ACE, Suit.CLUBS)
        ]
        total, is_soft = best_total_and_soft(cards)
        assert total == 13  # 11 + 1 + 1
        assert is_soft is True
    
    def test_face_cards(self):
        """Face cards all count as 10."""
        cards = [
            Card(Rank.KING, Suit.HEARTS),
            Card(Rank.QUEEN, Suit.SPADES)
        ]
        total, is_soft = best_total_and_soft(cards)
        assert total == 20
        assert is_soft is False
    
    def test_bust_hand(self):
        """Hand that busts."""
        cards = [
            Card(Rank.KING, Suit.HEARTS),
            Card(Rank.QUEEN, Suit.SPADES),
            Card(Rank.FIVE, Suit.CLUBS)
        ]
        total, is_soft = best_total_and_soft(cards)
        assert total == 25
        assert is_soft is False


class TestIsBlackjack:
    """Tests for is_blackjack function."""
    
    def test_ace_ten_blackjack(self):
        """Ace + 10 = blackjack."""
        cards = [
            Card(Rank.ACE, Suit.HEARTS),
            Card(Rank.TEN, Suit.SPADES)
        ]
        assert is_blackjack(cards) is True
    
    def test_ace_king_blackjack(self):
        """Ace + King = blackjack."""
        cards = [
            Card(Rank.ACE, Suit.HEARTS),
            Card(Rank.KING, Suit.SPADES)
        ]
        assert is_blackjack(cards) is True
    
    def test_not_blackjack_three_cards(self):
        """Three cards totaling 21 is not blackjack."""
        cards = [
            Card(Rank.SEVEN, Suit.HEARTS),
            Card(Rank.SEVEN, Suit.SPADES),
            Card(Rank.SEVEN, Suit.CLUBS)
        ]
        assert is_blackjack(cards) is False
    
    def test_not_blackjack_not_21(self):
        """Two cards not totaling 21."""
        cards = [
            Card(Rank.TEN, Suit.HEARTS),
            Card(Rank.NINE, Suit.SPADES)
        ]
        assert is_blackjack(cards) is False


class TestIsBust:
    """Tests for is_bust function."""
    
    def test_not_bust(self):
        """Hand under 21 is not bust."""
        cards = [
            Card(Rank.TEN, Suit.HEARTS),
            Card(Rank.TEN, Suit.SPADES)
        ]
        assert is_bust(cards) is False
    
    def test_exactly_21(self):
        """21 is not bust."""
        cards = [
            Card(Rank.ACE, Suit.HEARTS),
            Card(Rank.TEN, Suit.SPADES)
        ]
        assert is_bust(cards) is False
    
    def test_bust(self):
        """Over 21 is bust."""
        cards = [
            Card(Rank.TEN, Suit.HEARTS),
            Card(Rank.TEN, Suit.SPADES),
            Card(Rank.FIVE, Suit.CLUBS)
        ]
        assert is_bust(cards) is True


class TestCanSplit:
    """Tests for can_split function."""
    
    def test_can_split_same_rank(self):
        """Two cards of same rank can split."""
        cards = [
            Card(Rank.EIGHT, Suit.HEARTS),
            Card(Rank.EIGHT, Suit.SPADES)
        ]
        assert can_split(cards) is True
    
    def test_cannot_split_different_rank(self):
        """Different ranks cannot split by default."""
        cards = [
            Card(Rank.TEN, Suit.HEARTS),
            Card(Rank.KING, Suit.SPADES)
        ]
        assert can_split(cards) is False
    
    def test_can_split_by_value(self):
        """Same value can split when allowed."""
        cards = [
            Card(Rank.TEN, Suit.HEARTS),
            Card(Rank.KING, Suit.SPADES)
        ]
        assert can_split(cards, allow_by_value=True) is True
    
    def test_cannot_split_three_cards(self):
        """Three cards cannot split."""
        cards = [
            Card(Rank.EIGHT, Suit.HEARTS),
            Card(Rank.EIGHT, Suit.SPADES),
            Card(Rank.FIVE, Suit.CLUBS)
        ]
        assert can_split(cards) is False


class TestFormatHand:
    """Tests for format_hand function."""
    
    def test_format_simple(self):
        """Format a simple hand."""
        cards = [
            Card(Rank.KING, Suit.HEARTS),
            Card(Rank.SEVEN, Suit.SPADES)
        ]
        result = format_hand(cards)
        assert "K♥" in result
        assert "7♠" in result
        assert "17" in result
    
    def test_format_soft(self):
        """Format a soft hand shows soft indicator."""
        cards = [
            Card(Rank.ACE, Suit.HEARTS),
            Card(Rank.SIX, Suit.SPADES)
        ]
        result = format_hand(cards)
        assert "soft" in result.lower()
    
    def test_format_empty(self):
        """Format empty hand."""
        result = format_hand([])
        assert "Empty" in result
