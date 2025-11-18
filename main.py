#!/usr/bin/env python3
"""
Blackjack Game with Card Counting Simulator & Basic Strategy Integration

A desktop application featuring:
- Full Blackjack game with proper rules (Multi-deck, Dealer hits soft 17, DAS)
- Hi-Lo card counting system with running/true count display
- Basic strategy recommendations
- Comprehensive GUI with card visualization
- Game statistics and betting suggestions
"""
import tkinter as tk
from src.gui import BlackjackGUI


def main():
    """Main entry point for the Blackjack application."""
    root = tk.Tk()
    app = BlackjackGUI(root)
    app.run()


if __name__ == "__main__":
    main()
