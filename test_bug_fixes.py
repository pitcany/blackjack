#!/usr/bin/env python3
"""Test script to verify bug fixes for blackjack game."""

import sys
import pygame
from blackjack_card_counter.game import BlackjackGame
from blackjack_card_counter.card import Card


def setup_game():
    """Initialize pygame and create a game instance."""
    pygame.init()
    game = BlackjackGame()
    return game


def test_bug1_hole_card_counted_on_bust_hit():
    """Test that dealer's hole card is counted when player busts on hit."""
    print("\n=== TEST 1: Hole card counted when player busts on HIT ===")

    game = setup_game()

    # Set up a scenario where player will bust
    # Player has 10+10=20, dealer has 5+King (hidden)
    game.player_hand = [Card("10", "♠"), Card("K", "♥")]
    game.dealer_hand = [Card("5", "♦"), Card("K", "♣")]  # Hole card is King (-1 count)

    # Set initial running count (only first player cards and dealer up card counted)
    # 10=-1, K=-1, 5=+1 = -1
    game.running_count = -1
    game.cards_dealt = 4
    game.game_state = "playing"
    game.current_bet = 10
    game.bankroll = 1000

    # Create a deck with a bust card (Ace would make 21, so use another 10)
    game.deck = [Card("Q", "♠")] + game.deck[1:]  # Q will bust (20+10=30)

    initial_count = game.running_count
    print(f"Initial running count: {initial_count}")
    print(f"Dealer hole card: {game.dealer_hand[1]} (count value: {game.dealer_hand[1].get_count_value()})")

    # Player hits and busts
    game.hit()

    # Verify hole card was counted
    expected_count = initial_count + game.dealer_hand[1].get_count_value() - 1  # -1 for Q
    print(f"Expected count after bust: {expected_count}")
    print(f"Actual running count: {game.running_count}")

    if game.running_count == expected_count:
        print("✅ PASS: Dealer hole card was counted on player bust (hit)")
        return True
    else:
        print("❌ FAIL: Dealer hole card was NOT counted correctly")
        return False


def test_bug1_hole_card_counted_on_bust_double():
    """Test that dealer's hole card is counted when player busts on double down."""
    print("\n=== TEST 2: Hole card counted when player busts on DOUBLE DOWN ===")

    game = setup_game()

    # Set up a scenario where player will bust on double
    # Player has 10+10=20, dealer has 6+Ace (hidden)
    game.player_hand = [Card("10", "♠"), Card("J", "♥")]
    game.dealer_hand = [Card("6", "♦"), Card("A", "♣")]  # Hole card is Ace (-1 count)

    # Set initial running count
    # 10=-1, J=-1, 6=+1 = -1
    game.running_count = -1
    game.cards_dealt = 4
    game.game_state = "playing"
    game.current_bet = 10
    game.bankroll = 1000

    # Create a deck with a bust card
    game.deck = [Card("K", "♠")] + game.deck[1:]  # K will bust (20+10=30)

    initial_count = game.running_count
    print(f"Initial running count: {initial_count}")
    print(f"Dealer hole card: {game.dealer_hand[1]} (count value: {game.dealer_hand[1].get_count_value()})")

    # Player doubles and busts
    game.double_down()

    # Verify hole card was counted
    expected_count = initial_count + game.dealer_hand[1].get_count_value() - 1  # -1 for K
    print(f"Expected count after bust: {expected_count}")
    print(f"Actual running count: {game.running_count}")

    if game.running_count == expected_count:
        print("✅ PASS: Dealer hole card was counted on player bust (double)")
        return True
    else:
        print("❌ FAIL: Dealer hole card was NOT counted correctly")
        return False


def test_bug2_current_bet_preserved():
    """Test that current_bet is not modified after double down."""
    print("\n=== TEST 3: Current bet preserved after double down ===")

    game = setup_game()

    # Set up a winning scenario with double down
    game.player_hand = [Card("5", "♠"), Card("6", "♥")]  # 11 - good double hand
    game.dealer_hand = [Card("6", "♦"), Card("K", "♣")]  # Dealer has 16

    game.running_count = 0
    game.cards_dealt = 4
    game.game_state = "playing"
    game.current_bet = 10
    game.bankroll = 1000

    initial_bet = game.current_bet
    print(f"Initial bet: ${initial_bet}")

    # Create a deck where player gets 9 (total 20) and dealer stays at 16
    game.deck = [Card("9", "♠"), Card("7", "♣")] + game.deck[2:]

    # Player doubles down
    game.double_down()

    print(f"Bet after double down: ${game.current_bet}")
    print(f"Hand doubled flag: {game.hand_doubled}")

    if game.current_bet == initial_bet and game.hand_doubled:
        print("✅ PASS: current_bet unchanged, hand_doubled flag set correctly")
        result1 = True
    else:
        print("❌ FAIL: current_bet was modified or flag not set")
        result1 = False

    # Now start a new hand and verify bet is still original
    game.start_new_hand()

    print(f"Bet after new hand: ${game.current_bet}")
    print(f"Hand doubled flag after new hand: {game.hand_doubled}")

    if game.current_bet == initial_bet and not game.hand_doubled:
        print("✅ PASS: Bet and flag reset correctly for new hand")
        result2 = True
    else:
        print("❌ FAIL: Bet or flag not reset correctly")
        result2 = False

    return result1 and result2


