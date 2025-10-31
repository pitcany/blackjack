"""Constants for the Blackjack Card Counter game."""
import pygame

pygame.init()

# Screen dimensions
SCREEN_WIDTH = 1400
SCREEN_HEIGHT = 900
FPS = 60

# Colors
GREEN = (34, 139, 34)
DARK_GREEN = (0, 100, 0)
WHITE = (255, 255, 255)
BLACK = (0, 0, 0)
RED = (220, 20, 60)
GOLD = (255, 215, 0)
BLUE = (30, 144, 255)
GRAY = (128, 128, 128)
LIGHT_GRAY = (200, 200, 200)
YELLOW = (255, 255, 100)

# Card dimensions
CARD_WIDTH = 80
CARD_HEIGHT = 120

# Fonts - using system fonts for better Unicode support
TITLE_FONT = pygame.font.SysFont('arial', 60, bold=True)
LARGE_FONT = pygame.font.SysFont('arial', 48, bold=True)
MEDIUM_FONT = pygame.font.SysFont('arial', 36)
SMALL_FONT = pygame.font.SysFont('arial', 28)
TINY_FONT = pygame.font.SysFont('arial', 20)
CARD_FONT = pygame.font.SysFont('arial', 36, bold=True)

# Game constants
SUITS = ['♠', '♥', '♦', '♣']
RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']
