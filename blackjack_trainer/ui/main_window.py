"""Main application window for Blackjack Trainer."""

import tkinter as tk
from tkinter import ttk
from typing import Optional

from .theme import Theme
from .blackjack_screen import BlackjackScreen
from .training_screen import TrainingScreen
from .settings_dialog import SettingsDialog

from blackjack import GameConfig, CountingTrainerConfig, BlackjackEngine, CountingTrainer


class MainWindow:
    """Main application window with navigation."""
    
    def __init__(self):
        """Initialize the main window."""
        self.root = tk.Tk()
        self.root.title("Blackjack Trainer")
        self.root.geometry("1000x700")
        self.root.minsize(800, 600)
        self.root.configure(bg=Theme.BG_DARK)
        
        # Initialize game components
        self.game_config = GameConfig()
        self.trainer_config = CountingTrainerConfig()
        self.engine = BlackjackEngine(self.game_config)
        self.trainer = CountingTrainer()
        
        # Current screen
        self.current_screen: Optional[tk.Frame] = None
        self.current_screen_name: str = ""
        
        # Build UI
        self._create_nav_bar()
        self._create_main_container()
        self._create_status_bar()
        
        # Show initial screen
        self._show_blackjack()
    
    def _create_nav_bar(self) -> None:
        """Create the navigation bar."""
        self.nav_frame = tk.Frame(self.root, bg=Theme.BG_MEDIUM, height=50)
        self.nav_frame.pack(fill=tk.X, side=tk.TOP)
        self.nav_frame.pack_propagate(False)
        
        # Title
        title_label = tk.Label(
            self.nav_frame,
            text="♠ Blackjack Trainer ♥",
            font=Theme.FONT_HEADING,
            bg=Theme.BG_MEDIUM,
            fg=Theme.ACCENT_GOLD
        )
        title_label.pack(side=tk.LEFT, padx=Theme.PAD_LARGE)
        
        # Navigation buttons
        btn_frame = tk.Frame(self.nav_frame, bg=Theme.BG_MEDIUM)
        btn_frame.pack(side=tk.RIGHT, padx=Theme.PAD_LARGE)
        
        self.btn_blackjack = tk.Button(
            btn_frame,
            text="Blackjack",
            command=self._show_blackjack,
            font=Theme.FONT_NORMAL,
            bg=Theme.BG_LIGHT,
            fg=Theme.TEXT_PRIMARY,
            activebackground=Theme.ACCENT_GOLD,
            activeforeground=Theme.TEXT_DARK,
            width=12,
            cursor="hand2"
        )
        self.btn_blackjack.pack(side=tk.LEFT, padx=Theme.PAD_SMALL)
        
        self.btn_training = tk.Button(
            btn_frame,
            text="Card Counting",
            command=self._show_training,
            font=Theme.FONT_NORMAL,
            bg=Theme.BG_LIGHT,
            fg=Theme.TEXT_PRIMARY,
            activebackground=Theme.ACCENT_GOLD,
            activeforeground=Theme.TEXT_DARK,
            width=12,
            cursor="hand2"
        )
        self.btn_training.pack(side=tk.LEFT, padx=Theme.PAD_SMALL)
        
        self.btn_settings = tk.Button(
            btn_frame,
            text="Settings",
            command=self._show_settings,
            font=Theme.FONT_NORMAL,
            bg=Theme.BG_LIGHT,
            fg=Theme.TEXT_PRIMARY,
            activebackground=Theme.ACCENT_GOLD,
            activeforeground=Theme.TEXT_DARK,
            width=12,
            cursor="hand2"
        )
        self.btn_settings.pack(side=tk.LEFT, padx=Theme.PAD_SMALL)
    
    def _create_main_container(self) -> None:
        """Create the main content container."""
        self.main_container = tk.Frame(self.root, bg=Theme.BG_DARK)
        self.main_container.pack(fill=tk.BOTH, expand=True)
    
    def _create_status_bar(self) -> None:
        """Create the status bar."""
        self.status_frame = tk.Frame(self.root, bg=Theme.BG_MEDIUM, height=30)
        self.status_frame.pack(fill=tk.X, side=tk.BOTTOM)
        self.status_frame.pack_propagate(False)
        
        # Status labels
        self.status_bankroll = tk.Label(
            self.status_frame,
            text="Bankroll: $1000",
            font=Theme.FONT_SMALL,
            bg=Theme.BG_MEDIUM,
            fg=Theme.ACCENT_GOLD
        )
        self.status_bankroll.pack(side=tk.LEFT, padx=Theme.PAD_LARGE)
        
        self.status_decks = tk.Label(
            self.status_frame,
            text="Decks: 6.0",
            font=Theme.FONT_SMALL,
            bg=Theme.BG_MEDIUM,
            fg=Theme.TEXT_SECONDARY
        )
        self.status_decks.pack(side=tk.LEFT, padx=Theme.PAD_LARGE)
        
        self.status_count = tk.Label(
            self.status_frame,
            text="RC: 0",
            font=Theme.FONT_SMALL,
            bg=Theme.BG_MEDIUM,
            fg=Theme.ACCENT_GREEN
        )
        self.status_count.pack(side=tk.LEFT, padx=Theme.PAD_LARGE)
        
        self.status_message = tk.Label(
            self.status_frame,
            text="Welcome to Blackjack Trainer!",
            font=Theme.FONT_SMALL,
            bg=Theme.BG_MEDIUM,
            fg=Theme.TEXT_PRIMARY
        )
        self.status_message.pack(side=tk.RIGHT, padx=Theme.PAD_LARGE)
    
    def _update_nav_highlight(self, active: str) -> None:
        """Update navigation button highlights."""
        buttons = {
            "blackjack": self.btn_blackjack,
            "training": self.btn_training,
            "settings": self.btn_settings
        }
        
        for name, btn in buttons.items():
            if name == active:
                btn.configure(bg=Theme.ACCENT_GOLD, fg=Theme.TEXT_DARK)
            else:
                btn.configure(bg=Theme.BG_LIGHT, fg=Theme.TEXT_PRIMARY)
    
    def _clear_main_container(self) -> None:
        """Clear the main container."""
        if self.current_screen:
            self.current_screen.destroy()
            self.current_screen = None
    
    def _show_blackjack(self) -> None:
        """Show the Blackjack game screen."""
        if self.current_screen_name == "blackjack":
            return
        
        self._clear_main_container()
        self._update_nav_highlight("blackjack")
        self.current_screen_name = "blackjack"
        
        self.current_screen = BlackjackScreen(
            self.main_container,
            self.engine,
            self._update_status
        )
        self.current_screen.pack(fill=tk.BOTH, expand=True)
        self._update_status()
    
    def _show_training(self) -> None:
        """Show the training screen."""
        if self.current_screen_name == "training":
            return
        
        self._clear_main_container()
        self._update_nav_highlight("training")
        self.current_screen_name = "training"
        
        self.current_screen = TrainingScreen(
            self.main_container,
            self.trainer,
            self.trainer_config,
            self._update_status
        )
        self.current_screen.pack(fill=tk.BOTH, expand=True)
        self._update_status()
    
    def _show_settings(self) -> None:
        """Show the settings dialog."""
        dialog = SettingsDialog(
            self.root,
            self.game_config,
            self._apply_settings
        )
        dialog.show()
    
    def _apply_settings(self, new_config: GameConfig) -> None:
        """Apply new settings."""
        self.game_config = new_config
        self.engine = BlackjackEngine(self.game_config)
        
        # Refresh current screen if it's blackjack
        if self.current_screen_name == "blackjack":
            self._clear_main_container()
            self.current_screen = BlackjackScreen(
                self.main_container,
                self.engine,
                self._update_status
            )
            self.current_screen.pack(fill=tk.BOTH, expand=True)
        
        self._update_status()
    
    def _update_status(self) -> None:
        """Update the status bar."""
        state = self.engine.get_state()
        
        self.status_bankroll.configure(text=f"Bankroll: ${state.bankroll}")
        self.status_decks.configure(text=f"Decks: {state.decks_remaining_estimate:.1f}")
        self.status_count.configure(text=f"RC: {state.running_count}")
        self.status_message.configure(text=state.message)
    
    def run(self) -> None:
        """Start the application main loop."""
        self.root.mainloop()
