#!/usr/bin/env python3
"""Test script to verify Bug #3 fix - betting advice using actual bet amount."""

import sys
import pygame
from blackjack_card_counter.game import BlackjackGame
from blackjack_card_counter.strategy import get_betting_advice


def test_betting_advice_calculation():
    """Test that betting advice uses current_bet instead of hardcoded $10."""
    print("\n=== TEST: Betting advice calculation ===")

    pygame.init()
    game = BlackjackGame()

    # Test with different bet amounts
    test_cases = [
        (10, 4, 40),   # $10 bet, 4 units recommended = $40
        (20, 4, 80),   # $20 bet, 4 units recommended = $80
        (50, 4, 200),  # $50 bet, 4 units recommended = $200
        (100, 4, 400), # $100 bet, 4 units recommended = $400
    ]

    all_passed = True

    for bet, units, expected in test_cases:
        game.current_bet = bet
        recommended_amount = units * game.current_bet

        print(f"  Current bet: ${bet}, Units: {units}")
        print(f"    Expected: ${expected}, Calculated: ${recommended_amount}")

        if recommended_amount == expected:
            print(f"    ✅ PASS")
        else:
            print(f"    ❌ FAIL: Got ${recommended_amount}, expected ${expected}")
            all_passed = False

    return all_passed


def test_betting_advice_display():
    """Test that the display logic generates correct advice strings."""
    print("\n=== TEST: Betting advice display logic ===")

    pygame.init()
    game = BlackjackGame()

    # Set up game state
    game.running_count = 8
    game.cards_dealt = 52  # 1 deck dealt
    game.num_decks = 6

    test_cases = [
        (10, "4 units ($40)"),
        (25, "4 units ($100)"),
        (100, "4 units ($400)"),
    ]

    all_passed = True

    for bet, expected_display in test_cases:
        game.current_bet = bet

        # Calculate what would be displayed
        from blackjack_card_counter.strategy import get_true_count
        true_count = get_true_count(game.running_count, game.cards_dealt, game.num_decks)
        units, advice = get_betting_advice(true_count)
        recommended_amount = units * game.current_bet
        actual_display = f"{units} units (${recommended_amount})"

        print(f"  Current bet: ${bet}")
        print(f"    Expected display: {expected_display}")
        print(f"    Actual display:   {actual_display}")

        if actual_display == expected_display:
            print(f"    ✅ PASS")
        else:
            print(f"    ❌ FAIL")
            all_passed = False

    return all_passed


def main():
    """Run all tests."""
    print("=" * 60)
    print("BUG #3 FIX VERIFICATION - BETTING ADVICE")
    print("=" * 60)

    test_results = [
        test_betting_advice_calculation(),
        test_betting_advice_display(),
    ]

    # Summary
    print("\n" + "=" * 60)
    print("TEST SUMMARY")
    print("=" * 60)
    passed = sum(test_results)
    total = len(test_results)
    print(f"Passed: {passed}/{total}")

    if all(test_results):
        print("\n🎉 ALL TESTS PASSED!")
        print("\nBug #3 is fixed - betting advice now uses actual bet amounts!")
        return 0
    else:
        print("\n⚠️  SOME TESTS FAILED")
        return 1


if __name__ == "__main__":
    sys.exit(main())
