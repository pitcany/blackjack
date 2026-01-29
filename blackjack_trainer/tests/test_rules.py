"""Tests for game rules."""

import pytest
from blackjack import Card, Rank, Suit, GameConfig
from blackjack.rules import dealer_should_hit, compare_hands, payout_for_outcome
from blackjack.outcomes import Outcome


class TestDealerShouldHit:
    """Tests for dealer_should_hit function."""
    
    @pytest.fixture
    def s17_config(self):
        """Config with dealer stands on soft 17."""
        return GameConfig(dealer_hits_soft_17=False)
    
    @pytest.fixture
    def h17_config(self):
        """Config with dealer hits on soft 17."""
        return GameConfig(dealer_hits_soft_17=True)
    
    def test_dealer_hits_under_17(self, s17_config):
        """Dealer should hit on 16 or under."""
        cards = [
            Card(Rank.TEN, Suit.HEARTS),
            Card(Rank.SIX, Suit.SPADES)
        ]
        assert dealer_should_hit(cards, s17_config) is True
    
    def test_dealer_stands_on_17(self, s17_config):
        """Dealer stands on hard 17 in S17."""
        cards = [
            Card(Rank.TEN, Suit.HEARTS),
            Card(Rank.SEVEN, Suit.SPADES)
        ]
        assert dealer_should_hit(cards, s17_config) is False
    
    def test_dealer_stands_soft_17_s17(self, s17_config):
        """Dealer stands on soft 17 in S17 rules."""
        cards = [
            Card(Rank.ACE, Suit.HEARTS),
            Card(Rank.SIX, Suit.SPADES)
        ]
        assert dealer_should_hit(cards, s17_config) is False
    
    def test_dealer_hits_soft_17_h17(self, h17_config):
        """Dealer hits soft 17 in H17 rules."""
        cards = [
            Card(Rank.ACE, Suit.HEARTS),
            Card(Rank.SIX, Suit.SPADES)
        ]
        assert dealer_should_hit(cards, h17_config) is True
    
    def test_dealer_stands_soft_18_h17(self, h17_config):
        """Dealer stands on soft 18 even in H17."""
        cards = [
            Card(Rank.ACE, Suit.HEARTS),
            Card(Rank.SEVEN, Suit.SPADES)
        ]
        assert dealer_should_hit(cards, h17_config) is False
    
    def test_dealer_hits_low(self, s17_config):
        """Dealer hits on low totals."""
        cards = [
            Card(Rank.FIVE, Suit.HEARTS),
            Card(Rank.SIX, Suit.SPADES)
        ]
        assert dealer_should_hit(cards, s17_config) is True


class TestCompareHands:
    """Tests for compare_hands function."""
    
    @pytest.fixture
    def config(self):
        return GameConfig()
    
    def test_player_wins(self, config):
        """Player higher total wins."""
        player = [Card(Rank.TEN, Suit.HEARTS), Card(Rank.NINE, Suit.SPADES)]
        dealer = [Card(Rank.TEN, Suit.CLUBS), Card(Rank.EIGHT, Suit.DIAMONDS)]
        assert compare_hands(player, dealer, config) == Outcome.WIN
    
    def test_dealer_wins(self, config):
        """Dealer higher total wins."""
        player = [Card(Rank.TEN, Suit.HEARTS), Card(Rank.SEVEN, Suit.SPADES)]
        dealer = [Card(Rank.TEN, Suit.CLUBS), Card(Rank.EIGHT, Suit.DIAMONDS)]
        assert compare_hands(player, dealer, config) == Outcome.LOSE
    
    def test_push(self, config):
        """Same total is push."""
        player = [Card(Rank.TEN, Suit.HEARTS), Card(Rank.EIGHT, Suit.SPADES)]
        dealer = [Card(Rank.TEN, Suit.CLUBS), Card(Rank.EIGHT, Suit.DIAMONDS)]
        assert compare_hands(player, dealer, config) == Outcome.PUSH
    
    def test_player_bust(self, config):
        """Player bust loses."""
        player = [
            Card(Rank.TEN, Suit.HEARTS), 
            Card(Rank.EIGHT, Suit.SPADES),
            Card(Rank.FIVE, Suit.CLUBS)
        ]
        dealer = [Card(Rank.TEN, Suit.CLUBS), Card(Rank.EIGHT, Suit.DIAMONDS)]
        assert compare_hands(player, dealer, config) == Outcome.BUST
    
    def test_dealer_bust(self, config):
        """Dealer bust, player wins."""
        player = [Card(Rank.TEN, Suit.HEARTS), Card(Rank.EIGHT, Suit.SPADES)]
        dealer = [
            Card(Rank.TEN, Suit.CLUBS),
            Card(Rank.EIGHT, Suit.DIAMONDS),
            Card(Rank.FIVE, Suit.HEARTS)
        ]
        assert compare_hands(player, dealer, config) == Outcome.WIN
    
    def test_player_blackjack(self, config):
        """Player blackjack wins."""
        player = [Card(Rank.ACE, Suit.HEARTS), Card(Rank.TEN, Suit.SPADES)]
        dealer = [Card(Rank.TEN, Suit.CLUBS), Card(Rank.NINE, Suit.DIAMONDS)]
        assert compare_hands(player, dealer, config) == Outcome.BLACKJACK
    
    def test_both_blackjack(self, config):
        """Both blackjack is push."""
        player = [Card(Rank.ACE, Suit.HEARTS), Card(Rank.TEN, Suit.SPADES)]
        dealer = [Card(Rank.ACE, Suit.CLUBS), Card(Rank.KING, Suit.DIAMONDS)]
        assert compare_hands(player, dealer, config) == Outcome.PUSH
    
    def test_dealer_blackjack(self, config):
        """Dealer blackjack beats player 21."""
        player = [
            Card(Rank.SEVEN, Suit.HEARTS),
            Card(Rank.SEVEN, Suit.SPADES),
            Card(Rank.SEVEN, Suit.CLUBS)
        ]
        dealer = [Card(Rank.ACE, Suit.CLUBS), Card(Rank.KING, Suit.DIAMONDS)]
        assert compare_hands(player, dealer, config) == Outcome.LOSE


class TestPayoutForOutcome:
    """Tests for payout_for_outcome function."""
    
    @pytest.fixture
    def config(self):
        return GameConfig(blackjack_payout=1.5)
    
    def test_win_payout(self, config):
        """Win pays 1:1."""
        assert payout_for_outcome(Outcome.WIN, 100, config) == 100
    
    def test_lose_payout(self, config):
        """Lose returns negative bet."""
        assert payout_for_outcome(Outcome.LOSE, 100, config) == -100
    
    def test_push_payout(self, config):
        """Push returns 0."""
        assert payout_for_outcome(Outcome.PUSH, 100, config) == 0
    
    def test_blackjack_payout(self, config):
        """Blackjack pays 3:2."""
        assert payout_for_outcome(Outcome.BLACKJACK, 100, config) == 150
    
    def test_bust_payout(self, config):
        """Bust loses bet."""
        assert payout_for_outcome(Outcome.BUST, 100, config) == -100
