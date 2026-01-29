"""Settings dialog for configuring game options."""

import tkinter as tk
from tkinter import ttk, messagebox
from typing import Callable

from .theme import Theme, Button
from blackjack import GameConfig


class SettingsDialog:
    """Settings configuration dialog."""
    
    def __init__(
        self,
        parent: tk.Tk,
        config: GameConfig,
        on_apply: Callable[[GameConfig], None]
    ):
        """Initialize the settings dialog."""
        self.parent = parent
        self.config = config
        self.on_apply = on_apply
        self.dialog = None
    
    def show(self) -> None:
        """Show the settings dialog."""
        self.dialog = tk.Toplevel(self.parent)
        self.dialog.title("Game Settings")
        self.dialog.geometry("400x450")
        self.dialog.configure(bg=Theme.BG_DARK)
        self.dialog.transient(self.parent)
        self.dialog.grab_set()
        
        # Center the dialog
        self.dialog.update_idletasks()
        x = self.parent.winfo_x() + (self.parent.winfo_width() - 400) // 2
        y = self.parent.winfo_y() + (self.parent.winfo_height() - 450) // 2
        self.dialog.geometry(f"+{x}+{y}")
        
        self._create_content()
    
    def _create_content(self) -> None:
        """Create dialog content."""
        # Title
        tk.Label(
            self.dialog,
            text="Game Settings",
            font=Theme.FONT_HEADING,
            bg=Theme.BG_DARK,
            fg=Theme.ACCENT_GOLD
        ).pack(pady=Theme.PAD_LARGE)
        
        # Settings frame
        settings_frame = tk.Frame(self.dialog, bg=Theme.BG_MEDIUM, padx=20, pady=20)
        settings_frame.pack(fill=tk.BOTH, expand=True, padx=Theme.PAD_LARGE, pady=Theme.PAD_MEDIUM)
        
        # Number of decks
        self._create_setting_row(
            settings_frame, 
            "Number of Decks:",
            "decks",
            self.config.num_decks,
            1, 8
        )
        
        # Starting bankroll
        self._create_setting_row(
            settings_frame,
            "Starting Bankroll:",
            "bankroll",
            self.config.starting_bankroll,
            100, 100000
        )
        
        # Minimum bet
        self._create_setting_row(
            settings_frame,
            "Minimum Bet:",
            "min_bet",
            self.config.min_bet,
            1, 1000
        )
        
        # Penetration
        self._create_setting_row(
            settings_frame,
            "Penetration (%):",
            "penetration",
            int(self.config.penetration * 100),
            50, 90
        )
        
        # Dealer hits soft 17
        h17_frame = tk.Frame(settings_frame, bg=Theme.BG_MEDIUM)
        h17_frame.pack(fill=tk.X, pady=Theme.PAD_SMALL)
        
        self.h17_var = tk.BooleanVar(value=self.config.dealer_hits_soft_17)
        h17_check = tk.Checkbutton(
            h17_frame,
            text="Dealer Hits Soft 17 (H17)",
            variable=self.h17_var,
            font=Theme.FONT_NORMAL,
            bg=Theme.BG_MEDIUM,
            fg=Theme.TEXT_PRIMARY,
            selectcolor=Theme.BG_LIGHT,
            activebackground=Theme.BG_MEDIUM,
            activeforeground=Theme.TEXT_PRIMARY
        )
        h17_check.pack(anchor=tk.W)
        
        # Double after split
        das_frame = tk.Frame(settings_frame, bg=Theme.BG_MEDIUM)
        das_frame.pack(fill=tk.X, pady=Theme.PAD_SMALL)
        
        self.das_var = tk.BooleanVar(value=self.config.double_after_split)
        das_check = tk.Checkbutton(
            das_frame,
            text="Double After Split Allowed",
            variable=self.das_var,
            font=Theme.FONT_NORMAL,
            bg=Theme.BG_MEDIUM,
            fg=Theme.TEXT_PRIMARY,
            selectcolor=Theme.BG_LIGHT,
            activebackground=Theme.BG_MEDIUM,
            activeforeground=Theme.TEXT_PRIMARY
        )
        das_check.pack(anchor=tk.W)
        
        # Note about new session
        tk.Label(
            settings_frame,
            text="Note: Applying settings will start a new session",
            font=Theme.FONT_SMALL,
            bg=Theme.BG_MEDIUM,
            fg=Theme.TEXT_MUTED
        ).pack(pady=Theme.PAD_MEDIUM)
        
        # Buttons
        btn_frame = tk.Frame(self.dialog, bg=Theme.BG_DARK)
        btn_frame.pack(fill=tk.X, padx=Theme.PAD_LARGE, pady=Theme.PAD_MEDIUM)
        
        Button(
            btn_frame,
            text="Apply",
            command=self._apply,
            font=Theme.FONT_NORMAL,
            bg=Theme.ACCENT_GREEN,
            fg=Theme.TEXT_PRIMARY,
            activebackground="#2ecc71",
            width=12,
            cursor="hand2"
        ).pack(side=tk.LEFT, padx=Theme.PAD_SMALL)
        
        Button(
            btn_frame,
            text="Cancel",
            command=self._cancel,
            font=Theme.FONT_NORMAL,
            bg=Theme.ACCENT_RED,
            fg=Theme.TEXT_PRIMARY,
            activebackground="#c0392b",
            width=12,
            cursor="hand2"
        ).pack(side=tk.LEFT, padx=Theme.PAD_SMALL)
        
        Button(
            btn_frame,
            text="Reset Defaults",
            command=self._reset_defaults,
            font=Theme.FONT_NORMAL,
            bg=Theme.BG_LIGHT,
            fg=Theme.TEXT_PRIMARY,
            activebackground=Theme.ACCENT_GOLD,
            width=12,
            cursor="hand2"
        ).pack(side=tk.RIGHT, padx=Theme.PAD_SMALL)
    
    def _create_setting_row(
        self, 
        parent: tk.Frame, 
        label: str, 
        name: str,
        value: int,
        min_val: int,
        max_val: int
    ) -> None:
        """Create a setting row with label and spinbox."""
        row = tk.Frame(parent, bg=Theme.BG_MEDIUM)
        row.pack(fill=tk.X, pady=Theme.PAD_SMALL)
        
        tk.Label(
            row,
            text=label,
            font=Theme.FONT_NORMAL,
            bg=Theme.BG_MEDIUM,
            fg=Theme.TEXT_PRIMARY,
            width=18,
            anchor=tk.W
        ).pack(side=tk.LEFT)
        
        var = tk.StringVar(value=str(value))
        setattr(self, f"{name}_var", var)
        
        spinner = ttk.Spinbox(
            row,
            from_=min_val,
            to=max_val,
            width=10,
            textvariable=var
        )
        spinner.pack(side=tk.LEFT)
    
    def _apply(self) -> None:
        """Apply the settings."""
        try:
            new_config = GameConfig(
                num_decks=int(self.decks_var.get()),
                starting_bankroll=int(self.bankroll_var.get()),
                min_bet=int(self.min_bet_var.get()),
                max_bet=self.config.max_bet,
                penetration=int(self.penetration_var.get()) / 100.0,
                dealer_hits_soft_17=self.h17_var.get(),
                double_after_split=self.das_var.get(),
                split_aces_one_card_only=self.config.split_aces_one_card_only,
                max_splits=self.config.max_splits,
                insurance_pays=self.config.insurance_pays,
                allow_split_by_value=self.config.allow_split_by_value,
            )
            self.on_apply(new_config)
            self.dialog.destroy()
        except (ValueError, TypeError) as e:
            messagebox.showerror("Invalid Value", str(e))
    
    def _cancel(self) -> None:
        """Cancel and close dialog."""
        self.dialog.destroy()
    
    def _reset_defaults(self) -> None:
        """Reset to default values."""
        defaults = GameConfig()
        self.decks_var.set(str(defaults.num_decks))
        self.bankroll_var.set(str(defaults.starting_bankroll))
        self.min_bet_var.set(str(defaults.min_bet))
        self.penetration_var.set(str(int(defaults.penetration * 100)))
        self.h17_var.set(defaults.dealer_hits_soft_17)
        self.das_var.set(defaults.double_after_split)
