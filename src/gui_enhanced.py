"""Enhanced GUI with save/load, CSV export, and advanced counting features."""
import tkinter as tk
from tkinter import ttk, messagebox, filedialog
from typing import Optional
from .game import BlackjackGame, GameState
from .card import Hand
from .persistence import GamePersistence
from .advanced_counter import AdvancedCounter, CountingSystem, DeviationIndices


class EnhancedBlackjackGUI:
    """Enhanced GUI with advanced features."""

    def __init__(self, root: tk.Tk):
        """Initialize the enhanced GUI.

        Args:
            root: Tkinter root window
        """
        self.root = root
        self.root.title("Blackjack Pro - Advanced Card Counting Simulator")
        self.root.geometry("1100x750")
        self.root.resizable(False, False)

        # Initialize game with advanced counter
        self.game = BlackjackGame()
        self.counting_system = CountingSystem.HI_LO
        self.use_deviations = tk.BooleanVar(value=False)

        # Replace counter with advanced counter
        self.game.counter = AdvancedCounter(
            self.game.deck,
            base_bet=self.game.min_bet,
            system=self.counting_system
        )

        self.game.on_state_change = self.update_display

        # Color scheme
        self.bg_color = "#0D5C0D"
        self.card_bg = "#FFFFFF"
        self.text_color = "#FFFFFF"
        self.button_color = "#2E7D32"  # Darker green for better contrast
        self.action_button_color = "#1565C0"  # Blue for main action buttons
        self.accent_color = "#FFD700"

        # Starting balance (can be configured)
        self.starting_balance = 1000

        self._create_menu()
        self._setup_ui()
        self.update_display()

    def _create_menu(self):
        """Create menu bar."""
        menubar = tk.Menu(self.root)
        self.root.config(menu=menubar)

        # File menu
        file_menu = tk.Menu(menubar, tearoff=0)
        menubar.add_cascade(label="File", menu=file_menu)
        file_menu.add_command(label="Save Game", command=self.save_game)
        file_menu.add_command(label="Load Game", command=self.load_game)
        file_menu.add_separator()
        file_menu.add_command(label="Export Statistics (CSV)", command=self.export_csv)
        file_menu.add_separator()
        file_menu.add_command(label="Exit", command=self.root.quit)

        # Settings menu
        settings_menu = tk.Menu(menubar, tearoff=0)
        menubar.add_cascade(label="Settings", menu=settings_menu)

        # Counting system submenu
        count_menu = tk.Menu(settings_menu, tearoff=0)
        settings_menu.add_cascade(label="Counting System", menu=count_menu)

        self.count_system_var = tk.StringVar(value="Hi-Lo")
        for system in CountingSystem:
            count_menu.add_radiobutton(
                label=system.value,
                variable=self.count_system_var,
                value=system.value,
                command=lambda s=system: self.change_counting_system(s)
            )

        settings_menu.add_checkbutton(
            label="Use Deviation Indices (Illustrious 18)",
            variable=self.use_deviations,
            command=self.update_display
        )

        settings_menu.add_separator()
        settings_menu.add_command(label="Set Starting Balance", command=self.set_starting_balance)
        settings_menu.add_command(label="Set Number of Decks", command=self.set_num_decks_dialog)

        # Help menu
        help_menu = tk.Menu(menubar, tearoff=0)
        menubar.add_cascade(label="Help", menu=help_menu)
        help_menu.add_command(label="Counting Systems", command=self.show_counting_help)
        help_menu.add_command(label="Deviation Indices", command=self.show_deviation_help)
        help_menu.add_command(label="About", command=self.show_about)

    def _setup_ui(self):
        """Set up the user interface."""
        self.root.configure(bg=self.bg_color)

        # Main container
        main_frame = tk.Frame(self.root, bg=self.bg_color)
        main_frame.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)

        # Top section
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

        # Middle: Card Counting
        count_frame = tk.LabelFrame(top_frame, text="Card Counting",
                                   bg=self.bg_color, fg=self.text_color,
                                   font=('Arial', 10, 'bold'))
        count_frame.pack(side=tk.LEFT, fill=tk.BOTH, expand=True, padx=5)

        self.system_label = tk.Label(count_frame, text="System: Hi-Lo",
                                     bg=self.bg_color, fg=self.accent_color,
                                     font=('Arial', 10, 'bold'))
        self.system_label.pack(pady=2)

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

        self.deck_count_label = tk.Label(count_frame, text="Decks in Shoe: 6",
                                         bg=self.bg_color, fg=self.text_color,
                                         font=('Arial', 10))
        self.deck_count_label.pack(pady=2)

        # Right: Bet Suggestion
        bet_frame = tk.LabelFrame(top_frame, text="Betting",
                                 bg=self.bg_color, fg=self.text_color,
                                 font=('Arial', 10, 'bold'))
        bet_frame.pack(side=tk.RIGHT, fill=tk.BOTH, expand=True, padx=(5, 0))

        self.suggested_bet_label = tk.Label(bet_frame, text="Suggested Bet: $10",
                                           bg=self.bg_color, fg=self.accent_color,
                                           font=('Arial', 11, 'bold'))
        self.suggested_bet_label.pack(pady=2)

        self.advantage_label = tk.Label(bet_frame, text="Advantage: 0.0%",
                                       bg=self.bg_color, fg=self.text_color,
                                       font=('Arial', 10))
        self.advantage_label.pack(pady=2)

        self.deviation_label = tk.Label(bet_frame, text="Deviations: OFF",
                                       bg=self.bg_color, fg=self.text_color,
                                       font=('Arial', 9))
        self.deviation_label.pack(pady=2)

    def _create_game_area(self, parent):
        """Create the main game playing area."""
        game_frame = tk.Frame(parent, bg=self.bg_color, relief=tk.SUNKEN, bd=2)
        game_frame.pack(fill=tk.BOTH, expand=True, pady=10)

        # Dealer section
        dealer_frame = tk.Frame(game_frame, bg=self.bg_color)
        dealer_frame.pack(pady=15)

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
        player_frame.pack(pady=15)

        tk.Label(player_frame, text="Player", bg=self.bg_color,
                fg=self.text_color, font=('Arial', 14, 'bold')).pack()

        self.player_cards_frame = tk.Frame(player_frame, bg=self.bg_color)
        self.player_cards_frame.pack(pady=5)

        self.player_value_label = tk.Label(player_frame, text="",
                                          bg=self.bg_color, fg=self.text_color,
                                          font=('Arial', 12))
        self.player_value_label.pack()

        self.current_bet_label = tk.Label(player_frame, text="",
                                         bg=self.bg_color, fg=self.accent_color,
                                         font=('Arial', 11, 'bold'))
        self.current_bet_label.pack()

        # Strategy recommendation
        self.strategy_label = tk.Label(game_frame, text="",
                                      bg=self.bg_color, fg="#00FF00",
                                      font=('Arial', 12, 'bold'))
        self.strategy_label.pack(pady=5)

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
        self.use_suggested_btn = tk.Button(bet_frame, text="Use Suggested",
                                          command=self.use_suggested_bet,
                                          bg=self.accent_color, fg="#000000",
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
                                bg=self.action_button_color, fg=self.text_color,
                                font=('Arial', 11, 'bold'),
                                width=12, height=2)
        self.hit_btn.grid(row=0, column=0, padx=5, pady=5)

        self.stand_btn = tk.Button(buttons_grid, text="STAND",
                                  command=self.stand,
                                  bg=self.action_button_color, fg=self.text_color,
                                  font=('Arial', 11, 'bold'),
                                  width=12, height=2)
        self.stand_btn.grid(row=0, column=1, padx=5, pady=5)

        # Row 2
        self.double_btn = tk.Button(buttons_grid, text="DOUBLE DOWN",
                                   command=self.double_down,
                                   bg=self.action_button_color, fg=self.text_color,
                                   font=('Arial', 11, 'bold'),
                                   width=12, height=2)
        self.double_btn.grid(row=1, column=0, padx=5, pady=5)

        self.split_btn = tk.Button(buttons_grid, text="SPLIT",
                                  command=self.split,
                                  bg=self.action_button_color, fg=self.text_color,
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
        """Draw a card on the GUI."""
        card_frame = tk.Frame(parent, bg=self.card_bg, relief=tk.RAISED,
                            bd=3, width=60, height=90)
        card_frame.pack(side=tk.LEFT, padx=3)
        card_frame.pack_propagate(False)

        if hide:
            tk.Label(card_frame, text="?", bg=self.card_bg,
                    font=('Arial', 36, 'bold')).pack(expand=True)
        else:
            color = "#FF0000" if card.suit.value in ['♥', '♦'] else "#000000"
            tk.Label(card_frame, text=f"{card.rank}\n{card.suit.value}",
                    bg=self.card_bg, fg=color,
                    font=('Arial', 16, 'bold')).pack(expand=True)

    # ... (rest of methods similar to BlackjackGUI)
    # I'll include the key new methods

    def save_game(self):
        """Save current game state."""
        filepath = GamePersistence.save_game(self.game)
        messagebox.showinfo("Game Saved",
                           f"Game saved successfully to:\n{filepath}")

    def load_game(self):
        """Load a saved game."""
        saves = GamePersistence.list_saves()
        if not saves:
            messagebox.showinfo("No Saves", "No saved games found.")
            return

        # Create dialog to select save
        dialog = tk.Toplevel(self.root)
        dialog.title("Load Game")
        dialog.geometry("400x300")

        tk.Label(dialog, text="Select a saved game:",
                font=('Arial', 12, 'bold')).pack(pady=10)

        listbox = tk.Listbox(dialog, font=('Arial', 10))
        listbox.pack(fill=tk.BOTH, expand=True, padx=10, pady=5)

        for filename, filepath, timestamp in saves:
            listbox.insert(tk.END, f"{timestamp.strftime('%Y-%m-%d %H:%M')} - {filename}")

        def load_selected():
            selection = listbox.curselection()
            if selection:
                idx = selection[0]
                filepath = saves[idx][1]
                game_state = GamePersistence.load_game(filepath)
                GamePersistence.restore_game(self.game, game_state)
                self.update_display()
                dialog.destroy()
                messagebox.showinfo("Game Loaded", "Game loaded successfully!")

        tk.Button(dialog, text="Load", command=load_selected,
                 font=('Arial', 11, 'bold')).pack(pady=10)

    def export_csv(self):
        """Export statistics to CSV."""
        filepath = GamePersistence.export_statistics_csv(self.game)
        messagebox.showinfo("Export Complete",
                           f"Statistics exported to:\n{filepath}")

    def change_counting_system(self, system: CountingSystem):
        """Change the counting system."""
        self.counting_system = system
        self.game.counter = AdvancedCounter(
            self.game.deck,
            base_bet=self.game.min_bet,
            system=system
        )
        self.game.deck.reset()
        self.game.counter.reset()
        self.update_display()
        messagebox.showinfo("Counting System",
                           f"Changed to {system.value}\nDeck has been reset.")

    def set_starting_balance(self):
        """Set the starting balance for new games."""
        dialog = tk.Toplevel(self.root)
        dialog.title("Set Starting Balance")
        dialog.geometry("350x200")
        dialog.transient(self.root)
        dialog.grab_set()

        tk.Label(dialog, text="Set Starting Balance",
                font=('Arial', 14, 'bold')).pack(pady=15)

        tk.Label(dialog, text="Enter the starting balance for new games:",
                font=('Arial', 10)).pack(pady=5)

        # Balance entry
        entry_frame = tk.Frame(dialog)
        entry_frame.pack(pady=10)

        tk.Label(entry_frame, text="$", font=('Arial', 12)).pack(side=tk.LEFT)

        balance_var = tk.StringVar(value=str(self.starting_balance))
        balance_entry = tk.Entry(entry_frame, textvariable=balance_var,
                                font=('Arial', 12), width=10)
        balance_entry.pack(side=tk.LEFT, padx=5)
        balance_entry.focus()
        balance_entry.select_range(0, tk.END)

        def save_balance():
            try:
                new_balance = int(balance_var.get())
                if new_balance < 100:
                    messagebox.showerror("Invalid Balance",
                                       "Balance must be at least $100")
                    return
                if new_balance > 1000000:
                    messagebox.showerror("Invalid Balance",
                                       "Balance cannot exceed $1,000,000")
                    return

                self.starting_balance = new_balance
                dialog.destroy()

                # Ask if user wants to reset current game
                if messagebox.askyesno("Reset Game?",
                                      f"Starting balance set to ${new_balance}\n\n"
                                      "Reset current game with new balance?"):
                    self.game.player_balance = new_balance
                    self.game.reset_round()
                    self.update_display()
                    messagebox.showinfo("Game Reset",
                                      f"Game reset with ${new_balance} balance")

            except ValueError:
                messagebox.showerror("Invalid Input",
                                   "Please enter a valid number")

        # Buttons
        btn_frame = tk.Frame(dialog)
        btn_frame.pack(pady=15)

        tk.Button(btn_frame, text="Save", command=save_balance,
                 font=('Arial', 11, 'bold'), width=10,
                 bg="#4CAF50", fg="white").pack(side=tk.LEFT, padx=5)

        tk.Button(btn_frame, text="Cancel", command=dialog.destroy,
                 font=('Arial', 11), width=10).pack(side=tk.LEFT, padx=5)

    def set_num_decks_dialog(self):
        """Open dialog to set number of decks."""
        # Check if can change settings
        if self.game.state != GameState.WAITING_FOR_BET:
            messagebox.showerror("Cannot Change Settings",
                               "Cannot change deck settings during an active round.\n\n"
                               "Please finish or stand on the current round first.")
            return

        dialog = tk.Toplevel(self.root)
        dialog.title("Set Number of Decks")
        dialog.geometry("400x280")
        dialog.transient(self.root)
        dialog.grab_set()

        tk.Label(dialog, text="Set Number of Decks",
                font=('Arial', 14, 'bold')).pack(pady=15)

        tk.Label(dialog, text="Select the number of decks in the shoe:",
                font=('Arial', 10)).pack(pady=5)

        # Deck count selector
        deck_frame = tk.Frame(dialog)
        deck_frame.pack(pady=10)

        tk.Label(deck_frame, text="Decks:", font=('Arial', 12)).pack(side=tk.LEFT, padx=5)

        deck_var = tk.IntVar(value=self.game.get_num_decks())
        deck_spinbox = tk.Spinbox(deck_frame, from_=1, to=8,
                                 textvariable=deck_var,
                                 font=('Arial', 12), width=5,
                                 state='readonly')
        deck_spinbox.pack(side=tk.LEFT, padx=5)

        # Warning message
        warning_frame = tk.Frame(dialog, bg="#FFF9C4", relief=tk.RIDGE, bd=2)
        warning_frame.pack(pady=15, padx=20, fill=tk.X)

        tk.Label(warning_frame, text="⚠ Warning",
                font=('Arial', 10, 'bold'),
                bg="#FFF9C4").pack(pady=(5, 0))

        tk.Label(warning_frame,
                text="Changing the number of decks will:\n"
                     "• Shuffle a new shoe\n"
                     "• Reset the card count to 0\n"
                     "• Preserve your balance and statistics",
                font=('Arial', 9),
                bg="#FFF9C4",
                justify=tk.LEFT).pack(pady=(0, 5), padx=10)

        def save_deck_count():
            new_deck_count = deck_var.get()

            if new_deck_count == self.game.get_num_decks():
                dialog.destroy()
                return

            success = self.game.set_num_decks(new_deck_count)

            if success:
                dialog.destroy()
                self.update_display()
                messagebox.showinfo("Deck Count Updated",
                                  f"Number of decks set to {new_deck_count}\n\n"
                                  f"A fresh shoe has been shuffled and the count reset.")
            else:
                messagebox.showerror("Error",
                                   "Failed to update deck count. Please try again.")

        # Buttons
        btn_frame = tk.Frame(dialog)
        btn_frame.pack(pady=15)

        tk.Button(btn_frame, text="Save", command=save_deck_count,
                 font=('Arial', 11, 'bold'), width=10,
                 bg="#4CAF50", fg="white").pack(side=tk.LEFT, padx=5)

        tk.Button(btn_frame, text="Cancel", command=dialog.destroy,
                 font=('Arial', 11), width=10).pack(side=tk.LEFT, padx=5)

    def show_counting_help(self):
        """Show counting systems help."""
        help_text = """Card Counting Systems:

Hi-Lo (Balanced):
• 2-6: +1
• 7-9: 0
• 10-A: -1
• Most popular, easy to learn

Knock-Out/KO (Unbalanced):
• 2-7: +1
• 8-9: 0
• 10-A: -1
• No true count conversion needed
• Key count = decks - 1

Omega II (Balanced):
• 2,3,7: +1
• 4,5,6: +2
• 9: -1
• 10-K: -2
• A: 0
• More accurate but complex"""

        messagebox.showinfo("Counting Systems", help_text)

    def show_deviation_help(self):
        """Show deviation indices help."""
        help_text = """Deviation Indices (Illustrious 18):

Strategy deviations based on true count
for maximum advantage.

Key deviations:
• 16 vs 10: Stand at TC 0+
• 15 vs 10: Surrender at TC 0+
• 13 vs 2-3: Stand at negative counts
• 12 vs 2-6: Stand at various counts
• 11 vs A: Double at TC +1
• 10 vs 10/A: Double at TC +4

Enable in Settings menu to use."""

        messagebox.showinfo("Deviation Indices", help_text)

    def show_about(self):
        """Show about dialog."""
        about_text = """Blackjack Pro
Advanced Card Counting Simulator

Version 2.0

Features:
• Multiple counting systems
• Deviation indices (Illustrious 18)
• Save/Load games
• CSV statistics export
• Professional basic strategy

For educational purposes only."""

        messagebox.showinfo("About", about_text)

    def update_display(self):
        """Update all display elements."""
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
        self.system_label.config(
            text=f"System: {self.game.counter.get_system_name()}"
        )
        self.running_count_label.config(
            text=f"Running Count: {stats['running_count']}"
        )
        self.true_count_label.config(
            text=f"True Count: {stats['true_count']:.2f}"
        )
        self.count_status_label.config(
            text=f"Status: {self.game.counter.get_count_status()}"
        )
        self.deck_count_label.config(
            text=f"Decks in Shoe: {self.game.get_num_decks()}"
        )

        # Update betting info
        suggested_bet = self.game.get_suggested_bet()
        self.suggested_bet_label.config(
            text=f"Suggested Bet: ${suggested_bet}"
        )

        advantage = self.game.counter.get_advantage()
        self.advantage_label.config(
            text=f"Advantage: {advantage:+.2f}%"
        )

        deviation_status = "ON" if self.use_deviations.get() else "OFF"
        self.deviation_label.config(
            text=f"Deviations: {deviation_status}"
        )

        # Update cards display
        self._update_cards_display()

        # Update strategy recommendation (with deviations if enabled)
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
                hide = (i == 1 and self.game.state == GameState.PLAYER_TURN)
                self._draw_card(self.dealer_cards_frame, card, hide)

            if self.game.state == GameState.PLAYER_TURN:
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

                value = current_hand.get_value()
                soft_str = " (soft)" if current_hand.is_soft() else ""
                bust_str = " BUST!" if current_hand.is_bust() else ""
                blackjack_str = " BLACKJACK!" if current_hand.is_blackjack() else ""
                self.player_value_label.config(
                    text=f"Value: {value}{soft_str}{bust_str}{blackjack_str}"
                )

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

            # Apply deviation indices if enabled
            if self.use_deviations.get() and recommendation:
                hand = self.game.get_current_hand()
                dealer_card = self.game.dealer_hand.cards[0]
                true_count = self.game.counter.get_true_count()

                # Check for deviation
                deviated_action = DeviationIndices.get_deviation(
                    hand, dealer_card, true_count, recommendation
                )

                if deviated_action != recommendation:
                    action_name = self.game.strategy.get_action_name(deviated_action)
                    self.strategy_label.config(
                        text=f"Strategy: {action_name} (DEVIATION at TC {true_count:+.1f})",
                        fg="#FF00FF"  # Magenta for deviations
                    )
                else:
                    action_name = self.game.strategy.get_action_name(recommendation)
                    self.strategy_label.config(
                        text=f"Basic Strategy: {action_name}",
                        fg="#00FF00"
                    )
            elif recommendation:
                action_name = self.game.strategy.get_action_name(recommendation)
                self.strategy_label.config(
                    text=f"Basic Strategy: {action_name}",
                    fg="#00FF00"
                )
        else:
            self.strategy_label.config(text="")

    def _update_button_states(self):
        """Update the enabled/disabled state of buttons."""
        can_bet = self.game.state == GameState.WAITING_FOR_BET
        self.bet_entry.config(state=tk.NORMAL if can_bet else tk.DISABLED)
        self.deal_btn.config(state=tk.NORMAL if can_bet else tk.DISABLED)
        self.use_suggested_btn.config(state=tk.NORMAL if can_bet else tk.DISABLED)

        self.hit_btn.config(state=tk.NORMAL if self.game.can_hit() else tk.DISABLED)
        self.stand_btn.config(state=tk.NORMAL if self.game.can_stand() else tk.DISABLED)
        self.double_btn.config(state=tk.NORMAL if self.game.can_double() else tk.DISABLED)
        self.split_btn.config(state=tk.NORMAL if self.game.can_split() else tk.DISABLED)
        self.surrender_btn.config(state=tk.NORMAL if self.game.can_surrender() else tk.DISABLED)

        can_new_round = self.game.state == GameState.ROUND_OVER
        self.new_round_btn.config(state=tk.NORMAL if can_new_round else tk.DISABLED)

    # Game action methods (same as original GUI)
    def set_bet(self, amount: int):
        """Set the bet amount."""
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
    """Main entry point for enhanced GUI."""
    root = tk.Tk()
    app = EnhancedBlackjackGUI(root)
    app.run()


if __name__ == "__main__":
    main()
