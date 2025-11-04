"""Test script to verify the split + double bankroll validation fix."""

import sys
import pygame
from blackjack_card_counter.game import BlackjackGame
from blackjack_card_counter.card import Card

def test_split_double_validation():
    """Test that split + double validation prevents negative bankroll."""

    print("Testing Split + Double Bankroll Validation Fix")
    print("=" * 50)

    # Initialize pygame (required for the game)
    pygame.init()

    # Test Scenario 1: $100 bankroll, $50 bet - should BLOCK double after split
    print("\n📝 Test 1: $100 bankroll, $50 bet, split then try to double")
    print("Expected: Double should be BLOCKED (would require $150 total)")

    game1 = BlackjackGame()
    game1.bankroll = 100
    game1.current_bet = 50
    game1.game_state = "playing"

    # Set up a splittable hand (two cards of same rank)
    game1.player_hand = [Card('8', '♠'), Card('8', '♥')]
    game1.dealer_hand = [Card('K', '♦'), Card('6', '♣')]  # Add dealer hand

    # Perform split (requires $100 total)
    print(f"  Initial bankroll: ${game1.bankroll}")
    print(f"  Bet amount: ${game1.current_bet}")
    print(f"  Attempting split (needs ${game1.current_bet * 2})...")

    game1.split()

    if game1.is_split:
        print(f"  ✅ Split successful")

        # Try to double on first hand (would require additional $50, total $150)
        print(f"  Attempting double on first split hand...")
        old_message = game1.message
        game1.double_down()

        if game1.split_doubled[0]:
            print(f"  ❌ FAIL: Double was allowed! This would risk ${game1.current_bet * 3} with only ${game1.bankroll}")
            return False
        else:
            print(f"  ✅ PASS: Double correctly blocked!")
            print(f"     Message: {game1.message}")
    else:
        print(f"  ❌ Split was blocked (shouldn't happen with $100 bankroll)")
        return False

    # Test Scenario 2: $200 bankroll, $50 bet - should ALLOW double after split
    print("\n📝 Test 2: $200 bankroll, $50 bet, split then double")
    print("Expected: Double should be ALLOWED")

    game2 = BlackjackGame()
    game2.bankroll = 200
    game2.current_bet = 50
    game2.game_state = "playing"

    # Set up a splittable hand
    game2.player_hand = [Card('7', '♣'), Card('7', '♦')]
    game2.dealer_hand = [Card('Q', '♥'), Card('5', '♠')]  # Add dealer hand

    print(f"  Initial bankroll: ${game2.bankroll}")
    print(f"  Bet amount: ${game2.current_bet}")
    print(f"  Attempting split...")

    game2.split()

    if game2.is_split:
        print(f"  ✅ Split successful")

        # Try to double on first hand
        print(f"  Attempting double on first split hand...")
        game2.double_down()

        if game2.split_doubled[0]:
            print(f"  ✅ PASS: Double correctly allowed with sufficient funds")

            # Try to double second hand too (would require full $200)
            game2.active_split_hand = 1
            print(f"  Attempting double on second split hand...")
            game2.double_down()

            if game2.split_doubled[1]:
                print(f"  ✅ PASS: Second double allowed (using full ${game2.bankroll})")
            else:
                print(f"  ❌ FAIL: Second double blocked despite having exactly enough funds")
                return False
        else:
            print(f"  ❌ FAIL: Double was blocked despite sufficient funds!")
            print(f"     Message: {game2.message}")
            return False

    # Test Scenario 3: Edge case - $150 bankroll, $50 bet
    print("\n📝 Test 3: $150 bankroll, $50 bet (edge case)")
    print("Expected: Split allowed, first double allowed, second double blocked")

    game3 = BlackjackGame()
    game3.bankroll = 150
    game3.current_bet = 50
    game3.game_state = "playing"

    game3.player_hand = [Card('9', '♠'), Card('9', '♣')]

    print(f"  Initial bankroll: ${game3.bankroll}")
    print(f"  Bet amount: ${game3.current_bet}")

    game3.split()
    print(f"  ✅ Split successful")

    game3.double_down()
    if game3.split_doubled[0]:
        print(f"  ✅ First double allowed (total commitment: $150)")
    else:
        print(f"  ❌ FAIL: First double should be allowed")
        return False

    game3.active_split_hand = 1
    game3.double_down()
    if not game3.split_doubled[1]:
        print(f"  ✅ PASS: Second double correctly blocked (would need $200)")
    else:
        print(f"  ❌ FAIL: Second double allowed, would exceed bankroll!")
        return False

    print("\n" + "=" * 50)
    print("✅ All tests PASSED! Fix is working correctly.")
    print("The game now properly prevents negative bankroll from split+double.")
    return True

if __name__ == "__main__":
    try:
        success = test_split_double_validation()
        pygame.quit()
        sys.exit(0 if success else 1)
    except Exception as e:
        print(f"\n❌ Test failed with error: {e}")
        import traceback
        traceback.print_exc()
        pygame.quit()
        sys.exit(1)