"""UI components for the Blackjack game."""

import pygame
from typing import Tuple

from .constants import WHITE, GRAY, LIGHT_GRAY, SMALL_FONT, TINY_FONT


class TextInput:
    """Text input field for user input."""

    def __init__(
        self,
        x: int,
        y: int,
        width: int,
        height: int,
        label: str = "",
        default_text: str = "",
        max_length: int = 10,
    ):
        self.rect = pygame.Rect(x, y, width, height)
        self.label = label
        self.text = default_text
        self.max_length = max_length
        self.active = False
        self.color_inactive = (70, 70, 70)
        self.color_active = (100, 100, 200)

    def handle_event(self, event: pygame.event.Event) -> bool:
        """Handle pygame events for this input field.

        Args:
            event: Pygame event

        Returns:
            True if Enter was pressed, False otherwise
        """
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

    def draw(self, screen: pygame.Surface) -> None:
        """Draw the input field on screen."""
        if self.label:
            label_surf = TINY_FONT.render(self.label, True, WHITE)
            screen.blit(label_surf, (self.rect.x, self.rect.y - 25))

        color = self.color_active if self.active else self.color_inactive
        pygame.draw.rect(screen, color, self.rect, border_radius=5)
        pygame.draw.rect(screen, WHITE, self.rect, 2, border_radius=5)

        text_surf = SMALL_FONT.render(self.text, True, WHITE)
        screen.blit(text_surf, (self.rect.x + 10, self.rect.y + 10))

    def get_value(self) -> int:
        """Get the numeric value of the input.

        Returns:
            Integer value, or 0 if invalid
        """
        try:
            return int(self.text) if self.text else 0
        except ValueError:
            return 0


class Button:
    """Clickable button."""

    def __init__(
        self,
        x: int,
        y: int,
        width: int,
        height: int,
        text: str,
        color: Tuple[int, int, int],
        text_color: Tuple[int, int, int] = WHITE,
    ):
        self.rect = pygame.Rect(x, y, width, height)
        self.text = text
        self.color = color
        self.text_color = text_color
        self.hover_color = tuple(min(c + 30, 255) for c in color)
        self.is_hovered = False
        self.enabled = True

    def draw(self, screen: pygame.Surface) -> None:
        """Draw the button on screen."""
        color = self.hover_color if self.is_hovered and self.enabled else self.color
        if not self.enabled:
            color = GRAY
        pygame.draw.rect(screen, color, self.rect, border_radius=10)
        pygame.draw.rect(screen, WHITE, self.rect, 2, border_radius=10)

        text_surf = SMALL_FONT.render(
            self.text, True, self.text_color if self.enabled else LIGHT_GRAY
        )
        text_rect = text_surf.get_rect(center=self.rect.center)
        screen.blit(text_surf, text_rect)

    def handle_event(self, event: pygame.event.Event) -> bool:
        """Handle pygame events for this button.

        Args:
            event: Pygame event

        Returns:
            True if button was clicked, False otherwise
        """
        if event.type == pygame.MOUSEMOTION:
            self.is_hovered = self.rect.collidepoint(event.pos)
        elif event.type == pygame.MOUSEBUTTONDOWN and self.enabled:
            if self.rect.collidepoint(event.pos):
                return True
        return False
