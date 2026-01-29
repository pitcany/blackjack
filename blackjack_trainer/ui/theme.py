"""Theme constants for the Tkinter UI."""

import platform
import tkinter as tk

if platform.system() == "Darwin":
    try:
        from tkmacosx import Button as _Button
    except ImportError:
        _Button = tk.Button
else:
    _Button = tk.Button

# Platform-aware Button that supports bg/fg on macOS
Button = _Button


class Theme:
    """UI theme constants."""
    
    # Colors - Dark casino theme
    BG_DARK = "#1a1a2e"
    BG_MEDIUM = "#16213e"
    BG_LIGHT = "#0f3460"
    BG_CARD = "#e8e8e8"
    
    TEXT_PRIMARY = "#ffffff"
    TEXT_SECONDARY = "#a0a0a0"
    TEXT_MUTED = "#6c757d"
    TEXT_DARK = "#1a1a2e"
    
    ACCENT_GOLD = "#f4d03f"
    ACCENT_GREEN = "#27ae60"
    ACCENT_RED = "#e74c3c"
    ACCENT_BLUE = "#3498db"
    
    CARD_RED = "#c0392b"
    CARD_BLACK = "#2c3e50"
    
    # Fonts
    FONT_FAMILY = "Helvetica"
    FONT_SIZE_LARGE = 24
    FONT_SIZE_MEDIUM = 16
    FONT_SIZE_NORMAL = 12
    FONT_SIZE_SMALL = 10
    
    FONT_HEADING = (FONT_FAMILY, FONT_SIZE_LARGE, "bold")
    FONT_SUBHEADING = (FONT_FAMILY, FONT_SIZE_MEDIUM, "bold")
    FONT_NORMAL = (FONT_FAMILY, FONT_SIZE_NORMAL)
    FONT_SMALL = (FONT_FAMILY, FONT_SIZE_SMALL)
    FONT_CARD = ("Courier", 20, "bold")
    FONT_CARD_LARGE = ("Courier", 28, "bold")
    
    # Padding
    PAD_SMALL = 5
    PAD_MEDIUM = 10
    PAD_LARGE = 20
    
    # Card display
    CARD_WIDTH = 60
    CARD_HEIGHT = 84
    CARD_PADDING = 5
    
    # Button styles
    BTN_WIDTH = 12
    BTN_HEIGHT = 2
