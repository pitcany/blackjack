"""Advanced tests for game engine covering edge cases and bug fixes."""

import pytest
from blackjack import (
    Card, Rank, Suit, Action, GamePhase, GameConfig,
    BlackjackEngine, Shoe
)
from blackjack.rules import compare_hands
from blackjack.outcomes import Outcome


class TestBetValidation:
    """Tests for bet input sanitization."""

    def test_negative_bet_rejected(self):
        engine = BlackjackEngine()
        assert engine.start_round(-10) is False
        assert "positive" in engine.state.message

    def test_zero_bet_rejected(self):
        engine = BlackjackEngine()
        assert engine.start_round(0) is False
        assert "positive" in engine.state.message

    def test_float_bet_rejected(self):
        engine = BlackjackEngine()
        assert engine.start_round(10.5) is False
        assert "whole number" in engine.state.message

    def test_bool_bet_rejected(self):
        engine = BlackjackEngine()
        assert engine.start_round(True) is False
        assert "whole number" in engine.state.message

    def test_max_bet_enforced(self):
        config = GameConfig(max_bet=100)
        engine = BlackjackEngine(config)
        assert engine.start_round(200) is False
        assert "Maximum" in engine.state.message

    def test_valid_bet_accepted(self):
        engine = BlackjackEngine()
        assert engine.start_round(100) is True


class TestPhaseGuards:
    """Tests for phase validation."""

    def test_start_round_blocked_during_dealing(self):
        engine = BlackjackEngine()
        engine.start_round(100)
        assert engine.state.phase == GamePhase.DEALING
        assert engine.start_round(100) is False
        assert "Cannot start" in engine.state.message

    def test_start_round_blocked_during_player_turn(self):
        preset = [
            Card(Rank.FIVE, Suit.HEARTS),
            Card(Rank.SIX, Suit.CLUBS),
            Card(Rank.SIX, Suit.SPADES),
            Card(Rank.KING, Suit.DIAMONDS),
        ]
        preset.reverse()
        shoe = Shoe(preset_cards=preset)
        engine = BlackjackEngine(shoe=shoe)
        engine.start_round(100)
        engine.deal_initial()
        assert engine.state.phase == GamePhase.PLAYER_TURN
        assert engine.start_round(100) is False


class TestActionValidation:
    """Tests for action validation in act()."""

    def test_invalid_action_blocked(self):
        """Split on non-pair should be blocked."""
        preset = [
            Card(Rank.FIVE, Suit.HEARTS),
            Card(Rank.SIX, Suit.CLUBS),
            Card(Rank.SEVEN, Suit.SPADES),
            Card(Rank.KING, Suit.DIAMONDS),
        ]
        preset.reverse()
        shoe = Shoe(preset_cards=preset)
        engine = BlackjackEngine(shoe=shoe)
        engine.start_round(100)
        engine.deal_initial()

        assert Action.SPLIT not in engine.available_actions()
        # Try to split anyway - should be rejected
        engine.act(Action.SPLIT)
        assert "not available" in engine.state.message

    def test_double_blocked_after_hit(self):
        """Double should not be available after hitting."""
        preset = [
            Card(Rank.FIVE, Suit.HEARTS),
            Card(Rank.SIX, Suit.CLUBS),
            Card(Rank.THREE, Suit.SPADES),
            Card(Rank.KING, Suit.DIAMONDS),
            Card(Rank.TWO, Suit.HEARTS),  # hit card
        ]
        preset.reverse()
        shoe = Shoe(preset_cards=preset)
        engine = BlackjackEngine(shoe=shoe)
        engine.start_round(100)
        engine.deal_initial()

        engine.act(Action.HIT)
        assert Action.DOUBLE not in engine.available_actions()


