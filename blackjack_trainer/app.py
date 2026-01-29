#!/usr/bin/env python3
"""
Blackjack Trainer Application

A complete desktop Blackjack game with Card Counting Training Mode (Hi-Lo).
Built with Python and Tkinter.

Usage:
    python app.py

Requirements:
    - Python 3.11+
    - Tkinter (usually included with Python)
"""

import sys

# Check Python version
if sys.version_info < (3, 11):
    print("Error: Python 3.11 or higher is required")
    sys.exit(1)

from blackjack import GameConfig, CountingTrainerConfig, BlackjackEngine, CountingTrainer
from ui import MainWindow


def main():
    """Main entry point for the application."""
    app = MainWindow()
    app.run()


if __name__ == "__main__":
    main()