def test_bug2_doubled_bet_calculations():
    """Test that bankroll calculations use doubled bet correctly."""
    print("\n=== TEST 4: Doubled bet calculations in bankroll ===")

    game = setup_game()

    # Test winning with double down - use finish_hand directly
    game.player_hand = [Card("5", "♠"), Card("6", "♥"), Card("9", "♠")]  # Total 20
    game.dealer_hand = [Card("6", "♦"), Card("K", "♣")]  # Total 16

    game.running_count = 0
    game.cards_dealt = 7
    game.game_state = "finished"
    game.current_bet = 10
    game.bankroll = 1000
    game.hand_doubled = True  # Simulate that player doubled
    initial_bankroll = game.bankroll

    print(f"Initial bankroll: ${initial_bankroll}")
    print(f"Current bet: ${game.current_bet}")
    print(f"Hand doubled: {game.hand_doubled}")

    # Manually trigger finish_hand (simulating end of dealer play)
    game.finish_hand()

    expected_bankroll = initial_bankroll + 20  # Won with doubled bet ($10 * 2)
    print(f"Expected bankroll after win: ${expected_bankroll}")
    print(f"Actual bankroll: ${game.bankroll}")

    if game.bankroll == expected_bankroll:
        print("✅ PASS: Bankroll correctly reflects doubled bet win")
        return True
    else:
        print(f"❌ FAIL: Bankroll calculation incorrect (diff: ${game.bankroll - expected_bankroll})")
        return False


def test_bug2_bust_with_doubled_bet():
    """Test that busting with doubled bet deducts correct amount."""
    print("\n=== TEST 5: Bust with doubled bet deducts correctly ===")

    game = setup_game()

    # Set up a bust scenario with double down
    game.player_hand = [Card("10", "♠"), Card("K", "♥")]  # 20
    game.dealer_hand = [Card("6", "♦"), Card("5", "♣")]

    game.running_count = 0
    game.cards_dealt = 4
    game.game_state = "playing"
    game.current_bet = 10
    game.bankroll = 1000
    game.hand_doubled = False
    initial_bankroll = game.bankroll

    print(f"Initial bankroll: ${initial_bankroll}")
    print(f"Current bet: ${game.current_bet}")

    # Set up deck to bust
    game.deck = [Card("Q", "♠")] + game.deck[1:]  # Will bust (20+10=30)

    # Player doubles down and busts
    game.double_down()

    expected_bankroll = initial_bankroll - 20  # Lost with doubled bet
    print(f"Expected bankroll after bust: ${expected_bankroll}")
    print(f"Actual bankroll: ${game.bankroll}")

    if game.bankroll == expected_bankroll:
        print("✅ PASS: Bankroll correctly reflects doubled bet loss on bust")
        return True
    else:
        print(f"❌ FAIL: Bankroll calculation incorrect (diff: ${game.bankroll - expected_bankroll})")
        return False


def main():
    """Run all tests."""
    print("=" * 60)
    print("BLACKJACK BUG FIX VERIFICATION TESTS")
    print("=" * 60)

    tests = [
        test_bug1_hole_card_counted_on_bust_hit,
        test_bug1_hole_card_counted_on_bust_double,
        test_bug2_current_bet_preserved,
        test_bug2_doubled_bet_calculations,
        test_bug2_bust_with_doubled_bet,
    ]

    results = []
    for test in tests:
        try:
            result = test()
            results.append(result)
        except Exception as e:
            print(f"❌ EXCEPTION: {e}")
            import traceback
            traceback.print_exc()
            results.append(False)

    # Summary
    print("\n" + "=" * 60)
    print("TEST SUMMARY")
    print("=" * 60)
    passed = sum(results)
    total = len(results)
    print(f"Passed: {passed}/{total}")

    if all(results):
        print("\n🎉 ALL TESTS PASSED!")
        return 0
    else:
        print("\n⚠️  SOME TESTS FAILED")
        return 1


if __name__ == "__main__":
    sys.exit(main())