class TestSplitBlackjack:
    """Tests for split 21 not being treated as natural blackjack."""

    def test_split_21_is_win_not_blackjack(self):
        """A 2-card 21 from a split should be WIN, not BLACKJACK."""
        config = GameConfig()
        player = [Card(Rank.ACE, Suit.HEARTS), Card(Rank.TEN, Suit.SPADES)]
        dealer = [Card(Rank.TEN, Suit.CLUBS), Card(Rank.NINE, Suit.DIAMONDS)]

        # Normal hand - should be BLACKJACK
        assert compare_hands(player, dealer, config, is_split_hand=False) == Outcome.BLACKJACK
        # Split hand - should be WIN (1:1 payout)
        assert compare_hands(player, dealer, config, is_split_hand=True) == Outcome.WIN

    def test_split_21_vs_dealer_blackjack_loses(self):
        """Split 21 should lose to dealer natural blackjack."""
        config = GameConfig()
        player = [Card(Rank.ACE, Suit.HEARTS), Card(Rank.TEN, Suit.SPADES)]
        dealer = [Card(Rank.ACE, Suit.CLUBS), Card(Rank.KING, Suit.DIAMONDS)]

        # Split 21 vs dealer natural BJ → LOSE
        assert compare_hands(player, dealer, config, is_split_hand=True) == Outcome.LOSE

    def test_split_21_payout_is_1_to_1(self):
        """Verify split aces + 10 pays 1:1 not 3:2 through full engine flow."""
        preset = [
            Card(Rank.ACE, Suit.HEARTS),    # Player card 1
            Card(Rank.SIX, Suit.CLUBS),     # Dealer card 1
            Card(Rank.ACE, Suit.SPADES),    # Player card 2 (pair of aces)
            Card(Rank.SEVEN, Suit.DIAMONDS), # Dealer card 2
            Card(Rank.TEN, Suit.HEARTS),    # Split hand 1 gets 10 → 21
            Card(Rank.FIVE, Suit.SPADES),   # Split hand 2 gets 5 → 16
            Card(Rank.TEN, Suit.DIAMONDS),  # Dealer draws (13 → 23, bust)
        ]
        preset.reverse()
        shoe = Shoe(preset_cards=preset)
        config = GameConfig(starting_bankroll=1000, blackjack_payout=1.5)
        engine = BlackjackEngine(config, shoe)

        engine.start_round(100)  # bankroll: 900
        engine.deal_initial()
        engine.act(Action.SPLIT)  # bankroll: 800

        # Both hands should be done (split aces, one card only)
        assert engine.state.phase == GamePhase.ROUND_OVER

        # Hand 1 has A+10=21 (WIN not BLACKJACK), hand 2 has A+5=16
        # Dealer busts with 6+7+10=23
        # Hand 1: WIN → +100 (not +150)
        # Hand 2: WIN → +100
        # bankroll: 800 + 200 + 200 = 1200
        assert engine.state.bankroll == 1200


class TestAdvanceToNextHand:
    """Tests for _advance_to_next_hand fix."""

    def test_stand_single_hand_goes_to_dealer(self):
        """Standing on a single hand should proceed to dealer turn."""
        preset = [
            Card(Rank.TEN, Suit.HEARTS),   # Player 1
            Card(Rank.SEVEN, Suit.CLUBS),  # Dealer 1 (7)
            Card(Rank.EIGHT, Suit.SPADES), # Player 2 (18)
            Card(Rank.TEN, Suit.DIAMONDS), # Dealer 2 (17, stands)
        ]
        preset.reverse()
        shoe = Shoe(preset_cards=preset)
        engine = BlackjackEngine(shoe=shoe)

        engine.start_round(100)
        engine.deal_initial()
        assert engine.state.phase == GamePhase.PLAYER_TURN

        engine.act(Action.STAND)
        # Should have advanced to dealer turn then round over
        assert engine.state.phase == GamePhase.ROUND_OVER

    def test_split_stand_first_activates_second(self):
        """After standing on first split hand, second hand becomes active."""
        preset = [
            Card(Rank.EIGHT, Suit.HEARTS),
            Card(Rank.SIX, Suit.CLUBS),
            Card(Rank.EIGHT, Suit.SPADES),
            Card(Rank.TEN, Suit.DIAMONDS),
            Card(Rank.THREE, Suit.HEARTS),  # split hand 1
            Card(Rank.TWO, Suit.SPADES),    # split hand 2
            Card(Rank.TEN, Suit.CLUBS),     # extra cards
            Card(Rank.TEN, Suit.HEARTS),
        ]
        preset.reverse()
        shoe = Shoe(preset_cards=preset)
        engine = BlackjackEngine(shoe=shoe)

        engine.start_round(100)
        engine.deal_initial()
        engine.act(Action.SPLIT)

        assert engine.state.active_hand_index == 0
        engine.act(Action.STAND)

        # Should now be on second hand
        assert engine.state.active_hand_index == 1
        assert engine.state.phase == GamePhase.PLAYER_TURN


