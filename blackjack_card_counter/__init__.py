"""Blackjack Card Counting Trainer - A pygame-based card counting practice tool.

This package provides a complete blackjack game with card counting features,
basic strategy recommendations, and betting advice based on the Hi-Lo counting system.
"""

__version__ = "0.1.0"
__author__ = "pitcany"

import pygame
from .game import BlackjackGame

# Initialize pygame when package is imported
pygame.init()


def main():
    """Entry point for the blackjack game."""
    game = BlackjackGame()
    game.run()


__all__ = ["BlackjackGame", "main"]
