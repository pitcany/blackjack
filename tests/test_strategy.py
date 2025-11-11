"""Tests for strategy calculations."""

import pytest
from blackjack_card_counter.card import Card
from blackjack_card_counter.strategy import (
    get_true_count,
    get_betting_advice,
    get_basic_strategy
)


class TestTrueCount:
    """Test true count calculations."""

    def test_true_count_beginning_of_shoe(self):
        """Test true count at beginning of shoe."""
        assert get_true_count(6, 0, 6) == 1  # 6 / 6 decks

    def test_true_count_after_one_deck(self):
        """Test true count after one deck dealt."""
        assert get_true_count(10, 52, 6) == 2  # 10 / 5 decks

    def test_true_count_negative(self):
        """Test negative true count."""
        assert get_true_count(-12, 52, 6) == -2

    def test_true_count_zero(self):
        """Test zero true count."""
        assert get_true_count(0, 52, 6) == 0

    def test_true_count_end_of_shoe(self):
        """Test true count near end of shoe."""
        # With 1 deck remaining (52 cards), running count of 8
        assert get_true_count(8, 260, 6) == 8  # 8 / 1 deck

    def test_true_count_rounding(self):
        """Test that true count rounds correctly."""
        # 5 / 2 = 2.5, should round to 2 or 3
        result = get_true_count(5, 208, 6)  # 4 decks dealt, 2 remaining
        assert result in [2, 3]


class TestBettingAdvice:
    """Test betting advice based on true count."""

    def test_betting_negative_count(self):
        """Test betting advice for negative count."""
        units, advice = get_betting_advice(-5)
        assert units == 1
        assert "Minimum bet" in advice

    def test_betting_zero_count(self):
        """Test betting advice for zero count."""
        units, advice = get_betting_advice(0)
        assert units == 1
        assert "Minimum bet" in advice

    def test_betting_plus_one(self):
        """Test betting advice for +1 count."""
        units, advice = get_betting_advice(1)
        assert units == 2
        assert "Slight advantage" in advice

    def test_betting_plus_two(self):
        """Test betting advice for +2 count."""
        units, advice = get_betting_advice(2)
        assert units == 4
        assert "Good advantage" in advice

    def test_betting_plus_three(self):
        """Test betting advice for +3 count."""
        units, advice = get_betting_advice(3)
        assert units == 6
        assert "Strong advantage" in advice

    def test_betting_plus_four_or_more(self):
        """Test betting advice for +4 or higher count."""
        units, advice = get_betting_advice(4)
        assert units == 8
        assert "Excellent advantage" in advice

        units, advice = get_betting_advice(10)
        assert units == 8


class TestBasicStrategy:
    """Test basic strategy recommendations."""

    def test_player_blackjack(self):
        """Test strategy when player has blackjack."""
        player = [Card('A', '♠'), Card('K', '♥')]
        dealer = [Card('7', '♦'), Card('10', '♣')]
        # Player should stand on 21
        assert get_basic_strategy(player, dealer) == "STAND"

    def test_hard_17_or_more(self):
        """Test standing on hard 17+."""
        player = [Card('10', '♠'), Card('7', '♥')]
        dealer = [Card('10', '♦'), Card('5', '♣')]
        assert get_basic_strategy(player, dealer) == "STAND"

    def test_hard_16_vs_dealer_low(self):
        """Test hard 16 vs dealer 2-6 (should stand)."""
        player = [Card('10', '♠'), Card('6', '♥')]
        for dealer_rank in ['2', '3', '4', '5', '6']:
            dealer = [Card(dealer_rank, '♦'), Card('10', '♣')]
            assert get_basic_strategy(player, dealer) == "STAND"

    def test_hard_16_vs_dealer_high(self):
        """Test hard 16 vs dealer 7+ (should hit)."""
        player = [Card('10', '♠'), Card('6', '♥')]
        for dealer_rank in ['7', '8', '9', '10', 'A']:
            dealer = [Card(dealer_rank, '♦'), Card('10', '♣')]
            assert get_basic_strategy(player, dealer) == "HIT"

    def test_hard_12_vs_dealer_4_through_6(self):
        """Test hard 12 vs dealer 4-6 (should stand)."""
        player = [Card('10', '♠'), Card('2', '♥')]
        for dealer_rank in ['4', '5', '6']:
            dealer = [Card(dealer_rank, '♦'), Card('10', '♣')]
            assert get_basic_strategy(player, dealer) == "STAND"

    def test_hard_11_double(self):
        """Test doubling on 11."""
        player = [Card('6', '♠'), Card('5', '♥')]
        dealer = [Card('7', '♦'), Card('10', '♣')]
        assert get_basic_strategy(player, dealer) == "DOUBLE"

    def test_hard_11_hit_after_third_card(self):
        """Test hitting on 11 with 3+ cards."""
        player = [Card('6', '♠'), Card('3', '♥'), Card('2', '♦')]
        dealer = [Card('7', '♦'), Card('10', '♣')]
        assert get_basic_strategy(player, dealer) == "HIT"

    def test_soft_19_stand(self):
        """Test standing on soft 19."""
        player = [Card('A', '♠'), Card('8', '♥')]
        dealer = [Card('10', '♦'), Card('5', '♣')]
        assert get_basic_strategy(player, dealer) == "STAND"

    def test_soft_18_vs_dealer_high(self):
        """Test soft 18 vs dealer 9+ (should hit)."""
        player = [Card('A', '♠'), Card('7', '♥')]
        for dealer_rank in ['9', '10', 'A']:
            dealer = [Card(dealer_rank, '♦'), Card('10', '♣')]
            assert get_basic_strategy(player, dealer) == "HIT"

    def test_soft_18_vs_dealer_low_double(self):
        """Test soft 18 vs dealer 2-6 (should double if 2 cards)."""
        player = [Card('A', '♠'), Card('7', '♥')]
        dealer = [Card('5', '♦'), Card('10', '♣')]
        assert get_basic_strategy(player, dealer) == "DOUBLE"

    def test_split_aces(self):
        """Test always split aces."""
        player = [Card('A', '♠'), Card('A', '♥')]
        dealer = [Card('10', '♦'), Card('5', '♣')]
        assert get_basic_strategy(player, dealer) == "SPLIT"

    def test_split_eights(self):
        """Test always split eights."""
        player = [Card('8', '♠'), Card('8', '♥')]
        dealer = [Card('10', '♦'), Card('5', '♣')]
        assert get_basic_strategy(player, dealer) == "SPLIT"

    def test_never_split_tens(self):
        """Test never split tens."""
        player = [Card('10', '♠'), Card('10', '♥')]
        dealer = [Card('6', '♦'), Card('5', '♣')]
        assert get_basic_strategy(player, dealer) == "STAND"

    def test_no_split_after_split(self):
        """Test that split is not recommended after already splitting."""
        player = [Card('8', '♠'), Card('8', '♥')]
        dealer = [Card('7', '♦'), Card('5', '♣')]
        # is_split=True means we already split
        assert get_basic_strategy(player, dealer, is_split=True) != "SPLIT"
