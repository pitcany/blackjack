"""Quick test to verify the standalone game.py has the split+double fix."""

import sys
import pygame

# Import from standalone game.py
sys.path.insert(0, '/home/yannik/Work/blackjack')
import game

pygame.init()

print("Testing Standalone game.py - Split + Double Fix")
print("=" * 50)

# Test: $100 bankroll, $50 bet - should BLOCK double after split
game_obj = game.BlackjackGame()
game_obj.bankroll = 100
game_obj.current_bet = 50
game_obj.game_state = 'playing'

# Create a Card class instance (standalone uses different import)
class Card:
    def __init__(self, rank, suit):
        self.rank = rank
        self.suit = suit

game_obj.player_hand = [Card('8', '♠'), Card('8', '♥')]
game_obj.dealer_hand = [Card('K', '♦'), Card('6', '♣')]

print(f"Initial: ${game_obj.bankroll} bankroll, ${game_obj.current_bet} bet")
game_obj.split()

if game_obj.is_split:
    print("✅ Split successful")
    game_obj.double_down()

    if game_obj.split_doubled[0]:
        print("❌ FAIL: Double was allowed (should be blocked)")
        pygame.quit()
        sys.exit(1)
    else:
        print("✅ PASS: Double correctly blocked!")
        print(f"   Message: {game_obj.message}")
        print("\n" + "=" * 50)
        print("✅ Standalone version has the fix!")

pygame.quit()
sys.exit(0)