class TestHoleCardCounting:
    """Tests for running count not including hole card until revealed."""

    def test_deal_initial_counts_only_visible_cards(self):
        """Running count at deal should include player cards + dealer upcard only."""
        # All low cards (+1 each): 5, 6, 3
        # One high card (-1): King (hole)
        # Visible: 5(+1) + 3(+1) + 6(+1) = RC +3
        # Hole: K(-1) not counted yet
        preset = [
            Card(Rank.FIVE, Suit.HEARTS),   # Player 1 (+1)
            Card(Rank.SIX, Suit.CLUBS),     # Dealer upcard (+1)
            Card(Rank.THREE, Suit.SPADES),  # Player 2 (+1)
            Card(Rank.KING, Suit.DIAMONDS), # Dealer hole (-1, not counted)
        ]
        preset.reverse()
        shoe = Shoe(preset_cards=preset)
        engine = BlackjackEngine(shoe=shoe)

        engine.start_round(100)
        engine.deal_initial()

        # Only visible cards counted: +1 +1 +1 = +3
        assert engine.state.running_count == 3

    def test_hole_card_counted_on_stand(self):
        """Hole card should be counted when dealer turn starts."""
        preset = [
            Card(Rank.FIVE, Suit.HEARTS),   # Player 1 (+1)
            Card(Rank.SIX, Suit.CLUBS),     # Dealer upcard (+1)
            Card(Rank.THREE, Suit.SPADES),  # Player 2 (+1)
            Card(Rank.KING, Suit.DIAMONDS), # Dealer hole (-1)
            Card(Rank.JACK, Suit.HEARTS),   # Dealer draw (-1)
        ]
        preset.reverse()
        shoe = Shoe(preset_cards=preset)
        engine = BlackjackEngine(shoe=shoe)

        engine.start_round(100)
        engine.deal_initial()
        assert engine.state.running_count == 3  # visible only

        engine.act(Action.STAND)
        # Hole K(-1) + draw J(-1) = +3 -1 -1 = +1
        assert engine.state.running_count == 1


class TestShoeAutoReshuffle:
    """Tests for shoe auto-reshuffle on empty."""

    def test_draw_auto_reshuffles_when_empty(self):
        """Drawing from empty shoe should auto-reshuffle (non-preset mode)."""
        shoe = Shoe(num_decks=1, penetration=1.0)
        # Draw all 52 cards
        for _ in range(52):
            shoe.draw()
        # Next draw should auto-reshuffle, not crash
        card = shoe.draw()
        assert card is not None
        assert shoe.cards_remaining() == 51

    def test_draw_preset_raises_when_empty(self):
        """Drawing from empty preset shoe should raise ValueError."""
        shoe = Shoe(preset_cards=[Card(Rank.ACE, Suit.HEARTS)])
        shoe.draw()
        with pytest.raises(ValueError, match="preset cards exhausted"):
            shoe.draw()


