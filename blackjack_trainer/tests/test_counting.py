"""Tests for card counting functions."""

import pytest
from blackjack import Card, Rank, Suit, CountingTrainerConfig
from blackjack.counting import hi_lo_value, update_running_count, true_count, CountingTrainer


class TestHiLoValue:
    """Tests for hi_lo_value function."""
    
    def test_low_cards_positive(self):
        """Cards 2-6 are +1."""
        for rank in [Rank.TWO, Rank.THREE, Rank.FOUR, Rank.FIVE, Rank.SIX]:
            card = Card(rank, Suit.HEARTS)
            assert hi_lo_value(card) == 1, f"{rank} should be +1"
    
    def test_neutral_cards_zero(self):
        """Cards 7-9 are 0."""
        for rank in [Rank.SEVEN, Rank.EIGHT, Rank.NINE]:
            card = Card(rank, Suit.HEARTS)
            assert hi_lo_value(card) == 0, f"{rank} should be 0"
    
    def test_high_cards_negative(self):
        """Cards 10-A are -1."""
        for rank in [Rank.TEN, Rank.JACK, Rank.QUEEN, Rank.KING, Rank.ACE]:
            card = Card(rank, Suit.HEARTS)
            assert hi_lo_value(card) == -1, f"{rank} should be -1"


class TestUpdateRunningCount:
    """Tests for update_running_count function."""
    
    def test_single_low_card(self):
        """Single low card increases count."""
        cards = [Card(Rank.FIVE, Suit.HEARTS)]
        assert update_running_count(0, cards) == 1
    
    def test_single_high_card(self):
        """Single high card decreases count."""
        cards = [Card(Rank.ACE, Suit.HEARTS)]
        assert update_running_count(0, cards) == -1
    
    def test_mixed_cards(self):
        """Mixed cards cancel out."""
        cards = [
            Card(Rank.FIVE, Suit.HEARTS),  # +1
            Card(Rank.ACE, Suit.SPADES)    # -1
        ]
        assert update_running_count(0, cards) == 0
    
    def test_multiple_cards(self):
        """Multiple cards accumulate."""
        cards = [
            Card(Rank.TWO, Suit.HEARTS),   # +1
            Card(Rank.THREE, Suit.SPADES), # +1
            Card(Rank.FOUR, Suit.CLUBS),   # +1
            Card(Rank.SEVEN, Suit.DIAMONDS) # 0
        ]
        assert update_running_count(0, cards) == 3
    
    def test_starting_count(self):
        """Starting from non-zero count."""
        cards = [Card(Rank.SIX, Suit.HEARTS)]  # +1
        assert update_running_count(5, cards) == 6


class TestTrueCount:
    """Tests for true_count function."""
    
    def test_basic_true_count(self):
        """Basic true count calculation."""
        # RC 6, 2 decks = TC 3
        tc = true_count(6, 2.0)
        assert tc == 3.0
    
    def test_negative_true_count(self):
        """Negative true count."""
        tc = true_count(-6, 2.0)
        assert tc == -3.0
    
    def test_fractional_decks(self):
        """True count with fractional decks."""
        tc = true_count(3, 1.5)
        assert tc == 2.0
    
    def test_small_decks_guard(self):
        """Small decks remaining uses minimum."""
        # Should use 0.5 as minimum
        tc = true_count(5, 0.1)
        assert tc == 10.0  # 5 / 0.5
    
    def test_zero_count(self):
        """Zero running count."""
        tc = true_count(0, 4.0)
        assert tc == 0.0


class TestCountingTrainer:
    """Tests for CountingTrainer class."""
    
    @pytest.fixture
    def trainer(self):
        return CountingTrainer()
    
    @pytest.fixture
    def config(self):
        return CountingTrainerConfig(
            num_decks=6,
            drill_type="single_card",
            cards_per_round=1,
            ask_true_count=False
        )
    
    def test_start_training(self, trainer, config):
        """Start initializes trainer correctly."""
        trainer.start(config)
        assert trainer.is_running is True
        assert trainer.running_count == 0
        assert trainer.stats.attempts == 0
    
    def test_next_round_deals_cards(self, trainer, config):
        """Next round deals cards."""
        trainer.start(config)
        cards = trainer.next_round()
        assert len(cards) == 1
    
    def test_submit_correct_guess(self, trainer, config):
        """Correct guess updates stats."""
        trainer.start(config)
        cards = trainer.next_round()
        expected = sum(hi_lo_value(c) for c in cards)
        
        result = trainer.submit_guess(expected)
        assert result['is_correct_rc'] is True
        assert trainer.stats.correct_rc == 1
        assert trainer.stats.streak == 1
    
    def test_submit_incorrect_guess(self, trainer, config):
        """Incorrect guess updates stats."""
        trainer.start(config)
        trainer.next_round()
        
        result = trainer.submit_guess(999)  # Wrong guess
        assert result['is_correct_rc'] is False
        assert trainer.stats.correct_rc == 0
        assert trainer.stats.streak == 0
    
    def test_stop_training(self, trainer, config):
        """Stop returns final stats."""
        trainer.start(config)
        trainer.next_round()
        trainer.submit_guess(0)
        
        stats = trainer.stop()
        assert trainer.is_running is False
        assert 'attempts' in stats
        assert 'accuracy_rc' in stats
    
    def test_true_count_drill(self, trainer):
        """True count drill configuration."""
        config = CountingTrainerConfig(
            num_decks=6,
            drill_type="single_card",
            ask_true_count=True
        )
        trainer.start(config)
        trainer.next_round()
        
        result = trainer.submit_guess(0, 0.0)
        assert 'is_correct_tc' in result
        assert result['expected_tc'] is not None
