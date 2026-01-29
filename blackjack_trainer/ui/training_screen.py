"""Card counting training screen."""

import tkinter as tk
from tkinter import ttk
from typing import Callable, Optional

from .theme import Theme
from blackjack import CountingTrainer, CountingTrainerConfig, Card


class TrainingScreen(tk.Frame):
    """Card counting training interface."""
    
    def __init__(
        self,
        parent: tk.Widget,
        trainer: CountingTrainer,
        config: CountingTrainerConfig,
        on_update: Callable[[], None]
    ):
        """Initialize the training screen."""
        super().__init__(parent, bg=Theme.BG_DARK)
        
        self.trainer = trainer
        self.config = config
        self.on_update = on_update
        self.current_cards: list = []
        self.is_training: bool = False
        
        self._create_ui()
    
    def _create_ui(self) -> None:
        """Create the UI components."""
        # Title
        title_frame = tk.Frame(self, bg=Theme.BG_DARK)
        title_frame.pack(fill=tk.X, pady=Theme.PAD_MEDIUM)
        
        tk.Label(
            title_frame,
            text="Hi-Lo Card Counting Trainer",
            font=Theme.FONT_HEADING,
            bg=Theme.BG_DARK,
            fg=Theme.ACCENT_GOLD
        ).pack()
        
        tk.Label(
            title_frame,
            text="2-6: +1  |  7-9: 0  |  10-A: -1",
            font=Theme.FONT_NORMAL,
            bg=Theme.BG_DARK,
            fg=Theme.TEXT_SECONDARY
        ).pack()
        
        # Main content - two columns
        content_frame = tk.Frame(self, bg=Theme.BG_DARK)
        content_frame.pack(fill=tk.BOTH, expand=True, padx=Theme.PAD_LARGE)
        
        # Left column - Settings and controls
        left_frame = tk.Frame(content_frame, bg=Theme.BG_MEDIUM, padx=15, pady=15)
        left_frame.pack(side=tk.LEFT, fill=tk.Y, padx=Theme.PAD_MEDIUM)
        
        self._create_settings(left_frame)
        
        # Right column - Training area
        right_frame = tk.Frame(content_frame, bg=Theme.BG_DARK)
        right_frame.pack(side=tk.LEFT, fill=tk.BOTH, expand=True, padx=Theme.PAD_MEDIUM)
        
        self._create_training_area(right_frame)
        
        # Stats bar
        self._create_stats_bar()
    
    def _create_settings(self, parent: tk.Frame) -> None:
        """Create settings panel."""
        tk.Label(
            parent,
            text="Settings",
            font=Theme.FONT_SUBHEADING,
            bg=Theme.BG_MEDIUM,
            fg=Theme.ACCENT_GOLD
        ).pack(pady=(0, Theme.PAD_MEDIUM))
        
        # Number of decks
        deck_frame = tk.Frame(parent, bg=Theme.BG_MEDIUM)
        deck_frame.pack(fill=tk.X, pady=Theme.PAD_SMALL)
        
        tk.Label(
            deck_frame,
            text="Decks:",
            font=Theme.FONT_NORMAL,
            bg=Theme.BG_MEDIUM,
            fg=Theme.TEXT_PRIMARY,
            width=12,
            anchor=tk.W
        ).pack(side=tk.LEFT)
        
        self.deck_var = tk.StringVar(value=str(self.config.num_decks))
        deck_spinner = ttk.Spinbox(
            deck_frame,
            from_=1,
            to=8,
            width=5,
            textvariable=self.deck_var
        )
        deck_spinner.pack(side=tk.LEFT)
        
        # Drill type
        drill_frame = tk.Frame(parent, bg=Theme.BG_MEDIUM)
        drill_frame.pack(fill=tk.X, pady=Theme.PAD_SMALL)
        
        tk.Label(
            drill_frame,
            text="Drill Type:",
            font=Theme.FONT_NORMAL,
            bg=Theme.BG_MEDIUM,
            fg=Theme.TEXT_PRIMARY,
            width=12,
            anchor=tk.W
        ).pack(side=tk.LEFT)
        
        self.drill_var = tk.StringVar(value=self.config.drill_type)
        drill_combo = ttk.Combobox(
            drill_frame,
            textvariable=self.drill_var,
            values=["single_card", "hand", "round"],
            state="readonly",
            width=10
        )
        drill_combo.pack(side=tk.LEFT)
        
        # Cards per round (for single_card mode)
        cards_frame = tk.Frame(parent, bg=Theme.BG_MEDIUM)
        cards_frame.pack(fill=tk.X, pady=Theme.PAD_SMALL)
        
        tk.Label(
            cards_frame,
            text="Cards/Round:",
            font=Theme.FONT_NORMAL,
            bg=Theme.BG_MEDIUM,
            fg=Theme.TEXT_PRIMARY,
            width=12,
            anchor=tk.W
        ).pack(side=tk.LEFT)
        
        self.cards_var = tk.StringVar(value=str(self.config.cards_per_round))
        cards_spinner = ttk.Spinbox(
            cards_frame,
            from_=1,
            to=10,
            width=5,
            textvariable=self.cards_var
        )
        cards_spinner.pack(side=tk.LEFT)
        
        # Ask for true count
        tc_frame = tk.Frame(parent, bg=Theme.BG_MEDIUM)
        tc_frame.pack(fill=tk.X, pady=Theme.PAD_SMALL)
        
        self.tc_var = tk.BooleanVar(value=self.config.ask_true_count)
        tc_check = tk.Checkbutton(
            tc_frame,
            text="Ask True Count",
            variable=self.tc_var,
            font=Theme.FONT_NORMAL,
            bg=Theme.BG_MEDIUM,
            fg=Theme.TEXT_PRIMARY,
            selectcolor=Theme.BG_LIGHT,
            activebackground=Theme.BG_MEDIUM,
            activeforeground=Theme.TEXT_PRIMARY
        )
        tc_check.pack(anchor=tk.W)
        
        # Start/Stop button
        btn_frame = tk.Frame(parent, bg=Theme.BG_MEDIUM)
        btn_frame.pack(fill=tk.X, pady=Theme.PAD_LARGE)
        
        self.btn_start = tk.Button(
            btn_frame,
            text="Start Training",
            command=self._toggle_training,
            font=Theme.FONT_NORMAL,
            bg=Theme.ACCENT_GREEN,
            fg=Theme.TEXT_PRIMARY,
            activebackground="#2ecc71",
            width=15,
            cursor="hand2"
        )
        self.btn_start.pack()
    
    def _create_training_area(self, parent: tk.Frame) -> None:
        """Create the main training area."""
        # Cards display
        cards_container = tk.Frame(parent, bg=Theme.BG_MEDIUM, padx=20, pady=20)
        cards_container.pack(fill=tk.X, pady=Theme.PAD_MEDIUM)
        
        tk.Label(
            cards_container,
            text="Cards Dealt",
            font=Theme.FONT_SUBHEADING,
            bg=Theme.BG_MEDIUM,
            fg=Theme.ACCENT_GOLD
        ).pack()
        
        self.cards_display = tk.Frame(cards_container, bg=Theme.BG_MEDIUM)
        self.cards_display.pack(pady=Theme.PAD_MEDIUM)
        
        self.no_cards_label = tk.Label(
            self.cards_display,
            text="Press 'Start Training' to begin",
            font=Theme.FONT_NORMAL,
            bg=Theme.BG_MEDIUM,
            fg=Theme.TEXT_SECONDARY
        )
        self.no_cards_label.pack()
        
        # Input area
        input_frame = tk.Frame(parent, bg=Theme.BG_DARK)
        input_frame.pack(fill=tk.X, pady=Theme.PAD_MEDIUM)
        
        # Running count input
        rc_frame = tk.Frame(input_frame, bg=Theme.BG_DARK)
        rc_frame.pack(pady=Theme.PAD_SMALL)
        
        tk.Label(
            rc_frame,
            text="Running Count:",
            font=Theme.FONT_NORMAL,
            bg=Theme.BG_DARK,
            fg=Theme.TEXT_PRIMARY
        ).pack(side=tk.LEFT, padx=Theme.PAD_SMALL)
        
        self.rc_entry = tk.Entry(
            rc_frame,
            font=Theme.FONT_NORMAL,
            width=10,
            bg=Theme.BG_LIGHT,
            fg=Theme.TEXT_PRIMARY,
            insertbackground=Theme.TEXT_PRIMARY,
            justify=tk.CENTER
        )
        self.rc_entry.pack(side=tk.LEFT)
        self.rc_entry.bind('<Return>', lambda e: self._submit_guess())
        
        # True count input
        self.tc_input_frame = tk.Frame(input_frame, bg=Theme.BG_DARK)
        self.tc_input_frame.pack(pady=Theme.PAD_SMALL)
        
        tk.Label(
            self.tc_input_frame,
            text="True Count:",
            font=Theme.FONT_NORMAL,
            bg=Theme.BG_DARK,
            fg=Theme.TEXT_PRIMARY
        ).pack(side=tk.LEFT, padx=Theme.PAD_SMALL)
        
        self.tc_entry = tk.Entry(
            self.tc_input_frame,
            font=Theme.FONT_NORMAL,
            width=10,
            bg=Theme.BG_LIGHT,
            fg=Theme.TEXT_PRIMARY,
            insertbackground=Theme.TEXT_PRIMARY,
            justify=tk.CENTER
        )
        self.tc_entry.pack(side=tk.LEFT)
        self.tc_entry.bind('<Return>', lambda e: self._submit_guess())
        
        # Initially hide TC input
        self.tc_input_frame.pack_forget()
        
        # Buttons
        btn_frame = tk.Frame(input_frame, bg=Theme.BG_DARK)
        btn_frame.pack(pady=Theme.PAD_MEDIUM)
        
        self.btn_submit = tk.Button(
            btn_frame,
            text="Submit",
            command=self._submit_guess,
            font=Theme.FONT_NORMAL,
            bg=Theme.ACCENT_GOLD,
            fg=Theme.TEXT_DARK,
            activebackground="#f39c12",
            width=12,
            cursor="hand2",
            state=tk.DISABLED
        )
        self.btn_submit.pack(side=tk.LEFT, padx=Theme.PAD_SMALL)
        
        self.btn_next = tk.Button(
            btn_frame,
            text="Next Round",
            command=self._next_round,
            font=Theme.FONT_NORMAL,
            bg=Theme.ACCENT_BLUE,
            fg=Theme.TEXT_PRIMARY,
            activebackground="#2980b9",
            width=12,
            cursor="hand2",
            state=tk.DISABLED
        )
        self.btn_next.pack(side=tk.LEFT, padx=Theme.PAD_SMALL)
        
        # Feedback area
        self.feedback_frame = tk.Frame(parent, bg=Theme.BG_MEDIUM, padx=20, pady=15)
        self.feedback_frame.pack(fill=tk.X, pady=Theme.PAD_MEDIUM)
        
        self.feedback_label = tk.Label(
            self.feedback_frame,
            text="",
            font=Theme.FONT_NORMAL,
            bg=Theme.BG_MEDIUM,
            fg=Theme.TEXT_PRIMARY,
            wraplength=400,
            justify=tk.LEFT
        )
        self.feedback_label.pack()
    
    def _create_stats_bar(self) -> None:
        """Create the statistics bar."""
        stats_frame = tk.Frame(self, bg=Theme.BG_MEDIUM, height=60)
        stats_frame.pack(fill=tk.X, side=tk.BOTTOM)
        stats_frame.pack_propagate(False)
        
        # Stats labels
        self.stat_attempts = tk.Label(
            stats_frame,
            text="Attempts: 0",
            font=Theme.FONT_NORMAL,
            bg=Theme.BG_MEDIUM,
            fg=Theme.TEXT_PRIMARY
        )
        self.stat_attempts.pack(side=tk.LEFT, padx=Theme.PAD_LARGE)
        
        self.stat_accuracy = tk.Label(
            stats_frame,
            text="Accuracy: 0%",
            font=Theme.FONT_NORMAL,
            bg=Theme.BG_MEDIUM,
            fg=Theme.ACCENT_GREEN
        )
        self.stat_accuracy.pack(side=tk.LEFT, padx=Theme.PAD_LARGE)
        
        self.stat_streak = tk.Label(
            stats_frame,
            text="Streak: 0",
            font=Theme.FONT_NORMAL,
            bg=Theme.BG_MEDIUM,
            fg=Theme.ACCENT_GOLD
        )
        self.stat_streak.pack(side=tk.LEFT, padx=Theme.PAD_LARGE)
        
        self.stat_best = tk.Label(
            stats_frame,
            text="Best Streak: 0",
            font=Theme.FONT_NORMAL,
            bg=Theme.BG_MEDIUM,
            fg=Theme.ACCENT_GOLD
        )
        self.stat_best.pack(side=tk.LEFT, padx=Theme.PAD_LARGE)
        
        self.stat_decks = tk.Label(
            stats_frame,
            text="Decks: 6.0",
            font=Theme.FONT_NORMAL,
            bg=Theme.BG_MEDIUM,
            fg=Theme.TEXT_SECONDARY
        )
        self.stat_decks.pack(side=tk.RIGHT, padx=Theme.PAD_LARGE)
        
        self.stat_rc = tk.Label(
            stats_frame,
            text="Current RC: 0",
            font=Theme.FONT_NORMAL,
            bg=Theme.BG_MEDIUM,
            fg=Theme.ACCENT_BLUE
        )
        self.stat_rc.pack(side=tk.RIGHT, padx=Theme.PAD_LARGE)
    
    def _toggle_training(self) -> None:
        """Start or stop training."""
        if self.is_training:
            self._stop_training()
        else:
            self._start_training()
    
    def _start_training(self) -> None:
        """Start a new training session."""
        # Build a new config from UI inputs
        try:
            self.config = CountingTrainerConfig(
                num_decks=int(self.deck_var.get()),
                drill_type=self.drill_var.get(),
                cards_per_round=int(self.cards_var.get()),
                ask_true_count=self.tc_var.get(),
                speed_ms_per_card=self.config.speed_ms_per_card,
                time_limit_seconds=self.config.time_limit_seconds,
                show_history=self.config.show_history,
            )
        except (ValueError, TypeError):
            return

        # Start trainer
        self.trainer.start(self.config)
        self.is_training = True
        
        # Update UI
        self.btn_start.configure(text="Stop Training", bg=Theme.ACCENT_RED)
        self.btn_submit.configure(state=tk.NORMAL)
        self.btn_next.configure(state=tk.DISABLED)
        
        # Show/hide TC input
        if self.config.ask_true_count:
            self.tc_input_frame.pack(pady=Theme.PAD_SMALL)
        else:
            self.tc_input_frame.pack_forget()
        
        # Deal first round
        self._deal_round()
    
    def _stop_training(self) -> None:
        """Stop the training session."""
        final_stats = self.trainer.stop()
        self.is_training = False
        
        # Update UI
        self.btn_start.configure(text="Start Training", bg=Theme.ACCENT_GREEN)
        self.btn_submit.configure(state=tk.DISABLED)
        self.btn_next.configure(state=tk.DISABLED)
        
        # Show final stats
        self.feedback_label.configure(
            text=f"Training Complete!\n"
                 f"Total Attempts: {final_stats['attempts']}\n"
                 f"RC Accuracy: {final_stats['accuracy_rc']}%\n"
                 f"Best Streak: {final_stats['best_streak']}",
            fg=Theme.ACCENT_GOLD
        )
        
        # Clear cards
        self._clear_cards_display()
        self.no_cards_label.pack()
    
    def _deal_round(self) -> None:
        """Deal a new round of cards."""
        self.current_cards = self.trainer.next_round()
        self._display_cards()
        self._clear_inputs()
        self.feedback_label.configure(text="Enter your count guess", fg=Theme.TEXT_PRIMARY)
        self.btn_submit.configure(state=tk.NORMAL)
        self.btn_next.configure(state=tk.DISABLED)
        self.rc_entry.focus()
        self._update_stats_display()
    
    def _display_cards(self) -> None:
        """Display the dealt cards."""
        self._clear_cards_display()
        
        if not self.current_cards:
            self.no_cards_label.pack()
            return
        
        for card in self.current_cards:
            card_label = self._create_card_label(card)
            card_label.pack(side=tk.LEFT, padx=Theme.CARD_PADDING)
    
    def _clear_cards_display(self) -> None:
        """Clear the cards display."""
        for widget in self.cards_display.winfo_children():
            widget.destroy()
        
        # Recreate no_cards_label (it was destroyed)
        self.no_cards_label = tk.Label(
            self.cards_display,
            text="Press 'Start Training' to begin",
            font=Theme.FONT_NORMAL,
            bg=Theme.BG_MEDIUM,
            fg=Theme.TEXT_SECONDARY
        )
    
    def _create_card_label(self, card: Card) -> tk.Label:
        """Create a card display label."""
        is_red = card.suit.value in ("♥", "♦")
        fg_color = Theme.CARD_RED if is_red else Theme.CARD_BLACK
        
        return tk.Label(
            self.cards_display,
            text=str(card),
            font=Theme.FONT_CARD_LARGE,
            bg=Theme.BG_CARD,
            fg=fg_color,
            width=4,
            height=2,
            relief=tk.RAISED
        )
    
    def _clear_inputs(self) -> None:
        """Clear input fields."""
        self.rc_entry.delete(0, tk.END)
        self.tc_entry.delete(0, tk.END)
    
    def _submit_guess(self) -> None:
        """Submit the count guess."""
        if not self.is_training:
            return
        
        try:
            rc_guess = int(self.rc_entry.get())
        except ValueError:
            self.feedback_label.configure(
                text="Please enter a valid running count",
                fg=Theme.ACCENT_RED
            )
            return
        
        tc_guess = None
        if self.config.ask_true_count:
            try:
                tc_guess = float(self.tc_entry.get())
            except ValueError:
                self.feedback_label.configure(
                    text="Please enter a valid true count",
                    fg=Theme.ACCENT_RED
                )
                return
        
        # Submit to trainer
        result = self.trainer.submit_guess(rc_guess, tc_guess)
        
        # Show feedback
        self._show_feedback(result)
        
        # Update buttons
        self.btn_submit.configure(state=tk.DISABLED)
        self.btn_next.configure(state=tk.NORMAL)
        
        # Update stats
        self._update_stats_display()
    
    def _show_feedback(self, result: dict) -> None:
        """Show feedback for the guess."""
        lines = []
        
        # RC feedback
        if result['is_correct_rc']:
            lines.append(f"✓ Running Count: {result['expected_rc']} - Correct!")
            rc_color = Theme.ACCENT_GREEN
        else:
            lines.append(f"✗ Running Count: {result['expected_rc']} (you said {result['user_rc']})")
            rc_color = Theme.ACCENT_RED
        
        # TC feedback if applicable
        if result['is_correct_tc'] is not None:
            if result['is_correct_tc']:
                lines.append(f"✓ True Count: {result['expected_tc']} - Correct!")
            else:
                lines.append(f"✗ True Count: {result['expected_tc']} (you said {result['user_tc']})")
        
        # Card breakdown
        lines.append(f"\nCard values: {', '.join(result['delta_explanation'])}")
        lines.append(f"Decks remaining: {result['decks_remaining']}")
        
        self.feedback_label.configure(text="\n".join(lines), fg=rc_color)
    
    def _next_round(self) -> None:
        """Go to the next round."""
        if self.is_training:
            self._deal_round()
    
    def _update_stats_display(self) -> None:
        """Update the stats display."""
        stats = self.trainer.get_stats()
        
        self.stat_attempts.configure(text=f"Attempts: {stats['attempts']}")
        self.stat_accuracy.configure(text=f"Accuracy: {stats['accuracy_rc']}%")
        self.stat_streak.configure(text=f"Streak: {stats['streak']}")
        self.stat_best.configure(text=f"Best Streak: {stats['best_streak']}")
        
        decks = self.trainer.get_decks_remaining()
        self.stat_decks.configure(text=f"Decks: {decks:.1f}")
        self.stat_rc.configure(text=f"Current RC: {self.trainer.running_count}")
