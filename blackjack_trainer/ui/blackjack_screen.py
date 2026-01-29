"""Blackjack game screen."""

import tkinter as tk
from tkinter import ttk, messagebox
from typing import Callable, List

from .theme import Theme
from blackjack import (
    BlackjackEngine, GamePhase, Action, Card, PlayerHandState,
    format_hand, best_total_and_soft, is_bust
)


class BlackjackScreen(tk.Frame):
    """Blackjack game interface."""
    
    def __init__(
        self, 
        parent: tk.Widget, 
        engine: BlackjackEngine,
        on_update: Callable[[], None]
    ):
        """Initialize the Blackjack screen."""
        super().__init__(parent, bg=Theme.BG_DARK)
        
        self.engine = engine
        self.on_update = on_update
        
        self._create_ui()
        self._refresh_display()
    
    def _create_ui(self) -> None:
        """Create the UI components."""
        # Dealer area
        self.dealer_frame = tk.Frame(self, bg=Theme.BG_DARK)
        self.dealer_frame.pack(fill=tk.X, padx=Theme.PAD_LARGE, pady=Theme.PAD_MEDIUM)
        
        tk.Label(
            self.dealer_frame,
            text="DEALER",
            font=Theme.FONT_SUBHEADING,
            bg=Theme.BG_DARK,
            fg=Theme.ACCENT_GOLD
        ).pack()
        
        self.dealer_cards_frame = tk.Frame(self.dealer_frame, bg=Theme.BG_DARK)
        self.dealer_cards_frame.pack(pady=Theme.PAD_SMALL)
        
        self.dealer_total_label = tk.Label(
            self.dealer_frame,
            text="",
            font=Theme.FONT_NORMAL,
            bg=Theme.BG_DARK,
            fg=Theme.TEXT_PRIMARY
        )
        self.dealer_total_label.pack()
        
        # Separator
        ttk.Separator(self, orient=tk.HORIZONTAL).pack(fill=tk.X, pady=Theme.PAD_MEDIUM)
        
        # Player area
        self.player_frame = tk.Frame(self, bg=Theme.BG_DARK)
        self.player_frame.pack(fill=tk.BOTH, expand=True, padx=Theme.PAD_LARGE)
        
        tk.Label(
            self.player_frame,
            text="YOUR HANDS",
            font=Theme.FONT_SUBHEADING,
            bg=Theme.BG_DARK,
            fg=Theme.ACCENT_GOLD
        ).pack()
        
        self.hands_container = tk.Frame(self.player_frame, bg=Theme.BG_DARK)
        self.hands_container.pack(fill=tk.BOTH, expand=True, pady=Theme.PAD_SMALL)
        
        # Message area
        self.message_label = tk.Label(
            self,
            text="",
            font=Theme.FONT_SUBHEADING,
            bg=Theme.BG_DARK,
            fg=Theme.ACCENT_GOLD
        )
        self.message_label.pack(pady=Theme.PAD_MEDIUM)
        
        # Action buttons
        self.action_frame = tk.Frame(self, bg=Theme.BG_DARK)
        self.action_frame.pack(fill=tk.X, padx=Theme.PAD_LARGE, pady=Theme.PAD_MEDIUM)
        
        self._create_action_buttons()
        
        # Betting area
        self.betting_frame = tk.Frame(self, bg=Theme.BG_DARK)
        self.betting_frame.pack(fill=tk.X, padx=Theme.PAD_LARGE, pady=Theme.PAD_MEDIUM)
        
        self._create_betting_area()
    
    def _create_action_buttons(self) -> None:
        """Create action buttons."""
        btn_style = {
            "font": Theme.FONT_NORMAL,
            "width": Theme.BTN_WIDTH,
            "cursor": "hand2"
        }
        
        self.btn_hit = tk.Button(
            self.action_frame,
            text="HIT",
            command=lambda: self._do_action(Action.HIT),
            bg=Theme.ACCENT_GREEN,
            fg=Theme.TEXT_PRIMARY,
            activebackground="#2ecc71",
            **btn_style
        )
        self.btn_hit.pack(side=tk.LEFT, padx=Theme.PAD_SMALL)
        
        self.btn_stand = tk.Button(
            self.action_frame,
            text="STAND",
            command=lambda: self._do_action(Action.STAND),
            bg=Theme.ACCENT_RED,
            fg=Theme.TEXT_PRIMARY,
            activebackground="#c0392b",
            **btn_style
        )
        self.btn_stand.pack(side=tk.LEFT, padx=Theme.PAD_SMALL)
        
        self.btn_double = tk.Button(
            self.action_frame,
            text="DOUBLE",
            command=lambda: self._do_action(Action.DOUBLE),
            bg=Theme.ACCENT_BLUE,
            fg=Theme.TEXT_PRIMARY,
            activebackground="#2980b9",
            **btn_style
        )
        self.btn_double.pack(side=tk.LEFT, padx=Theme.PAD_SMALL)
        
        self.btn_split = tk.Button(
            self.action_frame,
            text="SPLIT",
            command=lambda: self._do_action(Action.SPLIT),
            bg=Theme.ACCENT_GOLD,
            fg=Theme.TEXT_DARK,
            activebackground="#f39c12",
            **btn_style
        )
        self.btn_split.pack(side=tk.LEFT, padx=Theme.PAD_SMALL)
        
        # Insurance buttons (initially hidden)
        self.insurance_frame = tk.Frame(self.action_frame, bg=Theme.BG_DARK)
        
        self.btn_insurance_yes = tk.Button(
            self.insurance_frame,
            text="TAKE INSURANCE",
            command=lambda: self._take_insurance(True),
            bg=Theme.ACCENT_GREEN,
            fg=Theme.TEXT_PRIMARY,
            **btn_style
        )
        self.btn_insurance_yes.pack(side=tk.LEFT, padx=Theme.PAD_SMALL)
        
        self.btn_insurance_no = tk.Button(
            self.insurance_frame,
            text="NO INSURANCE",
            command=lambda: self._take_insurance(False),
            bg=Theme.ACCENT_RED,
            fg=Theme.TEXT_PRIMARY,
            **btn_style
        )
        self.btn_insurance_no.pack(side=tk.LEFT, padx=Theme.PAD_SMALL)
    
    def _create_betting_area(self) -> None:
        """Create the betting area."""
        tk.Label(
            self.betting_frame,
            text="Bet Amount: $",
            font=Theme.FONT_NORMAL,
            bg=Theme.BG_DARK,
            fg=Theme.TEXT_PRIMARY
        ).pack(side=tk.LEFT)
        
        self.bet_entry = tk.Entry(
            self.betting_frame,
            font=Theme.FONT_NORMAL,
            width=10,
            bg=Theme.BG_LIGHT,
            fg=Theme.TEXT_PRIMARY,
            insertbackground=Theme.TEXT_PRIMARY
        )
        self.bet_entry.pack(side=tk.LEFT, padx=Theme.PAD_SMALL)
        self.bet_entry.insert(0, str(self.engine.config.min_bet))
        
        self.btn_deal = tk.Button(
            self.betting_frame,
            text="DEAL",
            command=self._deal,
            font=Theme.FONT_NORMAL,
            bg=Theme.ACCENT_GOLD,
            fg=Theme.TEXT_DARK,
            activebackground="#f39c12",
            width=Theme.BTN_WIDTH,
            cursor="hand2"
        )
        self.btn_deal.pack(side=tk.LEFT, padx=Theme.PAD_SMALL)
        
        self.btn_new_round = tk.Button(
            self.betting_frame,
            text="NEW ROUND",
            command=self._new_round,
            font=Theme.FONT_NORMAL,
            bg=Theme.BG_LIGHT,
            fg=Theme.TEXT_PRIMARY,
            activebackground=Theme.ACCENT_GOLD,
            width=Theme.BTN_WIDTH,
            cursor="hand2"
        )
        self.btn_new_round.pack(side=tk.LEFT, padx=Theme.PAD_SMALL)
        
        # Quick bet buttons
        quick_bet_frame = tk.Frame(self.betting_frame, bg=Theme.BG_DARK)
        quick_bet_frame.pack(side=tk.RIGHT, padx=Theme.PAD_MEDIUM)
        
        tk.Label(
            quick_bet_frame,
            text="Quick Bet:",
            font=Theme.FONT_SMALL,
            bg=Theme.BG_DARK,
            fg=Theme.TEXT_SECONDARY
        ).pack(side=tk.LEFT)
        
        for amount in [10, 25, 50, 100]:
            btn = tk.Button(
                quick_bet_frame,
                text=f"${amount}",
                command=lambda a=amount: self._set_bet(a),
                font=Theme.FONT_SMALL,
                bg=Theme.BG_LIGHT,
                fg=Theme.TEXT_PRIMARY,
                width=5,
                cursor="hand2"
            )
            btn.pack(side=tk.LEFT, padx=2)
    
    def _set_bet(self, amount: int) -> None:
        """Set the bet amount."""
        self.bet_entry.delete(0, tk.END)
        self.bet_entry.insert(0, str(amount))
    
    def _deal(self) -> None:
        """Start a new round."""
        try:
            bet = int(self.bet_entry.get())
        except ValueError:
            messagebox.showerror("Invalid Bet", "Please enter a valid bet amount")
            return
        
        if self.engine.start_round(bet):
            self.engine.deal_initial()
        self._refresh_display()
        self.on_update()
    
    def _do_action(self, action: Action) -> None:
        """Perform a game action."""
        state = self.engine.get_state()
        if state.phase != GamePhase.PLAYER_TURN:
            return
        
        available = self.engine.available_actions()
        if action not in available:
            return
        
        self.engine.act(action)
        self._refresh_display()
        self.on_update()
    
    def _take_insurance(self, take: bool) -> None:
        """Handle insurance decision."""
        self.engine.take_insurance(take)
        self._refresh_display()
        self.on_update()
    
    def _new_round(self) -> None:
        """Start a new round."""
        self.engine.next_round()
        self._refresh_display()
        self.on_update()
    
    def _refresh_display(self) -> None:
        """Refresh the display with current state."""
        state = self.engine.get_state()
        
        # Update message
        self.message_label.configure(text=state.message)
        
        # Update dealer cards
        self._display_dealer_cards(state)
        
        # Update player hands
        self._display_player_hands(state)
        
        # Update button states
        self._update_buttons(state)
    
    def _display_dealer_cards(self, state) -> None:
        """Display dealer's cards."""
        # Clear existing cards
        for widget in self.dealer_cards_frame.winfo_children():
            widget.destroy()
        
        if not state.dealer_cards:
            self.dealer_total_label.configure(text="")
            return
        
        # Show cards
        show_hole = state.phase in (GamePhase.DEALER_TURN, GamePhase.ROUND_OVER)
        
        for i, card in enumerate(state.dealer_cards):
            if i == 1 and not show_hole:
                # Hide hole card
                card_label = self._create_card_label(self.dealer_cards_frame, None)
            else:
                card_label = self._create_card_label(self.dealer_cards_frame, card)
            card_label.pack(side=tk.LEFT, padx=Theme.CARD_PADDING)
        
        # Show total
        if show_hole:
            total, is_soft = best_total_and_soft(state.dealer_cards)
            soft_str = " (soft)" if is_soft else ""
            self.dealer_total_label.configure(text=f"Total: {total}{soft_str}")
        else:
            # Show only upcard value
            upcard_total = state.dealer_cards[0].base_value
            self.dealer_total_label.configure(text=f"Showing: {upcard_total}")
    
    def _display_player_hands(self, state) -> None:
        """Display player's hands."""
        # Clear existing hands
        for widget in self.hands_container.winfo_children():
            widget.destroy()
        
        if not state.player_hands:
            return
        
        for i, hand in enumerate(state.player_hands):
            hand_frame = tk.Frame(self.hands_container, bg=Theme.BG_MEDIUM, padx=10, pady=10)
            hand_frame.pack(side=tk.LEFT, padx=Theme.PAD_MEDIUM, pady=Theme.PAD_SMALL)
            
            # Highlight active hand
            if hand.is_active and state.phase == GamePhase.PLAYER_TURN:
                hand_frame.configure(bg=Theme.BG_LIGHT, highlightbackground=Theme.ACCENT_GOLD, highlightthickness=2)
            
            # Hand label
            hand_label = f"Hand {i + 1}" if len(state.player_hands) > 1 else "Your Hand"
            if hand.is_doubled:
                hand_label += " (Doubled)"
            if hand.result:
                hand_label += f" - {hand.result}"
            
            tk.Label(
                hand_frame,
                text=hand_label,
                font=Theme.FONT_SMALL,
                bg=hand_frame.cget("bg"),
                fg=Theme.ACCENT_GOLD
            ).pack()
            
            # Cards
            cards_row = tk.Frame(hand_frame, bg=hand_frame.cget("bg"))
            cards_row.pack(pady=Theme.PAD_SMALL)
            
            for card in hand.cards:
                card_label = self._create_card_label(cards_row, card)
                card_label.pack(side=tk.LEFT, padx=2)
            
            # Total and bet
            total, is_soft = best_total_and_soft(hand.cards)
            soft_str = " (soft)" if is_soft else ""
            bust_str = " BUST!" if is_bust(hand.cards) else ""
            
            tk.Label(
                hand_frame,
                text=f"Total: {total}{soft_str}{bust_str}",
                font=Theme.FONT_NORMAL,
                bg=hand_frame.cget("bg"),
                fg=Theme.ACCENT_RED if is_bust(hand.cards) else Theme.TEXT_PRIMARY
            ).pack()
            
            tk.Label(
                hand_frame,
                text=f"Bet: ${hand.bet}",
                font=Theme.FONT_SMALL,
                bg=hand_frame.cget("bg"),
                fg=Theme.ACCENT_GOLD
            ).pack()
    
    def _create_card_label(self, parent: tk.Widget, card: Card | None) -> tk.Label:
        """Create a card display label."""
        if card is None:
            # Face down card
            return tk.Label(
                parent,
                text="🂠",
                font=Theme.FONT_CARD_LARGE,
                bg=Theme.BG_LIGHT,
                fg=Theme.ACCENT_BLUE,
                width=3,
                height=2,
                relief=tk.RAISED
            )
        
        # Determine color
        is_red = card.suit.value in ("♥", "♦")
        fg_color = Theme.CARD_RED if is_red else Theme.CARD_BLACK
        
        return tk.Label(
            parent,
            text=str(card),
            font=Theme.FONT_CARD,
            bg=Theme.BG_CARD,
            fg=fg_color,
            width=4,
            height=2,
            relief=tk.RAISED
        )
    
    def _update_buttons(self, state) -> None:
        """Update button states based on game phase."""
        phase = state.phase
        
        # Hide/show insurance buttons
        if phase == GamePhase.INSURANCE_OFFER:
            self.insurance_frame.pack(side=tk.LEFT, padx=Theme.PAD_MEDIUM)
            self.btn_hit.pack_forget()
            self.btn_stand.pack_forget()
            self.btn_double.pack_forget()
            self.btn_split.pack_forget()
        else:
            self.insurance_frame.pack_forget()
            self.btn_hit.pack(side=tk.LEFT, padx=Theme.PAD_SMALL)
            self.btn_stand.pack(side=tk.LEFT, padx=Theme.PAD_SMALL)
            self.btn_double.pack(side=tk.LEFT, padx=Theme.PAD_SMALL)
            self.btn_split.pack(side=tk.LEFT, padx=Theme.PAD_SMALL)
        
        # Enable/disable action buttons
        if phase == GamePhase.PLAYER_TURN:
            available = self.engine.available_actions()
            self.btn_hit.configure(state=tk.NORMAL if Action.HIT in available else tk.DISABLED)
            self.btn_stand.configure(state=tk.NORMAL if Action.STAND in available else tk.DISABLED)
            self.btn_double.configure(state=tk.NORMAL if Action.DOUBLE in available else tk.DISABLED)
            self.btn_split.configure(state=tk.NORMAL if Action.SPLIT in available else tk.DISABLED)
        else:
            self.btn_hit.configure(state=tk.DISABLED)
            self.btn_stand.configure(state=tk.DISABLED)
            self.btn_double.configure(state=tk.DISABLED)
            self.btn_split.configure(state=tk.DISABLED)
        
        # Enable/disable betting
        is_betting = phase in (GamePhase.BETTING, GamePhase.ROUND_OVER)
        self.btn_deal.configure(state=tk.NORMAL if phase == GamePhase.BETTING else tk.DISABLED)
        self.btn_new_round.configure(state=tk.NORMAL if phase == GamePhase.ROUND_OVER else tk.DISABLED)
        self.bet_entry.configure(state=tk.NORMAL if is_betting else tk.DISABLED)
