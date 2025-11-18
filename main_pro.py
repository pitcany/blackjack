#!/usr/bin/env python3
"""
Blackjack Pro - Advanced Card Counting Simulator

Enhanced version with:
- Multiple counting systems (Hi-Lo, KO, Omega II)
- Deviation indices (Illustrious 18)
- Save/Load game sessions
- CSV statistics export
- Advanced betting strategies
- Full Blackjack game with proper rules
"""
import tkinter as tk
from src.gui_enhanced import EnhancedBlackjackGUI


def main():
    """Main entry point for the Blackjack Pro application."""
    root = tk.Tk()
    app = EnhancedBlackjackGUI(root)
    app.run()


if __name__ == "__main__":
    main()
