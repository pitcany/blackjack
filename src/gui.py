"""Graphical User Interface for Blackjack game using Tkinter."""
import tkinter as tk
from tkinter import ttk, messagebox
from typing import Optional
from .game import BlackjackGame, GameState
from .card import Hand


class BlackjackGUI:
    """Main GUI class for Blackjack game."""

    def __init__(self, root: tk.Tk):
        """Initialize the GUI.

        Args:
            root: Tkinter root window
        """
        self.root = root
        self.root.title("Blackjack - Card Counting Simulator")
        self.root.geometry("1000x700")
        self.root.resizable(False, False)

        # Initialize game
        self.game = BlackjackGame()
        self.game.on_state_change = self.update_display

        # Color scheme
        self.bg_color = "#0D5C0D"  # Green felt
        self.card_bg = "#FFFFFF"
        self.text_color = "#FFFFFF"
        self.button_color = "#4CAF50"

        self._setup_ui()
        self.update_display()

    def _setup_ui(self):
        """Set up the user interface."""
        self.root.configure(bg=self.bg_color)

        # Main container
        main_frame = tk.Frame(self.root, bg=self.bg_color)
        main_frame.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)

        # Top section: Statistics and Card Counting
        self._create_top_section(main_frame)

        # Middle section: Game area
        self._create_game_area(main_frame)

        # Bottom section: Controls
        self._create_controls(main_frame)

    def _create_top_section(self, parent):
        """Create top section with stats and counting info."""
        top_frame = tk.Frame(parent, bg=self.bg_color)
        top_frame.pack(fill=tk.X, pady=(0, 10))

        # Left: Statistics
        stats_frame = tk.LabelFrame(top_frame, text="Statistics",
                                    bg=self.bg_color, fg=self.text_color,
                                    font=('Arial', 10, 'bold'))
        stats_frame.pack(side=tk.LEFT, fill=tk.BOTH, expand=True, padx=(0, 5))

        self.balance_label = tk.Label(stats_frame, text="Balance: $1000",
                                      bg=self.bg_color, fg=self.text_color,
                                      font=('Arial', 12, 'bold'))
        self.balance_label.pack(pady=2)

        self.stats_label = tk.Label(stats_frame, text="Rounds: 0 | Wins: 0 | Losses: 0",
                                    bg=self.bg_color, fg=self.text_color,
                                    font=('Arial', 10))
        self.stats_label.pack(pady=2)

        self.winrate_label = tk.Label(stats_frame, text="Win Rate: 0%",
                                      bg=self.bg_color, fg=self.text_color,
                                      font=('Arial', 10))
        self.winrate_label.pack(pady=2)

        # Right: Card Counting
        count_frame = tk.LabelFrame(top_frame, text="Card Counting (Hi-Lo)",
                                   bg=self.bg_color, fg=self.text_color,
                                   font=('Arial', 10, 'bold'))
        count_frame.pack(side=tk.RIGHT, fill=tk.BOTH, expand=True, padx=(5, 0))

        self.running_count_label = tk.Label(count_frame, text="Running Count: 0",
                                           bg=self.bg_color, fg=self.text_color,
                                           font=('Arial', 11))
        self.running_count_label.pack(pady=2)

        self.true_count_label = tk.Label(count_frame, text="True Count: 0.00",
                                        bg=self.bg_color, fg=self.text_color,
                                        font=('Arial', 11, 'bold'))
        self.true_count_label.pack(pady=2)

        self.count_status_label = tk.Label(count_frame, text="Status: Neutral",
                                          bg=self.bg_color, fg=self.text_color,
                                          font=('Arial', 10))
        self.count_status_label.pack(pady=2)

        self.suggested_bet_label = tk.Label(count_frame, text="Suggested Bet: $10",
                                           bg=self.bg_color, fg="#FFD700",
                                           font=('Arial', 10, 'bold'))
        self.suggested_bet_label.pack(pady=2)

    def _create_game_area(self, parent):
        """Create the main game playing area."""
        game_frame = tk.Frame(parent, bg=self.bg_color, relief=tk.SUNKEN, bd=2)
        game_frame.pack(fill=tk.BOTH, expand=True, pady=10)

        # Dealer section
        dealer_frame = tk.Frame(game_frame, bg=self.bg_color)
        dealer_frame.pack(pady=20)

        tk.Label(dealer_frame, text="Dealer", bg=self.bg_color,
                fg=self.text_color, font=('Arial', 14, 'bold')).pack()

        self.dealer_cards_frame = tk.Frame(dealer_frame, bg=self.bg_color)
        self.dealer_cards_frame.pack(pady=5)

        self.dealer_value_label = tk.Label(dealer_frame, text="",
                                          bg=self.bg_color, fg=self.text_color,
                                          font=('Arial', 12))
        self.dealer_value_label.pack()

        # Player section
        player_frame = tk.Frame(game_frame, bg=self.bg_color)
        player_frame.pack(pady=20)

        tk.Label(player_frame, text="Player", bg=self.bg_color,
                fg=self.text_color, font=('Arial', 14, 'bold')).pack()

        self.player_cards_frame = tk.Frame(player_frame, bg=self.bg_color)
        self.player_cards_frame.pack(pady=5)

        self.player_value_label = tk.Label(player_frame, text="",
                                          bg=self.bg_color, fg=self.text_color,
                                          font=('Arial', 12))
        self.player_value_label.pack()

        self.current_bet_label = tk.Label(player_frame, text="",
                                         bg=self.bg_color, fg="#FFD700",
                                         font=('Arial', 11, 'bold'))
        self.current_bet_label.pack()

        # Strategy recommendation
        self.strategy_label = tk.Label(game_frame, text="",
                                      bg=self.bg_color, fg="#00FF00",
                                      font=('Arial', 12, 'bold'))
        self.strategy_label.pack(pady=10)

    def _create_controls(self, parent):
        """Create control buttons and betting interface."""
        control_frame = tk.Frame(parent, bg=self.bg_color)
        control_frame.pack(fill=tk.X)

        # Betting section
        bet_frame = tk.LabelFrame(control_frame, text="Place Bet",
                                 bg=self.bg_color, fg=self.text_color,
                                 font=('Arial', 10, 'bold'))
        bet_frame.pack(side=tk.LEFT, fill=tk.Y, padx=(0, 10))

        # Bet amount entry
        bet_entry_frame = tk.Frame(bet_frame, bg=self.bg_color)
        bet_entry_frame.pack(pady=5, padx=5)

        tk.Label(bet_entry_frame, text="Amount: $", bg=self.bg_color,
                fg=self.text_color, font=('Arial', 10)).pack(side=tk.LEFT)

        self.bet_var = tk.StringVar(value="10")
        self.bet_entry = tk.Entry(bet_entry_frame, textvariable=self.bet_var,
                                 width=8, font=('Arial', 10))
        self.bet_entry.pack(side=tk.LEFT, padx=2)

        # Quick bet buttons
        quick_bet_frame = tk.Frame(bet_frame, bg=self.bg_color)
        quick_bet_frame.pack(pady=5)

        for amount in [10, 25, 50, 100]:
            btn = tk.Button(quick_bet_frame, text=f"${amount}",
                          command=lambda a=amount: self.set_bet(a),
                          bg=self.button_color, fg=self.text_color,
                          font=('Arial', 9), width=5)
            btn.pack(side=tk.LEFT, padx=2)

        # Use suggested bet button
        self.use_suggested_btn = tk.Button(bet_frame, text="Use Suggested Bet",
                                          command=self.use_suggested_bet,
                                          bg="#FFD700", fg="#000000",
                                          font=('Arial', 9, 'bold'))
        self.use_suggested_btn.pack(pady=5, padx=5)

        # Deal button
        self.deal_btn = tk.Button(bet_frame, text="DEAL",
                                 command=self.deal_cards,
                                 bg="#FF6347", fg=self.text_color,
                                 font=('Arial', 12, 'bold'),
                                 width=10, height=2)
        self.deal_btn.pack(pady=5, padx=5)

        # Action buttons
        action_frame = tk.LabelFrame(control_frame, text="Actions",
                                    bg=self.bg_color, fg=self.text_color,
                                    font=('Arial', 10, 'bold'))
        action_frame.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)

        buttons_grid = tk.Frame(action_frame, bg=self.bg_color)
        buttons_grid.pack(pady=10, padx=10)

        # Row 1
        self.hit_btn = tk.Button(buttons_grid, text="HIT",
                                command=self.hit,
                                bg=self.button_color, fg=self.text_color,
                                font=('Arial', 11, 'bold'),
                                width=12, height=2)
        self.hit_btn.grid(row=0, column=0, padx=5, pady=5)

        self.stand_btn = tk.Button(buttons_grid, text="STAND",
                                  command=self.stand,
                                  bg=self.button_color, fg=self.text_color,
                                  font=('Arial', 11, 'bold'),
                                  width=12, height=2)
        self.stand_btn.grid(row=0, column=1, padx=5, pady=5)

        # Row 2
        self.double_btn = tk.Button(buttons_grid, text="DOUBLE DOWN",
                                   command=self.double_down,
                                   bg=self.button_color, fg=self.text_color,
                                   font=('Arial', 11, 'bold'),
                                   width=12, height=2)
        self.double_btn.grid(row=1, column=0, padx=5, pady=5)

        self.split_btn = tk.Button(buttons_grid, text="SPLIT",
                                  command=self.split,
                                  bg=self.button_color, fg=self.text_color,
                                  font=('Arial', 11, 'bold'),
                                  width=12, height=2)
        self.split_btn.grid(row=1, column=1, padx=5, pady=5)

        # Row 3
        self.surrender_btn = tk.Button(buttons_grid, text="SURRENDER",
                                      command=self.surrender,
                                      bg="#FF8C00", fg=self.text_color,
                                      font=('Arial', 11, 'bold'),
                                      width=12, height=2)
        self.surrender_btn.grid(row=2, column=0, padx=5, pady=5)

        self.new_round_btn = tk.Button(buttons_grid, text="NEW ROUND",
                                      command=self.new_round,
                                      bg="#4169E1", fg=self.text_color,
                                      font=('Arial', 11, 'bold'),
                                      width=12, height=2)
        self.new_round_btn.grid(row=2, column=1, padx=5, pady=5)

    def _draw_card(self, parent, card, hide=False):
        """Draw a card on the GUI.

        Args:
            parent: Parent frame
            card: Card to draw
            hide: Whether to hide the card (show back)
        """
        card_frame = tk.Frame(parent, bg=self.card_bg, relief=tk.RAISED,
                            bd=3, width=60, height=90)
        card_frame.pack(side=tk.LEFT, padx=3)
        card_frame.pack_propagate(False)

        if hide:
            # Show card back
            tk.Label(card_frame, text="?", bg=self.card_bg,
                    font=('Arial', 36, 'bold')).pack(expand=True)
        else:
            # Determine card color
            color = "#FF0000" if card.suit.value in ['♥', '♦'] else "#000000"

            # Show card rank and suit
            tk.Label(card_frame, text=f"{card.rank}\n{card.suit.value}",
                    bg=self.card_bg, fg=color,
                    font=('Arial', 16, 'bold')).pack(expand=True)

    def update_display(self):
        """Update all display elements based on current game state."""
        # Update statistics
        stats = self.game.get_statistics()
        self.balance_label.config(text=f"Balance: ${stats['balance']}")
        self.stats_label.config(
            text=f"Rounds: {stats['rounds_played']} | "
                 f"Wins: {stats['rounds_won']} | "
                 f"Losses: {stats['rounds_lost']}"
        )
        self.winrate_label.config(text=f"Win Rate: {stats['win_rate']:.1f}%")

        # Update card counting
        self.running_count_label.config(
            text=f"Running Count: {stats['running_count']}"
        )
        self.true_count_label.config(
            text=f"True Count: {stats['true_count']:.2f}"
        )
        self.count_status_label.config(
            text=f"Status: {self.game.counter.get_count_status()}"
        )

        suggested_bet = self.game.get_suggested_bet()
        self.suggested_bet_label.config(
            text=f"Suggested Bet: ${suggested_bet}"
        )

        # Update cards display
        self._update_cards_display()

        # Update strategy recommendation
        self._update_strategy_display()

        # Update button states
        self._update_button_states()

    def _update_cards_display(self):
        """Update the display of dealer and player cards."""
        # Clear existing cards
        for widget in self.dealer_cards_frame.winfo_children():
            widget.destroy()
        for widget in self.player_cards_frame.winfo_children():
            widget.destroy()

        # Show dealer cards
        if self.game.dealer_hand and len(self.game.dealer_hand.cards) > 0:
            for i, card in enumerate(self.game.dealer_hand.cards):
                # Hide second card during player turn
                hide = (i == 1 and self.game.state == GameState.PLAYER_TURN)
                self._draw_card(self.dealer_cards_frame, card, hide)

            # Show dealer value
            if self.game.state == GameState.PLAYER_TURN:
                # Only show first card value
                first_card_value = self.game.dealer_hand.cards[0].value
                self.dealer_value_label.config(
                    text=f"Showing: {first_card_value}"
                )
            else:
                value = self.game.dealer_hand.get_value()
                soft_str = " (soft)" if self.game.dealer_hand.is_soft() else ""
                bust_str = " BUST!" if self.game.dealer_hand.is_bust() else ""
                self.dealer_value_label.config(
                    text=f"Value: {value}{soft_str}{bust_str}"
                )
        else:
            self.dealer_value_label.config(text="")

        # Show player cards
        if len(self.game.player_hands) > 0:
            current_hand = self.game.get_current_hand()
            if current_hand:
                for card in current_hand.cards:
                    self._draw_card(self.player_cards_frame, card)

                # Show player value
                value = current_hand.get_value()
                soft_str = " (soft)" if current_hand.is_soft() else ""
                bust_str = " BUST!" if current_hand.is_bust() else ""
                blackjack_str = " BLACKJACK!" if current_hand.is_blackjack() else ""
                self.player_value_label.config(
                    text=f"Value: {value}{soft_str}{bust_str}{blackjack_str}"
                )

                # Show current bet
                self.current_bet_label.config(
                    text=f"Current Bet: ${current_hand.bet}"
                )
        else:
            self.player_value_label.config(text="")
            self.current_bet_label.config(text="")

    def _update_strategy_display(self):
        """Update the strategy recommendation display."""
        if self.game.state == GameState.PLAYER_TURN:
            recommendation = self.game.get_recommendation()
            if recommendation:
                action_name = self.game.strategy.get_action_name(recommendation)
                self.strategy_label.config(
                    text=f"Basic Strategy Recommends: {action_name}"
                )
            else:
                self.strategy_label.config(text="")
        else:
            self.strategy_label.config(text="")

    def _update_button_states(self):
        """Update the enabled/disabled state of buttons."""
        # Betting controls
        can_bet = self.game.state == GameState.WAITING_FOR_BET
        self.bet_entry.config(state=tk.NORMAL if can_bet else tk.DISABLED)
        self.deal_btn.config(state=tk.NORMAL if can_bet else tk.DISABLED)
        self.use_suggested_btn.config(state=tk.NORMAL if can_bet else tk.DISABLED)

        # Action buttons
        self.hit_btn.config(state=tk.NORMAL if self.game.can_hit() else tk.DISABLED)
        self.stand_btn.config(state=tk.NORMAL if self.game.can_stand() else tk.DISABLED)
        self.double_btn.config(state=tk.NORMAL if self.game.can_double() else tk.DISABLED)
        self.split_btn.config(state=tk.NORMAL if self.game.can_split() else tk.DISABLED)
        self.surrender_btn.config(state=tk.NORMAL if self.game.can_surrender() else tk.DISABLED)

        # New round button
        can_new_round = self.game.state == GameState.ROUND_OVER
        self.new_round_btn.config(state=tk.NORMAL if can_new_round else tk.DISABLED)

    def set_bet(self, amount: int):
        """Set the bet amount.

        Args:
            amount: Bet amount
        """
        self.bet_var.set(str(amount))

    def use_suggested_bet(self):
        """Use the suggested bet from card counting."""
        suggested = self.game.get_suggested_bet()
        self.bet_var.set(str(suggested))

    def deal_cards(self):
        """Deal initial cards."""
        try:
            bet_amount = int(self.bet_var.get())
        except ValueError:
            messagebox.showerror("Invalid Bet", "Please enter a valid bet amount")
            return

        if not self.game.place_bet(bet_amount):
            if bet_amount < self.game.min_bet:
                messagebox.showerror("Invalid Bet",
                                   f"Minimum bet is ${self.game.min_bet}")
            elif bet_amount > self.game.max_bet:
                messagebox.showerror("Invalid Bet",
                                   f"Maximum bet is ${self.game.max_bet}")
            elif bet_amount > self.game.player_balance:
                messagebox.showerror("Insufficient Funds",
                                   "You don't have enough balance for this bet")
            else:
                messagebox.showerror("Error", "Cannot place bet at this time")

    def hit(self):
        """Player hits."""
        self.game.hit()

    def stand(self):
        """Player stands."""
        self.game.stand()

    def double_down(self):
        """Player doubles down."""
        self.game.double_down()

    def split(self):
        """Player splits."""
        self.game.split()

    def surrender(self):
        """Player surrenders."""
        self.game.surrender()

    def new_round(self):
        """Start a new round."""
        self.game.reset_round()

    def run(self):
        """Run the GUI main loop."""
        self.root.mainloop()


def main():
    """Main entry point for GUI."""
    root = tk.Tk()
    app = BlackjackGUI(root)
    app.run()


if __name__ == "__main__":
    main()
