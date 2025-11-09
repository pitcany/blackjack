import pygame
import random
import sys

# Initialize Pygame
pygame.init()

# Constants
SCREEN_WIDTH = 1400
SCREEN_HEIGHT = 900
FPS = 60

# Colors
GREEN = (34, 139, 34)
DARK_GREEN = (0, 100, 0)
WHITE = (255, 255, 255)
BLACK = (0, 0, 0)
RED = (220, 20, 60)
GOLD = (255, 215, 0)
BLUE = (30, 144, 255)
GRAY = (128, 128, 128)
LIGHT_GRAY = (200, 200, 200)
YELLOW = (255, 255, 100)

# Card dimensions
CARD_WIDTH = 80
CARD_HEIGHT = 120

# Fonts - using system fonts for better Unicode support
TITLE_FONT = pygame.font.SysFont('arial', 60, bold=True)
LARGE_FONT = pygame.font.SysFont('arial', 48, bold=True)
MEDIUM_FONT = pygame.font.SysFont('arial', 36)
SMALL_FONT = pygame.font.SysFont('arial', 28)
TINY_FONT = pygame.font.SysFont('arial', 20)
CARD_FONT = pygame.font.SysFont('arial', 36, bold=True)


class Card:
    def __init__(self, rank, suit):
        self.rank = rank
        self.suit = suit

    def get_count_value(self):
        if self.rank in ['2', '3', '4', '5', '6']:
            return 1
        elif self.rank in ['10', 'J', 'Q', 'K', 'A']:
            return -1
        return 0


class TextInput:
    def __init__(self, x, y, width, height, label="", default_text="", max_length=10):
        self.rect = pygame.Rect(x, y, width, height)
        self.label = label
        self.text = default_text
        self.max_length = max_length
        self.active = False
        self.color_inactive = (70, 70, 70)
        self.color_active = (100, 100, 200)

    def handle_event(self, event):
        if event.type == pygame.MOUSEBUTTONDOWN:
            was_active = self.active
            self.active = self.rect.collidepoint(event.pos)
            # Clear text when clicking into an inactive field
            if self.active and not was_active:
                self.text = ""

        if event.type == pygame.KEYDOWN and self.active:
            if event.key == pygame.K_RETURN:
                self.active = False
                return True
            elif event.key == pygame.K_BACKSPACE:
                self.text = self.text[:-1]
            elif event.unicode.isdigit() and len(self.text) < self.max_length:
                self.text += event.unicode

        return False

    def draw(self, screen):
        if self.label:
            label_surf = TINY_FONT.render(self.label, True, WHITE)
            screen.blit(label_surf, (self.rect.x, self.rect.y - 25))

        color = self.color_active if self.active else self.color_inactive
        pygame.draw.rect(screen, color, self.rect, border_radius=5)
        pygame.draw.rect(screen, WHITE, self.rect, 2, border_radius=5)

        text_surf = SMALL_FONT.render(self.text, True, WHITE)
        screen.blit(text_surf, (self.rect.x + 10, self.rect.y + 10))

    def get_value(self):
        try:
            return int(self.text) if self.text else 0
        except Exception:
            return 0


class Button:
    def __init__(self, x, y, width, height, text, color, text_color=WHITE):
        self.rect = pygame.Rect(x, y, width, height)
        self.text = text
        self.color = color
        self.text_color = text_color
        self.hover_color = tuple(min(c + 30, 255) for c in color)
        self.is_hovered = False
        self.enabled = True

    def draw(self, screen):
        color = self.hover_color if self.is_hovered and self.enabled else self.color
        if not self.enabled:
            color = GRAY
        pygame.draw.rect(screen, color, self.rect, border_radius=10)
        pygame.draw.rect(screen, WHITE, self.rect, 2, border_radius=10)

        text_surf = SMALL_FONT.render(self.text, True, self.text_color if self.enabled else LIGHT_GRAY)
        text_rect = text_surf.get_rect(center=self.rect.center)
        screen.blit(text_surf, text_rect)

    def handle_event(self, event):
        if event.type == pygame.MOUSEMOTION:
            self.is_hovered = self.rect.collidepoint(event.pos)
        elif event.type == pygame.MOUSEBUTTONDOWN and self.enabled:
            if self.rect.collidepoint(event.pos):
                return True
        return False


