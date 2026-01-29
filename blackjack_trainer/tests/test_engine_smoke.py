"""Smoke tests for the game engine."""

import pytest
from blackjack import (
    Card, Rank, Suit, Action, GamePhase, GameConfig,
    BlackjackEngine, Shoe
)


class TestEngineSmoke:
    """Smoke tests for BlackjackEngine."""
    
    def test_basic_round_flow(self):
        """Test basic round can complete."""
        engine = BlackjackEngine()
        
        # Place bet
        assert engine.start_round(100) is True
        assert engine.state.phase == GamePhase.DEALING
        
        # Deal
        engine.deal_initial()
        assert len(engine.state.player_hands) == 1
        assert len(engine.state.player_hands[0].cards) == 2
        assert len(engine.state.dealer_cards) == 2
    
    def test_player_blackjack_payout(self):
        """Test player blackjack pays correctly with deterministic shoe."""
        # Create a shoe that will deal player blackjack, dealer non-blackjack
        preset = [
            # Deal order: player1, dealer1, player2, dealer2
            Card(Rank.ACE, Suit.HEARTS),    # Player card 1
            Card(Rank.SEVEN, Suit.CLUBS),   # Dealer card 1
            Card(Rank.KING, Suit.SPADES),   # Player card 2
            Card(Rank.EIGHT, Suit.DIAMONDS) # Dealer card 2
        ]
        preset.reverse()  # Shoe draws from end
        
        shoe = Shoe(preset_cards=preset)
        config = GameConfig(starting_bankroll=1000, blackjack_payout=1.5)
        engine = BlackjackEngine(config, shoe)
        
        initial_bankroll = engine.state.bankroll
        engine.start_round(100)
        engine.deal_initial()
        
        # Should resolve immediately with blackjack
        assert engine.state.phase == GamePhase.ROUND_OVER
        # Blackjack pays 3:2 = 150 profit, so bankroll should be 1000 - 100 + 100 + 150 = 1150
        assert engine.state.bankroll == 1150
    
    def test_double_scenario(self):
        """Test double down works correctly."""
        # Create a shoe for controlled double down
        preset = [
            Card(Rank.FIVE, Suit.HEARTS),   # Player card 1
            Card(Rank.SIX, Suit.CLUBS),     # Dealer card 1 (upcard)
            Card(Rank.SIX, Suit.SPADES),    # Player card 2 (total 11)
            Card(Rank.KING, Suit.DIAMONDS), # Dealer card 2 (hole card)
            Card(Rank.TEN, Suit.HEARTS),    # Double down card (total 21)
            Card(Rank.FIVE, Suit.SPADES),   # Dealer draw (total 21, push)
        ]
        preset.reverse()
        
        shoe = Shoe(preset_cards=preset)
        config = GameConfig(starting_bankroll=1000)
        engine = BlackjackEngine(config, shoe)
        
        engine.start_round(100)
        engine.deal_initial()
        
        # Should be in player turn
        assert engine.state.phase == GamePhase.PLAYER_TURN
        
        # Double should be available
        available = engine.available_actions()
        assert Action.DOUBLE in available
        
        # Double down
        engine.act(Action.DOUBLE)
        
        # Hand should be resolved (3 cards after double)
        hand = engine.state.player_hands[0]
        assert len(hand.cards) == 3
        assert hand.is_doubled is True
        assert hand.bet == 200  # Original 100 doubled
    
    def test_split_creates_two_hands(self):
        """Test split creates two hands."""
        # Create a shoe for split scenario
        preset = [
            Card(Rank.EIGHT, Suit.HEARTS),  # Player card 1
            Card(Rank.SIX, Suit.CLUBS),     # Dealer card 1
            Card(Rank.EIGHT, Suit.SPADES),  # Player card 2 (pair)
            Card(Rank.TEN, Suit.DIAMONDS),  # Dealer card 2
            Card(Rank.THREE, Suit.HEARTS),  # Card for first split hand
            Card(Rank.TWO, Suit.SPADES),    # Card for second split hand
            # More cards for hitting
            Card(Rank.TEN, Suit.CLUBS),
            Card(Rank.TEN, Suit.HEARTS),
        ]
        preset.reverse()
        
        shoe = Shoe(preset_cards=preset)
        config = GameConfig(starting_bankroll=1000)
        engine = BlackjackEngine(config, shoe)
        
        engine.start_round(100)
        engine.deal_initial()
        
        # Should be in player turn
        assert engine.state.phase == GamePhase.PLAYER_TURN
        
        # Split should be available
        available = engine.available_actions()
        assert Action.SPLIT in available
        
        # Split
        engine.act(Action.SPLIT)
        
        # Should now have two hands
        assert len(engine.state.player_hands) == 2
        
        # Each hand should have 2 cards (one original + one dealt)
        assert len(engine.state.player_hands[0].cards) == 2
        assert len(engine.state.player_hands[1].cards) == 2
        
        # Each hand should have the same bet
        assert engine.state.player_hands[0].bet == 100
        assert engine.state.player_hands[1].bet == 100
    
    def test_insurance_flow(self):
        """Test insurance offer and resolution."""
        # Create a shoe where dealer shows Ace
        preset = [
            Card(Rank.TEN, Suit.HEARTS),    # Player card 1
            Card(Rank.ACE, Suit.CLUBS),     # Dealer card 1 (Ace upcard)
            Card(Rank.EIGHT, Suit.SPADES),  # Player card 2
            Card(Rank.NINE, Suit.DIAMONDS), # Dealer card 2 (no blackjack)
        ]
        preset.reverse()
        
        shoe = Shoe(preset_cards=preset)
        config = GameConfig(starting_bankroll=1000)
        engine = BlackjackEngine(config, shoe)
        
        engine.start_round(100)
        engine.deal_initial()
        
        # Should offer insurance
        assert engine.state.phase == GamePhase.INSURANCE_OFFER
        
        # Decline insurance
        engine.take_insurance(False)
        
        # Should continue to player turn
        assert engine.state.phase == GamePhase.PLAYER_TURN
    
    def test_new_session_resets(self):
        """Test new_session resets everything."""
        engine = BlackjackEngine()
        
        # Play a round
        engine.start_round(100)
        engine.deal_initial()
        
        # Reset
        engine.new_session()
        
        assert engine.state.bankroll == engine.config.starting_bankroll
        assert engine.state.phase == GamePhase.BETTING
        assert len(engine.state.player_hands) == 0
        assert len(engine.state.dealer_cards) == 0
        assert engine.state.running_count == 0
    
    def test_insufficient_bankroll(self):
        """Test betting more than bankroll fails."""
        config = GameConfig(starting_bankroll=100)
        engine = BlackjackEngine(config)
        
        result = engine.start_round(200)
        assert result is False
        assert "Insufficient" in engine.state.message
    
    def test_minimum_bet_enforced(self):
        """Test minimum bet is enforced."""
        config = GameConfig(min_bet=25)
        engine = BlackjackEngine(config)
        
        result = engine.start_round(10)
        assert result is False
        assert "Minimum" in engine.state.message