class TestInsuranceBankroll:
    """Tests for insurance bankroll edge cases."""

    def test_insurance_insufficient_bankroll(self):
        """Insurance should be skipped if bankroll is insufficient."""
        # Player bets almost everything, can't afford insurance
        preset = [
            Card(Rank.TEN, Suit.HEARTS),
            Card(Rank.ACE, Suit.CLUBS),     # Dealer ace
            Card(Rank.EIGHT, Suit.SPADES),
            Card(Rank.NINE, Suit.DIAMONDS),
        ]
        preset.reverse()
        shoe = Shoe(preset_cards=preset)
        config = GameConfig(starting_bankroll=100, min_bet=10)
        engine = BlackjackEngine(config, shoe)

        engine.start_round(100)  # bankroll now 0
        engine.deal_initial()

        assert engine.state.phase == GamePhase.INSURANCE_OFFER

        # Try to take insurance with 0 bankroll
        engine.take_insurance(True)

        # Insurance bet should be 0 since we can't afford it
        assert engine.state.insurance_bet == 0


class TestHoleCardDoubleCount:
    """Tests for hole card not being double-counted after insurance."""

    def test_hole_card_not_double_counted_after_insurance_declined(self):
        """After declining insurance and playing, hole card counted exactly once."""
        # Dealer: A + 5 = soft 16, must hit → draws 10 = hard 16, draws 2 = 18
        preset = [
            Card(Rank.FIVE, Suit.HEARTS),   # Player 1 (+1)
            Card(Rank.ACE, Suit.CLUBS),     # Dealer upcard (ace, -1)
            Card(Rank.THREE, Suit.SPADES),  # Player 2 (+1)
            Card(Rank.FIVE, Suit.DIAMONDS), # Dealer hole (+1, no BJ)
            Card(Rank.TEN, Suit.HEARTS),    # Dealer draw (0), A+5+10=16 hard
            Card(Rank.TWO, Suit.CLUBS),     # Dealer draw (+1), 16+2=18
        ]
        preset.reverse()
        shoe = Shoe(preset_cards=preset)
        engine = BlackjackEngine(shoe=shoe)

        engine.start_round(100)
        engine.deal_initial()

        # Visible: 5(+1) + 3(+1) + A(-1) = RC +1
        assert engine.state.running_count == 1
        assert engine.state.phase == GamePhase.INSURANCE_OFFER

        engine.take_insurance(False)
        # Hole 5(+1) now counted: +1 +1 = +2
        assert engine.state.running_count == 2

        engine.act(Action.STAND)
        # Dealer draws 10(-1) + 2(+1): +2 + (-1) + 1 = +2
        # Hole card must NOT be counted again (would be +3 if double-counted)
        assert engine.state.running_count == 2

    def test_hole_card_not_double_counted_insurance_taken_no_dealer_bj(self):
        """Insurance taken, no dealer BJ, hole card counted once on stand."""
        # Dealer: A + 6 = soft 17, draws 10 = hard 17, stands
        preset = [
            Card(Rank.FIVE, Suit.HEARTS),   # Player 1 (+1)
            Card(Rank.ACE, Suit.CLUBS),     # Dealer upcard (ace, -1)
            Card(Rank.THREE, Suit.SPADES),  # Player 2 (+1)
            Card(Rank.SIX, Suit.DIAMONDS),  # Dealer hole (+1, counted at insurance)
            Card(Rank.TEN, Suit.HEARTS),    # Dealer draw (-1), A+6+10=17 (not drawn, S17 stands)
        ]
        preset.reverse()
        shoe = Shoe(preset_cards=preset)
        engine = BlackjackEngine(shoe=shoe)

        engine.start_round(100)
        engine.deal_initial()

        # Visible: 5(+1) + 3(+1) + A(-1) = +1
        assert engine.state.running_count == 1

        engine.take_insurance(True)
        # Hole 6(+1) counted: +1 +1 = +2
        assert engine.state.running_count == 2

        engine.act(Action.STAND)
        # Dealer stands on soft 17 (S17), no draws. RC stays +2
        # Hole card NOT counted again (would be +3 if double-counted)
        assert engine.state.running_count == 2