class BlackjackGame:
    def __init__(self):
        self.screen = pygame.display.set_mode((SCREEN_WIDTH, SCREEN_HEIGHT))
        pygame.display.set_caption("Blackjack Card Counting Trainer")
        self.clock = pygame.time.Clock()

        # Game state
        self.num_decks = 6
        self.deck = []
        self.player_hand = []
        self.dealer_hand = []
        self.running_count = 0
        self.cards_dealt = 0
        self.bankroll = 1000
        self.current_bet = 10
        self.game_state = 'betting'
        self.message = 'Place your bet to start'
        self.show_info = False
        self.show_bankroll_edit = False

        # Split handling
        self.is_split = False
        self.split_hands = [[], []]
        self.active_split_hand = 0
        self.split_doubled = [False, False]  # Track which split hands doubled

        # Double down tracking for non-split hands
        self.hand_doubled = False

        # UI elements
        self.create_buttons()
        self.initialize_deck()

    def create_buttons(self):
        # Action buttons
        button_y = 700
        button_width = 140
        button_height = 60
        spacing = 20

        start_x = (SCREEN_WIDTH - (4 * button_width + 3 * spacing)) // 2

        self.hit_btn = Button(start_x, button_y, button_width, button_height, "HIT", BLUE)
        self.stand_btn = Button(start_x + button_width + spacing, button_y, button_width, button_height, "STAND", RED)
        self.double_btn = Button(start_x + 2 * (button_width + spacing), button_y, button_width, button_height, "DOUBLE", GOLD, BLACK)
        self.split_btn = Button(start_x + 3 * (button_width + spacing), button_y, button_width, button_height, "SPLIT", (128, 0, 128))

        # Deal and new hand buttons
        self.deal_btn = Button(SCREEN_WIDTH // 2 - 100, 700, 200, 60, "DEAL CARDS", (0, 150, 0))
        self.new_hand_btn = Button(SCREEN_WIDTH // 2 - 100, 700, 200, 60, "NEW HAND", (0, 150, 0))

        # Bet buttons
        bet_y = 780
        bet_width = 80
        bet_height = 40
        bet_start_x = SCREEN_WIDTH // 2 - 300

        self.bet_buttons = [
            Button(bet_start_x, bet_y, bet_width, bet_height, "$10", (70, 70, 70)),
            Button(bet_start_x + 90, bet_y, bet_width, bet_height, "$20", (70, 70, 70)),
            Button(bet_start_x + 180, bet_y, bet_width, bet_height, "$50", (70, 70, 70)),
            Button(bet_start_x + 270, bet_y, bet_width, bet_height, "$100", (70, 70, 70))
        ]

        # Custom bet input
        self.custom_bet_input = TextInput(bet_start_x + 370, bet_y, 120, 40, "Custom Bet:", "", max_length=6)

        # Deck count input - positioned to the right, away from bet buttons
        self.deck_input = TextInput(SCREEN_WIDTH - 250, bet_y, 120, 40, "Decks (1-8):", str(self.num_decks), max_length=1)

        # Bankroll edit button (below bankroll stat, centered)
        self.edit_bankroll_btn = Button(90, 130, 100, 30, "Edit $", (200, 100, 0), WHITE)

        # Bankroll modal components
        self.bankroll_input = TextInput(SCREEN_WIDTH // 2 - 100, SCREEN_HEIGHT // 2 - 50, 200, 50, "", str(self.bankroll), max_length=8)
        self.confirm_bankroll_btn = Button(SCREEN_WIDTH // 2 - 80, SCREEN_HEIGHT // 2 + 20, 80, 40, "OK", (0, 150, 0))
        self.cancel_bankroll_btn = Button(SCREEN_WIDTH // 2 + 10, SCREEN_HEIGHT // 2 + 20, 80, 40, "Cancel", (150, 0, 0))

        # Info and shoe buttons
        self.info_btn = Button(20, 20, 200, 40, "Show Help", (50, 50, 150))
        self.new_shoe_btn = Button(SCREEN_WIDTH - 220, 20, 200, 40, "New Shoe", (70, 70, 70))

    def initialize_deck(self):
        suits = ['♠', '♥', '♦', '♣']
        ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']

        self.deck = []
        for _ in range(self.num_decks):
            for suit in suits:
                for rank in ranks:
                    self.deck.append(Card(rank, suit))

        random.shuffle(self.deck)
        self.running_count = 0
        self.cards_dealt = 0

    def calculate_hand_value(self, hand):
        value = 0
        aces = 0

        for card in hand:
            if card.rank == 'A':
                aces += 1
                value += 11
            elif card.rank in ['J', 'Q', 'K']:
                value += 10
            else:
                value += int(card.rank)

        while value > 21 and aces > 0:
            value -= 10
            aces -= 1

        return value

    def get_true_count(self):
        decks_remaining = (self.num_decks * 52 - self.cards_dealt) / 52
        if decks_remaining > 0:
            return round(self.running_count / decks_remaining)
        return 0

    def get_betting_advice(self):
        true_count = self.get_true_count()

        if true_count <= 0:
            return 1, "Minimum bet - count is neutral or negative"
        elif true_count == 1:
            return 2, "Slight advantage - increase bet moderately"
        elif true_count == 2:
            return 4, "Good advantage - increase bet significantly"
        elif true_count == 3:
            return 6, "Strong advantage - large bet recommended"
        else:
            return 8, "Excellent advantage - maximum bet"

    def get_basic_strategy(self):
        if not self.player_hand or not self.dealer_hand:
            return None

        hand = self.split_hands[self.active_split_hand] if self.is_split else self.player_hand

        dealer_card = self.dealer_hand[0]
        dealer_value = 11 if dealer_card.rank == 'A' else (10 if dealer_card.rank in ['J', 'Q', 'K'] else int(dealer_card.rank))
        player_value = self.calculate_hand_value(hand)

        is_pair = len(hand) == 2 and hand[0].rank == hand[1].rank and not self.is_split
        has_ace = any(card.rank == 'A' for card in hand)

        # A hand is soft only if an ace is being counted as 11 (not just present)
        # Calculate sum treating all aces as 1, if adding 10 equals player_value, ace is counted as 11
        sum_aces_as_one = sum(
            1 if card.rank == 'A' else (10 if card.rank in ['J', 'Q', 'K'] else int(card.rank))
            for card in hand
        )
        is_soft = has_ace and player_value <= 21 and (sum_aces_as_one + 10) == player_value

        if is_pair:
            rank = hand[0].rank
            if rank in ['A', '8']:
                return 'SPLIT'
            if rank in ['2', '3', '7'] and dealer_value <= 7:
                return 'SPLIT'
            if rank == '6' and dealer_value <= 6:
                return 'SPLIT'
            if rank == '9' and dealer_value <= 9 and dealer_value != 7:
                return 'SPLIT'
            if rank in ['10', 'J', 'Q', 'K']:
                return 'STAND'

        if is_soft and player_value <= 21:
            if player_value >= 19:
                return 'STAND'
            if player_value == 18 and dealer_value >= 9:
                return 'HIT'
            if player_value == 18 and dealer_value <= 6:
                return 'DOUBLE' if len(hand) == 2 else 'HIT'
            if player_value == 18:
                return 'STAND'
            return 'HIT'

        if player_value >= 17:
            return 'STAND'
        if player_value >= 13:
            return 'STAND' if dealer_value <= 6 else 'HIT'
        if player_value == 12:
            return 'STAND' if 4 <= dealer_value <= 6 else 'HIT'
        if player_value == 11:
            return 'DOUBLE' if len(hand) == 2 else 'HIT'
        if player_value == 10:
            return 'DOUBLE' if len(hand) == 2 and dealer_value <= 9 else 'HIT'
        if player_value == 9:
            return 'DOUBLE' if len(hand) == 2 and 3 <= dealer_value <= 6 else 'HIT'

        return 'HIT'

    def deal_initial_cards(self):
        if self.current_bet > self.bankroll:
            self.message = "Insufficient funds!"
            return

        self.player_hand = []
        self.dealer_hand = []
        self.is_split = False
        self.split_hands = [[], []]
        self.active_split_hand = 0
        self.split_doubled = [False, False]
        self.hand_doubled = False

        for i in range(2):
            card = self.deck.pop(0)
            self.player_hand.append(card)
            self.running_count += card.get_count_value()
            self.cards_dealt += 1

        for i in range(2):
            card = self.deck.pop(0)
            self.dealer_hand.append(card)
            if i == 0:
                self.running_count += card.get_count_value()
            self.cards_dealt += 1

        player_value = self.calculate_hand_value(self.player_hand)

        if player_value == 21:
            dealer_value = self.calculate_hand_value(self.dealer_hand)
            self.running_count += self.dealer_hand[1].get_count_value()

            if dealer_value == 21:
                self.message = "Push! Both have blackjack"
                # No money changes hands on a push
            else:
                # Blackjack pays 3:2 - you win 1.5x your bet
                blackjack_winnings = int(self.current_bet * 1.5)
                self.bankroll += blackjack_winnings
                self.message = f"Blackjack! You win ${blackjack_winnings} (3:2 payout)"
            self.game_state = 'finished'
        else:
            self.game_state = 'playing'
            self.message = 'Make your move'

    def hit(self):
        if self.is_split:
            card = self.deck.pop(0)
            self.split_hands[self.active_split_hand].append(card)
            self.running_count += card.get_count_value()
            self.cards_dealt += 1

            value = self.calculate_hand_value(self.split_hands[self.active_split_hand])
            if value > 21:
                if self.active_split_hand == 0:
                    self.active_split_hand = 1
                    self.message = "Hand 1 busted. Playing hand 2"
                else:
                    self.game_state = 'dealer'
                    self.dealer_play()
        else:
            card = self.deck.pop(0)
            self.player_hand.append(card)
            self.running_count += card.get_count_value()
            self.cards_dealt += 1

            if self.calculate_hand_value(self.player_hand) > 21:
                # Count the dealer's hole card before finishing
                self.running_count += self.dealer_hand[1].get_count_value()
                actual_bet = self.current_bet * 2 if self.hand_doubled else self.current_bet
                self.message = "Bust! Dealer wins"
                self.bankroll -= actual_bet
                self.game_state = 'finished'

    def stand(self):
        if self.is_split and self.active_split_hand == 0:
            self.active_split_hand = 1
            self.message = "Playing hand 2"
        else:
            self.game_state = 'dealer'
            self.dealer_play()

    def _calculate_split_double_exposure(self):
        """Calculate total bankroll exposure if doubling a split hand.

        Returns:
            Total exposure (other hand's bet + this hand's doubled bet)
        """
        other_hand_idx = 1 - self.active_split_hand
        other_hand_bet = self.current_bet * 2 if self.split_doubled[other_hand_idx] else self.current_bet
        this_hand_doubled_bet = self.current_bet * 2
        return other_hand_bet + this_hand_doubled_bet

    def double_down(self):
        if self.is_split:
            total_exposure = self._calculate_split_double_exposure()
            if total_exposure > self.bankroll:
                self.message = "Insufficient funds to double!"
                return
            self.split_doubled[self.active_split_hand] = True
        else:
            if self.current_bet * 2 > self.bankroll:
                self.message = "Insufficient funds to double!"
                return
            self.hand_doubled = True

        if self.is_split:
            card = self.deck.pop(0)
            self.split_hands[self.active_split_hand].append(card)
            self.running_count += card.get_count_value()
            self.cards_dealt += 1

            if self.active_split_hand == 0:
                self.active_split_hand = 1
                self.message = "Playing hand 2"
            else:
                self.game_state = 'dealer'
                self.dealer_play()
        else:
            card = self.deck.pop(0)
            self.player_hand.append(card)
            self.running_count += card.get_count_value()
            self.cards_dealt += 1

            if self.calculate_hand_value(self.player_hand) > 21:
                # Count the dealer's hole card before finishing
                self.running_count += self.dealer_hand[1].get_count_value()
                actual_bet = self.current_bet * 2 if self.hand_doubled else self.current_bet
                self.message = "Bust! Dealer wins"
                self.bankroll -= actual_bet
                self.game_state = 'finished'
            else:
                self.game_state = 'dealer'
                self.dealer_play()

    def split(self):
        if self.current_bet * 2 > self.bankroll:
            self.message = "Insufficient funds to split!"
            return

        self.is_split = True
        self.split_hands = [[self.player_hand[0]], [self.player_hand[1]]]

        for i in range(2):
            card = self.deck.pop(0)
            self.split_hands[i].append(card)
            self.running_count += card.get_count_value()
            self.cards_dealt += 1

        self.active_split_hand = 0
        self.message = "Playing hand 1"

    def dealer_play(self):
        self.running_count += self.dealer_hand[1].get_count_value()

        while self.calculate_hand_value(self.dealer_hand) < 17:
            pygame.time.wait(500)
            card = self.deck.pop(0)
            self.dealer_hand.append(card)
            self.running_count += card.get_count_value()
            self.cards_dealt += 1
            self.draw()
            pygame.display.flip()

        self.finish_hand()

    def finish_hand(self):
        dealer_value = self.calculate_hand_value(self.dealer_hand)

        if self.is_split:
            total_win = 0
            results = []

            for i in range(2):
                hand_value = self.calculate_hand_value(self.split_hands[i])
                hand_bet = self.current_bet * 2 if self.split_doubled[i] else self.current_bet

                if hand_value > 21:
                    results.append(f"Hand {i+1}: Bust")
                    total_win -= hand_bet
                elif dealer_value > 21:
                    results.append(f"Hand {i+1}: Win")
                    total_win += hand_bet
                elif hand_value > dealer_value:
                    results.append(f"Hand {i+1}: Win")
                    total_win += hand_bet
                elif hand_value < dealer_value:
                    results.append(f"Hand {i+1}: Loss")
                    total_win -= hand_bet
                else:
                    results.append(f"Hand {i+1}: Push")

            self.bankroll += total_win
            self.message = " | ".join(results) + f" | Net: {'+' if total_win >= 0 else ''}${total_win}"
        else:
            player_value = self.calculate_hand_value(self.player_hand)
            actual_bet = self.current_bet * 2 if self.hand_doubled else self.current_bet

            if dealer_value > 21:
                self.message = f"Dealer busts! You win with {player_value}!"
                self.bankroll += actual_bet
            elif player_value > dealer_value:
                self.message = f"You win! {player_value} beats {dealer_value}"
                self.bankroll += actual_bet
            elif player_value < dealer_value:
                self.message = f"Dealer wins. {dealer_value} beats {player_value}"
                self.bankroll -= actual_bet
            else:
                self.message = f"Push! Both have {player_value}"

        self.game_state = 'finished'

    def start_new_hand(self):
        if len(self.deck) < 20:
            self.initialize_deck()

        self.player_hand = []
        self.dealer_hand = []
        self.is_split = False
        self.split_hands = [[], []]
        self.active_split_hand = 0
        self.split_doubled = [False, False]
        self.hand_doubled = False
        self.game_state = 'betting'
        self.message = 'Place your bet to start'

    def draw_card(self, screen, card, x, y, hidden=False):
        if hidden:
            pygame.draw.rect(screen, BLUE, (x, y, CARD_WIDTH, CARD_HEIGHT), border_radius=5)
        else:
            pygame.draw.rect(screen, WHITE, (x, y, CARD_WIDTH, CARD_HEIGHT), border_radius=5)

        pygame.draw.rect(screen, BLACK, (x, y, CARD_WIDTH, CARD_HEIGHT), 2, border_radius=5)

        if not hidden:
            color = RED if card.suit in ['♥', '♦'] else BLACK

            rank_text = CARD_FONT.render(card.rank, True, color)
            screen.blit(rank_text, (x + 10, y + 10))

            try:
                suit_text = CARD_FONT.render(card.suit, True, color)
                if suit_text.get_width() > 5:
                    screen.blit(suit_text, (x + 10, y + 55))
                else:
                    raise ValueError("Symbol not supported")
            except Exception:
                suit_names = {'♠': 'S', '♥': 'H', '♦': 'D', '♣': 'C'}
                fallback_text = SMALL_FONT.render(
                    suit_names.get(card.suit, '?'), True, color)
                screen.blit(fallback_text, (x + 10, y + 55))
        else:
            question = LARGE_FONT.render('?', True, WHITE)
            q_rect = question.get_rect(center=(x + CARD_WIDTH//2, y + CARD_HEIGHT//2))
            screen.blit(question, q_rect)

    def draw_bankroll_modal(self):
        overlay = pygame.Surface((SCREEN_WIDTH, SCREEN_HEIGHT))
        overlay.set_alpha(200)
        overlay.fill(BLACK)
        self.screen.blit(overlay, (0, 0))

        box_width = 400
        box_height = 200
        box_x = (SCREEN_WIDTH - box_width) // 2
        box_y = (SCREEN_HEIGHT - box_height) // 2

        pygame.draw.rect(self.screen, DARK_GREEN, (box_x, box_y, box_width, box_height), border_radius=10)
        pygame.draw.rect(self.screen, GOLD, (box_x, box_y, box_width, box_height), 3, border_radius=10)

        title = MEDIUM_FONT.render("Set Bankroll", True, GOLD)
        title_rect = title.get_rect(center=(SCREEN_WIDTH // 2, box_y + 30))
        self.screen.blit(title, title_rect)

        self.bankroll_input.rect.x = box_x + 100
        self.bankroll_input.rect.y = box_y + 70
        self.bankroll_input.draw(self.screen)

        self.confirm_bankroll_btn.rect.x = box_x + 80
        self.confirm_bankroll_btn.rect.y = box_y + 140
        self.cancel_bankroll_btn.rect.x = box_x + 220
        self.cancel_bankroll_btn.rect.y = box_y + 140

        self.confirm_bankroll_btn.draw(self.screen)
        self.cancel_bankroll_btn.draw(self.screen)

    def draw_info_panel(self):
        if not self.show_info:
            return

        overlay = pygame.Surface((SCREEN_WIDTH, SCREEN_HEIGHT))
        overlay.set_alpha(230)
        overlay.fill(BLACK)
        self.screen.blit(overlay, (0, 0))

        box_width = 1000
        box_height = 700
        box_x = (SCREEN_WIDTH - box_width) // 2
        box_y = (SCREEN_HEIGHT - box_height) // 2

        pygame.draw.rect(self.screen, DARK_GREEN, (box_x, box_y, box_width, box_height), border_radius=10)
        pygame.draw.rect(self.screen, GOLD, (box_x, box_y, box_width, box_height), 3, border_radius=10)

        title = LARGE_FONT.render("Blackjack Card Counting Guide", True, GOLD)
        self.screen.blit(title, (box_x + 20, box_y + 20))

        y_offset = box_y + 80
        line_height = 28

        sections = [
            ("Hi-Lo Card Counting System:", WHITE, True),
            ("  +1: Cards 2, 3, 4, 5, 6 (low cards)", WHITE, False),
            ("  0: Cards 7, 8, 9 (neutral)", WHITE, False),
            ("  -1: Cards 10, J, Q, K, A (high cards)", WHITE, False),
            ("", WHITE, False),
            ("Running Count: Add/subtract as cards are dealt", YELLOW, False),
            ("True Count: Running Count / Decks Remaining", YELLOW, False),
            ("", WHITE, False),
            ("Betting: Bet more when true count is +2 or higher", GOLD, False),
            ("", WHITE, False),
            ("Basic Strategy Rules:", WHITE, True),
            ("  Hard Hands: Stand on 17+", WHITE, False),
            ("  For 13-16: Stand if dealer shows 2-6, else hit", WHITE, False),
            ("  For 12: Stand if dealer shows 4-6, else hit", WHITE, False),
            ("  Soft Hands: Stand on soft 19+", WHITE, False),
            ("  Pairs: Always split Aces and 8s", WHITE, False),
            ("  Double: Double on 11 vs any, 10 vs 2-9", WHITE, False),
            ("", WHITE, False),
            ("Press ESC or click anywhere to close", LIGHT_GRAY, False),
        ]

        for text, color, bold in sections:
            font = MEDIUM_FONT if bold else TINY_FONT
            text_surf = font.render(text, True, color)
            self.screen.blit(text_surf, (box_x + 30, y_offset))
            y_offset += line_height

    def draw(self):
        self.screen.fill(DARK_GREEN)

        # Title
        title = TITLE_FONT.render("Blackjack Card Counting Trainer", True, GOLD)
        title_rect = title.get_rect(center=(SCREEN_WIDTH // 2, 40))
        self.screen.blit(title, title_rect)

        # Stats bar
        stats_y = 100
        stats = [
            f"Bankroll: ${self.bankroll}",
            f"Running Count: {'+' if self.running_count > 0 else ''}{self.running_count}",
            f"True Count: {'+' if self.get_true_count() > 0 else ''}{self.get_true_count()}",
            f"Cards: {self.cards_dealt}/{self.num_decks * 52}",
            f"Bet: ${self.current_bet}"
        ]

        stat_width = SCREEN_WIDTH // len(stats)
        for i, stat in enumerate(stats):
            text = SMALL_FONT.render(stat, True, WHITE)
            text_rect = text.get_rect(center=(stat_width * i + stat_width // 2, stats_y))
            self.screen.blit(text, text_rect)

        # Edit bankroll button
        self.edit_bankroll_btn.draw(self.screen)

        # Betting advice
        if self.game_state == 'betting':
            units, advice = self.get_betting_advice()
            advice_text = f"Recommended: {units} units (${units * 10}) - {advice}"
            advice_surf = TINY_FONT.render(advice_text, True, YELLOW)
            advice_rect = advice_surf.get_rect(center=(SCREEN_WIDTH // 2, 150))
            self.screen.blit(advice_surf, advice_rect)

        # Dealer's hand
        dealer_y = 200
        dealer_label = MEDIUM_FONT.render("Dealer", True, WHITE)
        self.screen.blit(dealer_label, (50, dealer_y))

        if self.dealer_hand:
            dealer_value = self.calculate_hand_value(self.dealer_hand)
            value_text = "?" if self.game_state == 'playing' else str(dealer_value)
            value_surf = MEDIUM_FONT.render(f"({value_text})", True, WHITE)
            self.screen.blit(value_surf, (200, dealer_y))

            card_x = 50
            for i, card in enumerate(self.dealer_hand):
                hidden = i == 1 and self.game_state == 'playing'
                self.draw_card(self.screen, card, card_x, dealer_y + 40, hidden)
                card_x += CARD_WIDTH + 10

        # Player's hand
        player_y = 400
        player_label = MEDIUM_FONT.render("You", True, WHITE)
        self.screen.blit(player_label, (50, player_y))

        if self.is_split:
            for hand_idx in range(2):
                hand = self.split_hands[hand_idx]
                value = self.calculate_hand_value(hand)

                hand_y = player_y + hand_idx * 120

                if hand_idx == self.active_split_hand and self.game_state == 'playing':
                    pygame.draw.rect(self.screen, YELLOW, (40, hand_y - 10, 600, 140), 3, border_radius=5)

                label = SMALL_FONT.render(f"Hand {hand_idx + 1} ({value})", True, WHITE)
                self.screen.blit(label, (50, hand_y + 30))

                card_x = 200
                for card in hand:
                    self.draw_card(self.screen, card, card_x, hand_y + 20)
                    card_x += CARD_WIDTH + 10
        elif self.player_hand:
            player_value = self.calculate_hand_value(self.player_hand)
            value_surf = MEDIUM_FONT.render(f"({player_value})", True, WHITE)
            self.screen.blit(value_surf, (150, player_y))

            card_x = 50
            for card in self.player_hand:
                self.draw_card(self.screen, card, card_x, player_y + 40)
                card_x += CARD_WIDTH + 10

        # Message
        message_surf = MEDIUM_FONT.render(self.message, True, GOLD)
        message_rect = message_surf.get_rect(center=(SCREEN_WIDTH // 2, 630))
        self.screen.blit(message_surf, message_rect)

        # Strategy advice
        if self.game_state == 'playing':
            strategy = self.get_basic_strategy()
            if strategy:
                strategy_text = f"Recommended: {strategy}"
                strategy_surf = MEDIUM_FONT.render(strategy_text, True, BLACK)

                box_width = strategy_surf.get_width() + 40
                box_height = 50
                box_x = (SCREEN_WIDTH - box_width) // 2
                box_y = 660

                pygame.draw.rect(self.screen, YELLOW, (box_x, box_y, box_width, box_height), border_radius=8)

                text_rect = strategy_surf.get_rect(center=(SCREEN_WIDTH // 2, box_y + 25))
                self.screen.blit(strategy_surf, text_rect)

        # Buttons
        if self.game_state == 'betting':
            self.deal_btn.draw(self.screen)
            for btn in self.bet_buttons:
                btn.draw(self.screen)

            self.custom_bet_input.draw(self.screen)
            self.deck_input.draw(self.screen)

        elif self.game_state == 'playing':
            can_split = (len(self.player_hand) == 2 and
                         self.player_hand[0].rank ==
                         self.player_hand[1].rank and
                         not self.is_split and
                         self.current_bet * 2 <= self.bankroll)

            hand = (self.split_hands[self.active_split_hand]
                    if self.is_split else self.player_hand)

            # Calculate if player can afford to double
            if self.is_split:
                total_exposure = self._calculate_split_double_exposure()
                can_double = len(hand) == 2 and total_exposure <= self.bankroll
            else:
                can_double = len(hand) == 2 and self.current_bet * 2 <= self.bankroll

            self.hit_btn.enabled = True
            self.stand_btn.enabled = True
            self.double_btn.enabled = can_double
            self.split_btn.enabled = can_split

            self.hit_btn.draw(self.screen)
            self.stand_btn.draw(self.screen)
            self.double_btn.draw(self.screen)
            self.split_btn.draw(self.screen)

        elif self.game_state == 'finished':
            self.new_hand_btn.draw(self.screen)

        # Always visible buttons
        self.info_btn.draw(self.screen)
        self.new_shoe_btn.draw(self.screen)

        # Modals
        if self.show_info:
            self.draw_info_panel()

        if self.show_bankroll_edit:
            self.draw_bankroll_modal()

    def handle_events(self):
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                return False

            if event.type == pygame.KEYDOWN:
                if event.key == pygame.K_ESCAPE:
                    if self.show_info:
                        self.show_info = False
                    elif self.show_bankroll_edit:
                        self.show_bankroll_edit = False
                    else:
                        return False

            # Bankroll modal has highest priority
            if self.show_bankroll_edit:
                self.bankroll_input.handle_event(event)

                if self.confirm_bankroll_btn.handle_event(event):
                    new_bankroll = self.bankroll_input.get_value()
                    if new_bankroll > 0:
                        self.bankroll = new_bankroll
                    self.show_bankroll_edit = False

                if self.cancel_bankroll_btn.handle_event(event):
                    self.show_bankroll_edit = False
                    self.bankroll_input.text = str(self.bankroll)

                continue

            # Close info panel on click
            if event.type == pygame.MOUSEBUTTONDOWN and self.show_info:
                self.show_info = False
                continue

            # Always-available buttons
            if self.edit_bankroll_btn.handle_event(event):
                self.show_bankroll_edit = True
                self.bankroll_input.text = str(self.bankroll)
                continue

            if self.info_btn.handle_event(event):
                self.show_info = not self.show_info
                continue

            if self.new_shoe_btn.handle_event(event):
                self.initialize_deck()
                continue

            # Game state specific handling
            if self.game_state == 'betting':
                # Handle deck input (no action on Enter - live updates below)
                self.deck_input.handle_event(event)

                # Handle custom bet input
                self.custom_bet_input.handle_event(event)

                # Update bet from custom input as they type
                custom_bet = self.custom_bet_input.get_value()
                if custom_bet > 0:
                    self.current_bet = custom_bet

                # Check deck input for immediate updates
                deck_count = self.deck_input.get_value()
                if 1 <= deck_count <= 8 and deck_count != self.num_decks:
                    self.num_decks = deck_count
                    self.initialize_deck()

                if self.deal_btn.handle_event(event):
                    self.deal_initial_cards()

                for i, btn in enumerate(self.bet_buttons):
                    if btn.handle_event(event):
                        self.current_bet = [10, 20, 50, 100][i]
                        self.custom_bet_input.text = ""

            elif self.game_state == 'playing':
                if self.hit_btn.handle_event(event):
                    self.hit()
                elif self.stand_btn.handle_event(event):
                    self.stand()
                elif self.double_btn.handle_event(event):
                    self.double_down()
                elif self.split_btn.handle_event(event):
                    self.split()

            elif self.game_state == 'finished':
                if self.new_hand_btn.handle_event(event):
                    self.start_new_hand()

        return True

    def run(self):
        running = True
        while running:
            running = self.handle_events()
            self.draw()
            pygame.display.flip()
            self.clock.tick(FPS)

        pygame.quit()
        sys.exit()


def main():
    """Entry point for the blackjack game."""
    game = BlackjackGame()
    game.run()


if __name__ == "__main__":
    main()