class TestNextRoundPhaseGuard:
    """Tests for next_round() phase guard."""

    def test_next_round_blocked_during_player_turn(self):
        """next_round should do nothing during PLAYER_TURN."""
        preset = [
            Card(Rank.FIVE, Suit.HEARTS),
            Card(Rank.SIX, Suit.CLUBS),
            Card(Rank.SIX, Suit.SPADES),
            Card(Rank.KING, Suit.DIAMONDS),
        ]
        preset.reverse()
        shoe = Shoe(preset_cards=preset)
        engine = BlackjackEngine(shoe=shoe)

        engine.start_round(100)
        engine.deal_initial()
        assert engine.state.phase == GamePhase.PLAYER_TURN

        engine.next_round()
        # Should still be in PLAYER_TURN, not reset
        assert engine.state.phase == GamePhase.PLAYER_TURN
        assert len(engine.state.player_hands) == 1

    def test_next_round_works_after_round_over(self):
        """next_round should work when phase is ROUND_OVER."""
        preset = [
            Card(Rank.ACE, Suit.HEARTS),
            Card(Rank.SEVEN, Suit.CLUBS),
            Card(Rank.KING, Suit.SPADES),
            Card(Rank.EIGHT, Suit.DIAMONDS),
        ]
        preset.reverse()
        shoe = Shoe(preset_cards=preset)
        engine = BlackjackEngine(shoe=shoe)

        engine.start_round(100)
        engine.deal_initial()
        assert engine.state.phase == GamePhase.ROUND_OVER  # Player BJ

        engine.next_round()
        assert engine.state.phase == GamePhase.BETTING
        assert len(engine.state.player_hands) == 0


class TestGameConfigValidation:
    """Tests for GameConfig __post_init__ validation."""

    def test_invalid_num_decks(self):
        with pytest.raises(ValueError, match="num_decks"):
            GameConfig(num_decks=0)

    def test_num_decks_too_high(self):
        with pytest.raises(ValueError, match="num_decks"):
            GameConfig(num_decks=10)

    def test_negative_bankroll(self):
        with pytest.raises(ValueError, match="starting_bankroll"):
            GameConfig(starting_bankroll=-100)

    def test_min_bet_exceeds_max_bet(self):
        with pytest.raises(ValueError, match="max_bet"):
            GameConfig(min_bet=500, max_bet=100)

    def test_invalid_penetration(self):
        with pytest.raises(ValueError, match="penetration"):
            GameConfig(penetration=2.0)

    def test_valid_config_accepted(self):
        config = GameConfig(num_decks=2, min_bet=5, max_bet=1000, penetration=0.8)
        assert config.num_decks == 2


class TestStatsOutcomeEnum:
    """Tests that stats work with Outcome enum instead of strings."""

    def test_stats_with_outcome_enum(self):
        """Stats should correctly track outcomes using Outcome enum values."""
        from blackjack.stats import BlackjackStats

        stats = BlackjackStats()
        stats.update_for_outcome(Outcome.WIN, 100, 100)
        assert stats.hands_won == 1

        stats.update_for_outcome(Outcome.BLACKJACK, 100, 150)
        assert stats.blackjacks == 1
        assert stats.hands_won == 2

        stats.update_for_outcome(Outcome.BUST, 100, -100, is_doubled=True)
        assert stats.busts == 1
        assert stats.doubles_lost == 1

        stats.update_for_outcome(Outcome.PUSH, 100, 0)
        assert stats.hands_pushed == 1

        stats.update_for_outcome(Outcome.LOSE, 50, -50, is_split=True)
        assert stats.hands_lost == 2
        assert stats.splits_played == 1
