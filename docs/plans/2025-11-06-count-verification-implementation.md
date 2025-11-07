# Count Verification System Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add interactive count verification after each hand to transform the trainer from passive display to active learning tool

**Architecture:** Extend game state machine with new "verify_count" state that appears after "finished" state when verification is enabled. Track count accuracy in SessionStats, extend TextInput to accept negatives, add visual feedback overlay.

**Tech Stack:** Python 3.10+, Pygame 2.6+, pytest for testing

---

## Task 1: Add Count Tracking to Statistics

**Files:**
- Modify: `blackjack_card_counter/statistics.py:10-32`
- Create: `tests/test_statistics.py`

**Step 1: Write test for count tracking**

Create `tests/test_statistics.py`:

```python
"""Tests for statistics tracking."""

import pytest
from blackjack_card_counter.statistics import SessionStats


def test_record_count_verification_correct():
    """Test recording a correct count verification."""
    stats = SessionStats(stats_file="test_stats.json")
    stats.reset_session()

    stats.record_count_verification(True)

    assert stats.count_correct == 1
    assert stats.count_attempts == 1
    assert stats.get_count_accuracy() == 100.0


def test_record_count_verification_incorrect():
    """Test recording an incorrect count verification."""
    stats = SessionStats(stats_file="test_stats.json")
    stats.reset_session()

    stats.record_count_verification(False)

    assert stats.count_correct == 0
    assert stats.count_attempts == 1
    assert stats.get_count_accuracy() == 0.0


def test_count_accuracy_multiple_attempts():
    """Test count accuracy calculation with multiple attempts."""
    stats = SessionStats(stats_file="test_stats.json")
    stats.reset_session()

    # 3 correct, 2 incorrect = 60%
    stats.record_count_verification(True)
    stats.record_count_verification(True)
    stats.record_count_verification(False)
    stats.record_count_verification(True)
    stats.record_count_verification(False)

    assert stats.count_correct == 3
    assert stats.count_attempts == 5
    assert stats.get_count_accuracy() == 60.0


def test_count_accuracy_zero_attempts():
    """Test count accuracy when no attempts made."""
    stats = SessionStats(stats_file="test_stats.json")
    stats.reset_session()

    assert stats.get_count_accuracy() == 0.0
```

**Step 2: Run test to verify it fails**

Run:
```bash
pytest tests/test_statistics.py -v
```

Expected: FAIL with "AttributeError: 'SessionStats' object has no attribute 'count_correct'"

**Step 3: Add count tracking fields to SessionStats.__init__**

In `blackjack_card_counter/statistics.py`, modify `__init__` method (after line 28):

```python
    def __init__(self, stats_file: str = "blackjack_stats.json"):
        self.stats_file = Path.home() / ".blackjack" / stats_file
        self.stats_file.parent.mkdir(exist_ok=True)

        # Current session stats
        self.hands_played = 0
        self.hands_won = 0
        self.hands_lost = 0
        self.hands_pushed = 0
        self.blackjacks = 0
        self.total_wagered = 0
        self.total_won = 0
        self.total_lost = 0
        self.biggest_win = 0
        self.biggest_loss = 0
        self.session_start = datetime.now()
        self.bankroll_history: List[Dict] = []

        # Count verification tracking
        self.count_correct = 0
        self.count_attempts = 0

        # Load previous stats if they exist
        self.load_stats()
```

**Step 4: Implement record_count_verification method**

Add after `record_bankroll` method (after line 76):

```python
    def record_count_verification(self, is_correct: bool):
        """Record a count verification attempt.

        Args:
            is_correct: Whether the user's count was correct
        """
        self.count_attempts += 1
        if is_correct:
            self.count_correct += 1
```

**Step 5: Implement get_count_accuracy method**

Add after `get_roi` method (after line 92):

```python
    def get_count_accuracy(self) -> float:
        """Calculate count accuracy percentage.

        Returns:
            Percentage of correct count verifications (0-100)
        """
        if self.count_attempts == 0:
            return 0.0
        return (self.count_correct / self.count_attempts) * 100
```

**Step 6: Run test to verify it passes**

Run:
```bash
pytest tests/test_statistics.py -v
```

Expected: 4 tests PASS

**Step 7: Update save_stats to persist count data**

In `save_stats` method (around line 105), add count fields to the data dict:

```python
    def save_stats(self):
        """Save statistics to file."""
        data = {
            'hands_played': self.hands_played,
            'hands_won': self.hands_won,
            'hands_lost': self.hands_lost,
            'hands_pushed': self.hands_pushed,
            'blackjacks': self.blackjacks,
            'total_wagered': self.total_wagered,
            'total_won': self.total_won,
            'total_lost': self.total_lost,
            'biggest_win': self.biggest_win,
            'biggest_loss': self.biggest_loss,
            'session_start': self.session_start.isoformat(),
            'bankroll_history': self.bankroll_history,
            'count_correct': self.count_correct,
            'count_attempts': self.count_attempts
        }

        try:
            with open(self.stats_file, 'w') as f:
                json.dump(data, f, indent=2)
        except Exception as e:
            print(f"Error saving stats: {e}")
```

**Step 8: Update load_stats to load count data**

In `load_stats` method (around line 145), add count fields loading:

```python
                    self.biggest_win = data.get('biggest_win', 0)
                    self.biggest_loss = data.get('biggest_loss', 0)
                    self.bankroll_history = data.get('bankroll_history', [])
                    self.count_correct = data.get('count_correct', 0)
                    self.count_attempts = data.get('count_attempts', 0)

                    # Parse session start time
```

**Step 9: Update reset_session to reset count data**

In `reset_session` method (around line 215), add count resets:

```python
    def reset_session(self):
        """Reset all session statistics."""
        self.hands_played = 0
        self.hands_won = 0
        self.hands_lost = 0
        self.hands_pushed = 0
        self.blackjacks = 0
        self.total_wagered = 0
        self.total_won = 0
        self.total_lost = 0
        self.biggest_win = 0
        self.biggest_loss = 0
        self.session_start = datetime.now()
        self.bankroll_history = []
        self.count_correct = 0
        self.count_attempts = 0
        self.save_stats()
```

**Step 10: Run tests again to verify persistence**

Run:
```bash
pytest tests/test_statistics.py -v
```

Expected: All tests PASS

**Step 11: Commit statistics tracking**

```bash
git add blackjack_card_counter/statistics.py tests/test_statistics.py
git commit -m "feat: add count verification tracking to statistics

- Add count_correct and count_attempts fields
- Add record_count_verification() method
- Add get_count_accuracy() method
- Update save/load/reset to persist count data
- Add comprehensive test coverage

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 2: Update CSV Export with Count Data

**Files:**
- Modify: `blackjack_card_counter/statistics.py:176-177`

**Step 1: Add count accuracy to CSV summary**

In `export_to_csv` method (around line 176), add count accuracy row:

```python
                writer.writerow(['Win Rate', f"{self.get_win_rate():.2f}%"])
                writer.writerow(['Count Accuracy', f"{self.get_count_accuracy():.2f}%"])
                writer.writerow(['Count Correct', self.count_correct])
                writer.writerow(['Count Attempts', self.count_attempts])
                writer.writerow(['Total Wagered', f"${self.total_wagered}"])
```

**Step 2: Test CSV export manually**

Run the game and export a session to verify CSV includes new fields.

**Step 3: Commit CSV export update**

```bash
git add blackjack_card_counter/statistics.py
git commit -m "feat: add count accuracy to CSV export

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 3: Add Feedback Colors to Constants

**Files:**
- Modify: `blackjack_card_counter/constants.py:22`

**Step 1: Add success and error colors**

After line 22 in constants.py, add:

```python
LIGHT_GRAY = (200, 200, 200)
YELLOW = (255, 255, 100)
SUCCESS_GREEN = (34, 197, 94)
ERROR_RED = (239, 68, 68)
TRANSPARENT_GREEN = (34, 197, 94, 100)  # With alpha for overlay
TRANSPARENT_RED = (239, 68, 68, 100)    # With alpha for overlay
```

**Step 2: Commit constants update**

```bash
git add blackjack_card_counter/constants.py
git commit -m "feat: add success/error colors for verification feedback

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 4: Extend TextInput to Accept Negative Numbers

**Files:**
- Modify: `blackjack_card_counter/ui.py:52-53`
- Create: `tests/test_ui.py`

**Step 1: Write test for negative number input**

Create `tests/test_ui.py`:

```python
"""Tests for UI components."""

import pytest
import pygame
from blackjack_card_counter.ui import TextInput


@pytest.fixture
def text_input():
    """Create a TextInput instance for testing."""
    pygame.init()
    return TextInput(100, 100, 150, 40, "Test")


def test_text_input_accepts_positive_numbers(text_input):
    """Test TextInput accepts positive numbers."""
    text_input.active = True
    text_input.text = ""

    # Simulate typing "123"
    for char in "123":
        event = pygame.event.Event(pygame.KEYDOWN, unicode=char, key=ord(char))
        text_input.handle_event(event)

    assert text_input.text == "123"
    assert text_input.get_value() == 123


def test_text_input_accepts_negative_numbers(text_input):
    """Test TextInput accepts negative numbers with minus sign."""
    text_input.active = True
    text_input.text = ""

    # Simulate typing "-42"
    event_minus = pygame.event.Event(pygame.KEYDOWN, unicode='-', key=pygame.K_MINUS)
    text_input.handle_event(event_minus)

    for char in "42":
        event = pygame.event.Event(pygame.KEYDOWN, unicode=char, key=ord(char))
        text_input.handle_event(event)

    assert text_input.text == "-42"
    assert text_input.get_value() == -42


def test_text_input_minus_only_at_start(text_input):
    """Test minus sign only accepted at the start."""
    text_input.active = True
    text_input.text = "5"

    # Try to add minus after digit
    event_minus = pygame.event.Event(pygame.KEYDOWN, unicode='-', key=pygame.K_MINUS)
    text_input.handle_event(event_minus)

    assert text_input.text == "5"  # Should not append minus


def test_text_input_empty_returns_zero(text_input):
    """Test empty input returns 0."""
    text_input.text = ""
    assert text_input.get_value() == 0


def test_text_input_only_minus_returns_zero(text_input):
    """Test minus sign alone returns 0."""
    text_input.text = "-"
    assert text_input.get_value() == 0
```

**Step 2: Run test to verify it fails**

Run:
```bash
pytest tests/test_ui.py -v
```

Expected: test_text_input_accepts_negative_numbers FAILS (minus not accepted)

**Step 3: Update TextInput.handle_event to accept minus sign**

In `ui.py`, replace the KEYDOWN handling (lines 46-53):

```python
        if event.type == pygame.KEYDOWN and self.active:
            if event.key == pygame.K_RETURN:
                self.active = False
                return True
            elif event.key == pygame.K_BACKSPACE:
                self.text = self.text[:-1]
            elif event.unicode.isdigit() and len(self.text) < self.max_length:
                self.text += event.unicode
            elif event.unicode == '-' and len(self.text) == 0 and self.max_length > 1:
                # Allow minus sign only at the start
                self.text += event.unicode
```

**Step 4: Update get_value to handle minus-only input**

In `ui.py`, update `get_value` method (lines 70-79):

```python
    def get_value(self) -> int:
        """Get the numeric value of the input.

        Returns:
            Integer value, or 0 if invalid (including minus sign alone)
        """
        try:
            if not self.text or self.text == '-':
                return 0
            return int(self.text)
        except ValueError:
            return 0
```

**Step 5: Run test to verify it passes**

Run:
```bash
pytest tests/test_ui.py -v
```

Expected: All 5 tests PASS

**Step 6: Commit TextInput negative number support**

```bash
git add blackjack_card_counter/ui.py tests/test_ui.py
git commit -m "feat: allow TextInput to accept negative numbers

- Accept minus sign at start of input
- Update get_value() to handle negative integers
- Add comprehensive test coverage

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 5: Add Verification State to Game

**Files:**
- Modify: `blackjack_card_counter/game.py:49-75`

**Step 1: Add verification state variables to __init__**

In `game.py`, add to `__init__` method after line 58 (after `self.show_stats = False`):

```python
        self.show_stats = False

        # Count verification
        self.count_verification_enabled = True
        self.verification_result = None  # 'correct', 'incorrect', or None
        self.verification_feedback_timer = 0
        self.user_count_submitted = False
```

**Step 2: Commit state variables**

```bash
git add blackjack_card_counter/game.py
git commit -m "feat: add verification state variables to game

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 6: Create Count Input UI

**Files:**
- Modify: `blackjack_card_counter/game.py:77-120`

**Step 1: Add count input field to create_buttons**

In `game.py`, add to `create_buttons` method (after creating other buttons, around line 120):

```python
        # Count verification input (centered)
        input_width = 150
        input_height = 50
        input_x = (SCREEN_WIDTH - input_width) // 2
        input_y = 500
        self.count_input = TextInput(
            input_x, input_y, input_width, input_height,
            label="", default_text="", max_length=5
        )

        # Verification buttons
        button_width = 120
        button_height = 50
        button_spacing = 20
        buttons_total_width = 2 * button_width + button_spacing
        button_start_x = (SCREEN_WIDTH - buttons_total_width) // 2
        button_y = input_y + input_height + 20

        self.submit_count_btn = Button(
            button_start_x, button_y, button_width, button_height,
            "Submit", BLUE
        )
        self.skip_count_btn = Button(
            button_start_x + button_width + button_spacing, button_y,
            button_width, button_height, "Skip", GRAY
        )
```

**Step 2: Commit UI creation**

```bash
git add blackjack_card_counter/game.py
git commit -m "feat: create count verification input UI elements

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 7: Add Check Count Verification Method

**Files:**
- Modify: `blackjack_card_counter/game.py` (add new method after `dealer_play`)

**Step 1: Implement check_count_verification method**

Add this method after `dealer_play` method in `game.py`:

```python
    def check_count_verification(self, user_count: int, skipped: bool = False) -> bool:
        """Check if user's count matches actual running count.

        Args:
            user_count: The count value entered by the user
            skipped: If True, user skipped without attempting

        Returns:
            True if correct, False otherwise
        """
        if skipped:
            # Don't record stats if user skipped
            self.verification_result = 'skipped'
            self.verification_feedback_timer = pygame.time.get_ticks()
            return False

        is_correct = (user_count == self.running_count)
        self.stats.record_count_verification(is_correct)
        self.verification_result = 'correct' if is_correct else 'incorrect'
        self.verification_feedback_timer = pygame.time.get_ticks()
        self.user_count_submitted = True

        return is_correct
```

**Step 2: Commit verification method**

```bash
git add blackjack_card_counter/game.py
git commit -m "feat: implement check_count_verification method

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 8: Add Verification State Handling

**Files:**
- Modify: `blackjack_card_counter/game.py` (modify `handle_events` and state transitions)

**Step 1: Add verify_count state to handle_events**

Find the `handle_events` method and add verification state handling. Add after the "finished" state handling (search for `elif self.game_state == "finished"`):

```python
        elif self.game_state == "verify_count":
            # Handle count verification input
            if self.count_input.handle_event(event):
                # Enter pressed in input field
                user_count = self.count_input.get_value()
                self.check_count_verification(user_count)

            if self.submit_count_btn.handle_event(event):
                user_count = self.count_input.get_value()
                self.check_count_verification(user_count)

            if self.skip_count_btn.handle_event(event):
                self.check_count_verification(0, skipped=True)
```

**Step 2: Modify dealer_play to transition to verify_count**

Find the end of `dealer_play` method where it sets `self.game_state = "betting"`. Replace that section to add conditional verification:

```python
        # After dealer finishes, transition to verification or betting
        if self.count_verification_enabled:
            self.game_state = "verify_count"
            self.count_input.text = ""  # Clear input
            self.count_input.active = True  # Auto-focus
            self.user_count_submitted = False
        else:
            self.game_state = "betting"
            self.message = "Place your bet to start"
```

**Step 3: Add state transition after feedback**

In `handle_events`, after the verify_count handling, add transition logic:

```python
            if self.skip_count_btn.handle_event(event):
                self.check_count_verification(0, skipped=True)

            # Auto-advance after feedback shown for 2 seconds
            if self.verification_result and self.user_count_submitted:
                elapsed = pygame.time.get_ticks() - self.verification_feedback_timer
                if elapsed > 2000:  # 2 seconds
                    self.game_state = "betting"
                    self.message = "Place your bet to start"
                    self.verification_result = None
                    self.user_count_submitted = False
```

**Step 4: Commit state handling**

```bash
git add blackjack_card_counter/game.py
git commit -m "feat: add verify_count state handling and transitions

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 9: Draw Verification Screen

**Files:**
- Modify: `blackjack_card_counter/game.py` (add `draw_verification_screen` method)

**Step 1: Implement draw_verification_screen method**

Add this method after `check_count_verification`:

```python
    def draw_verification_screen(self, screen):
        """Draw the count verification interface.

        Shows prompt, input field, and submit/skip buttons.
        """
        # Semi-transparent overlay
        overlay = pygame.Surface((SCREEN_WIDTH, SCREEN_HEIGHT))
        overlay.set_alpha(128)
        overlay.fill(BLACK)
        screen.blit(overlay, (0, 0))

        # Prompt text
        prompt_text = "What's the running count?"
        prompt_surf = LARGE_FONT.render(prompt_text, True, WHITE)
        prompt_rect = prompt_surf.get_rect(center=(SCREEN_WIDTH // 2, 420))
        screen.blit(prompt_surf, prompt_rect)

        # Draw input and buttons
        self.count_input.draw(screen)
        self.submit_count_btn.draw(screen)
        self.skip_count_btn.draw(screen)
```

**Step 2: Add verify_count case to draw method**

Find the `draw` method and add verification drawing. Add after the "finished" state drawing:

```python
        elif self.game_state == "verify_count":
            # Draw cards and game state, then verification UI on top
            self.draw_table(self.screen)
            self.draw_cards(self.screen)
            self.draw_info(self.screen)

            if not self.verification_result:
                # Show verification prompt
                self.draw_verification_screen(self.screen)
            else:
                # Show feedback
                self.draw_verification_feedback(self.screen)
```

**Step 3: Commit verification screen drawing**

```bash
git add blackjack_card_counter/game.py
git commit -m "feat: implement verification screen UI drawing

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 10: Draw Verification Feedback

**Files:**
- Modify: `blackjack_card_counter/game.py` (add `draw_verification_feedback` method)

**Step 1: Import SUCCESS_GREEN and ERROR_RED in game.py**

At the top of `game.py`, update the constants import to include new colors:

```python
from .constants import (
    SCREEN_WIDTH,
    SCREEN_HEIGHT,
    FPS,
    GREEN,
    DARK_GREEN,
    WHITE,
    BLACK,
    RED,
    GOLD,
    BLUE,
    GRAY,
    LIGHT_GRAY,
    YELLOW,
    SUCCESS_GREEN,
    ERROR_RED,
    CARD_WIDTH,
    CARD_HEIGHT,
    TITLE_FONT,
    LARGE_FONT,
    MEDIUM_FONT,
    SMALL_FONT,
    TINY_FONT,
    CARD_FONT,
)
```

**Step 2: Implement draw_verification_feedback method**

Add this method after `draw_verification_screen`:

```python
    def draw_verification_feedback(self, screen):
        """Draw verification result feedback.

        Shows green checkmark for correct, red X for incorrect,
        or neutral message for skipped. Auto-advances after 2 seconds.
        """
        # Semi-transparent colored overlay
        overlay = pygame.Surface((SCREEN_WIDTH, SCREEN_HEIGHT))
        overlay.set_alpha(100)

        if self.verification_result == 'correct':
            overlay.fill(SUCCESS_GREEN)
            icon = "✓"
            icon_color = SUCCESS_GREEN
            message = f"Correct! Running count: {self.running_count}"
        elif self.verification_result == 'incorrect':
            overlay.fill(ERROR_RED)
            icon = "✗"
            icon_color = ERROR_RED
            user_count = self.count_input.get_value()
            message = f"Incorrect. Your count: {user_count} | Actual count: {self.running_count}"
        else:  # skipped
            overlay.fill(GRAY)
            icon = "→"
            icon_color = YELLOW
            message = f"Skipped. Running count: {self.running_count}"

        screen.blit(overlay, (0, 0))

        # Large icon
        icon_surf = TITLE_FONT.render(icon, True, WHITE)
        icon_rect = icon_surf.get_rect(center=(SCREEN_WIDTH // 2, 350))
        screen.blit(icon_surf, icon_rect)

        # Feedback message
        message_surf = LARGE_FONT.render(message, True, WHITE)
        message_rect = message_surf.get_rect(center=(SCREEN_WIDTH // 2, 480))
        screen.blit(message_surf, message_rect)

        # Show count accuracy
        accuracy = self.stats.get_count_accuracy()
        accuracy_text = f"Count Accuracy: {accuracy:.1f}% ({self.stats.count_correct}/{self.stats.count_attempts})"
        accuracy_surf = MEDIUM_FONT.render(accuracy_text, True, WHITE)
        accuracy_rect = accuracy_surf.get_rect(center=(SCREEN_WIDTH // 2, 550))
        screen.blit(accuracy_surf, accuracy_rect)
```

**Step 3: Commit feedback drawing**

```bash
git add blackjack_card_counter/game.py
git commit -m "feat: implement verification feedback display

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 11: Add Count Training Toggle Button

**Files:**
- Modify: `blackjack_card_counter/game.py` (add toggle button and handling)

**Step 1: Create toggle button in create_buttons**

In `create_buttons` method, add after other top-bar buttons (around where help/stats buttons are):

```python
        # Count training toggle (top right)
        self.count_training_btn = Button(
            1150, 20, 200, 50,
            "Count Training: ON", GREEN
        )
```

**Step 2: Add toggle handler to handle_events**

In `handle_events`, add toggle handling in the general event section (before state-specific handling):

```python
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                return False

            # Count training toggle (works in any state)
            if self.count_training_btn.handle_event(event):
                self.count_verification_enabled = not self.count_verification_enabled
                label = "Count Training: ON" if self.count_verification_enabled else "Count Training: OFF"
                color = GREEN if self.count_verification_enabled else GRAY
                self.count_training_btn.text = label
                self.count_training_btn.color = color
```

**Step 3: Draw toggle button in all states**

Find where top-bar buttons are drawn in the `draw` method and add the toggle button:

```python
        # Always draw top bar buttons
        self.help_btn.draw(self.screen)
        self.stats_btn.draw(self.screen)
        self.count_training_btn.draw(self.screen)
```

**Step 4: Commit toggle button**

```bash
git add blackjack_card_counter/game.py
git commit -m "feat: add count training toggle button

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 12: Update Stats Modal with Count Accuracy

**Files:**
- Modify: `blackjack_card_counter/game.py` (modify `draw_stats_modal` method)

**Step 1: Add count accuracy to stats display**

Find the `draw_stats_modal` method and add count accuracy after win rate. Look for where win rate is displayed and add:

```python
        # Win rate
        win_rate = self.stats.get_win_rate()
        win_rate_text = f"Win Rate: {win_rate:.1f}% ({self.stats.hands_won}/{self.stats.hands_played})"
        # ... existing drawing code ...

        # Count accuracy (new)
        count_accuracy = self.stats.get_count_accuracy()
        count_text = f"Count Accuracy: {count_accuracy:.1f}% ({self.stats.count_correct}/{self.stats.count_attempts})"
        count_surf = SMALL_FONT.render(count_text, True, WHITE)
        y_offset += 40  # Increment y position
        self.screen.blit(count_surf, (modal_x + 40, modal_y + y_offset))
```

**Step 2: Commit stats modal update**

```bash
git add blackjack_card_counter/game.py
git commit -m "feat: display count accuracy in stats modal

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 13: Fix Auto-Advance Timer

**Files:**
- Modify: `blackjack_card_counter/game.py` (update `run` method or add to draw)

**Step 1: Add auto-advance logic to main game loop**

In the `run` method or at the end of `handle_events`, add timer check for auto-advancing from feedback:

```python
        # Check for auto-advance from verification feedback
        if self.game_state == "verify_count" and self.verification_result:
            elapsed = pygame.time.get_ticks() - self.verification_feedback_timer
            if elapsed > 2000:  # 2 seconds
                self.game_state = "betting"
                self.message = "Place your bet to start"
                self.verification_result = None
                self.user_count_submitted = False
                self.count_input.text = ""
```

Note: This may already be implemented in Task 8 Step 3. Verify and consolidate if needed.

**Step 2: Test auto-advance**

Run the game and verify feedback disappears after exactly 2 seconds.

**Step 3: Commit if new changes made**

```bash
git add blackjack_card_counter/game.py
git commit -m "fix: ensure auto-advance from verification feedback

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 14: Manual Integration Testing

**Files:**
- None (testing only)

**Step 1: Test happy path (correct count)**

1. Run: `python -m blackjack_card_counter`
2. Place bet and play hand to completion
3. Verify count prompt appears
4. Enter the correct running count (shown on screen)
5. Submit
6. Verify green checkmark and "Correct!" message
7. Verify stats show 1/1 (100%)
8. Wait 2 seconds
9. Verify auto-advance to betting screen

**Step 2: Test incorrect count**

1. Play another hand
2. Enter an incorrect count (e.g., off by 5)
3. Verify red X and shows both your count and actual
4. Verify stats show 1/2 (50%)

**Step 3: Test negative counts**

1. Play hands until running count is negative
2. Enter negative count (e.g., -5)
3. Verify input accepts minus sign
4. Verify correct/incorrect feedback works

**Step 4: Test skip button**

1. Play a hand
2. Click "Skip" instead of entering count
3. Verify it shows the correct count
4. Verify stats are NOT updated (still 1/2)

**Step 5: Test toggle OFF**

1. Click "Count Training: OFF" button
2. Button turns gray
3. Play a hand to completion
4. Verify NO verification prompt appears
5. Verify goes directly to betting

**Step 6: Test toggle ON**

1. Click "Count Training: ON"
2. Button turns green
3. Play a hand
4. Verify verification prompt appears again

**Step 7: Test stats modal**

1. Open stats modal
2. Verify "Count Accuracy" row is present
3. Verify percentage matches attempts

**Step 8: Test CSV export**

1. Play 5-10 hands with verification
2. Export session to CSV
3. Open CSV file
4. Verify "Count Accuracy", "Count Correct", "Count Attempts" rows exist

**Step 9: Test edge cases**

Test:
- Empty input (should treat as 0)
- Just minus sign (should treat as 0)
- Very large counts (+30, -30)
- Count of exactly 0
- Rapid button clicking

**Step 10: Document any issues**

Create GitHub issues for any bugs found during testing.

---

## Task 15: Update Documentation

**Files:**
- Modify: `CLAUDE.md`
- Create: `docs/user-guide-count-verification.md`

**Step 1: Update CLAUDE.md with verification feature**

Add a new section after "Hi-Lo Card Counting System":

```markdown
## Count Verification Training Mode

The count verification system transforms passive observation into active learning:

**How It Works:**
- After each hand, the game prompts: "What's the running count?"
- User enters their count and receives immediate feedback
- Correct: Green checkmark + confirmation
- Incorrect: Red X + shows both user's count and actual count
- Statistics track count accuracy over time

**Toggle Control:**
- "Count Training" button (top right) toggles verification ON/OFF
- Default: ON (training mode)
- OFF: Skip verification for pure strategy practice

**Feedback Display:**
- Correct answers: Green overlay, checkmark, 2-second display
- Incorrect answers: Red overlay, X, shows discrepancy
- Skip button: Shows answer without recording stats

**Statistics:**
- Count Accuracy: Percentage of correct verifications
- Count Correct / Count Attempts: Detailed tracking
- Displayed in stats modal and CSV export

**Implementation Details:**
- New game state: "verify_count" (between "finished" and "betting")
- State only entered if `count_verification_enabled == True`
- TextInput extended to accept negative integers (for negative counts)
- SessionStats tracks count_correct and count_attempts
- Auto-advances after 2 seconds of feedback display
```

**Step 2: Create user guide**

Create `docs/user-guide-count-verification.md`:

```markdown
# Count Verification Training Guide

## What is Count Verification?

Count verification helps you practice and validate your card counting skills. After each hand, you'll be asked to enter the running count from memory, and the game will tell you if you're correct.

## How to Use

### Basic Workflow

1. **Play a hand** - Place bet, play cards, dealer plays
2. **Verify count** - Game asks "What's the running count?"
3. **Enter your count** - Type the number you've been tracking
4. **Get feedback** - Green checkmark (correct) or red X (incorrect)
5. **Review stats** - See your accuracy percentage
6. **Next hand** - Auto-advances to betting after 2 seconds

### Entering Counts

- **Positive counts**: Just type the number (e.g., `5`)
- **Negative counts**: Start with minus (e.g., `-3`)
- **Zero count**: Type `0` or leave blank
- **Submit**: Click "Submit" button or press Enter
- **Skip**: Click "Skip" to see the answer (doesn't affect stats)

### Training Modes

**Count Training: ON** (Default)
- Verification prompt after every hand
- Builds counting discipline
- Tracks accuracy for improvement

**Count Training: OFF**
- No verification prompts
- For practicing pure strategy
- Or testing strategies without counting pressure

### Tracking Progress

**Stats Modal** (click "Statistics" button):
- Count Accuracy: 87.2% (41/47 correct)
- See improvement over time
- Compare with win rate

**CSV Export**:
- Export full session data
- Includes count accuracy metrics
- Analyze performance trends

## Tips for Improvement

1. **Start Slow**: Enable count training from hand 1
2. **Focus on Accuracy**: Better to count slowly and correctly
3. **Learn from Mistakes**: Review which cards you miscounted
4. **Track Progress**: Watch your accuracy improve over sessions
5. **Practice Negatives**: Don't shy away from negative counts

## Common Questions

**Q: Can I see the count while playing?**
A: Yes, the running count is displayed during play. Verification tests if you tracked it correctly.

**Q: What happens if I skip?**
A: You'll see the correct count, but it won't count toward your accuracy stats.

**Q: Can I verify true count instead?**
A: Currently only running count. True count verification may be added in future.

**Q: Does verification slow down gameplay?**
A: Feedback is shown for 2 seconds, then auto-advances. Toggle OFF for faster play.
```

**Step 3: Commit documentation**

```bash
git add CLAUDE.md docs/user-guide-count-verification.md
git commit -m "docs: add count verification documentation

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 16: Final Testing and Polish

**Files:**
- Various (bug fixes as needed)

**Step 1: Run all tests**

```bash
pytest tests/ -v
```

Expected: All tests PASS

**Step 2: Run formatter and linter**

```bash
poetry run black blackjack_card_counter/
poetry run isort blackjack_card_counter/
poetry run flake8 blackjack_card_counter/
```

Fix any issues reported.

**Step 3: Test full game flow**

Play 20-30 hands with count verification enabled, exercising:
- Correct counts
- Incorrect counts
- Negative counts
- Skip button
- Toggle on/off
- Stats modal
- CSV export

**Step 4: Performance check**

Verify game maintains 60 FPS with verification enabled.

**Step 5: Commit any final fixes**

```bash
git add .
git commit -m "chore: final polish and bug fixes

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 17: Create Feature Summary

**Files:**
- Create: `docs/feature-count-verification-complete.md`

**Step 1: Document feature completion**

Create summary document:

```markdown
# Count Verification Feature - Implementation Complete

**Feature**: Interactive count verification training system
**Status**: ✅ Complete
**Implemented**: 2025-11-06
**Branch**: learning

## Summary

Successfully implemented count verification system that transforms the blackjack trainer from a passive display tool into an active learning platform. Users can now verify their card counting accuracy after each hand with immediate feedback.

## Implementation Stats

- **Files Modified**: 5
- **Files Created**: 4 (3 test files, 1 doc)
- **Lines Added**: ~450
- **Tests Added**: 9
- **Commits**: 17

## Features Delivered

✅ Count verification after each hand
✅ Immediate visual feedback (green/red overlay)
✅ Count accuracy tracking in statistics
✅ Optional toggle (defaults to ON)
✅ Negative number input support
✅ Skip option for seeing answer
✅ Auto-advance after 2 seconds
✅ Stats modal integration
✅ CSV export with count metrics
✅ Comprehensive test coverage
✅ Full documentation

## Technical Highlights

- Clean state machine extension (verify_count state)
- TDD approach for statistics and UI components
- Zero performance impact (maintains 60 FPS)
- Backward compatible (toggle OFF for original behavior)

## Testing Completed

- ✅ Unit tests for SessionStats count tracking (4 tests)
- ✅ Unit tests for TextInput negative numbers (5 tests)
- ✅ Manual integration testing (all scenarios)
- ✅ Edge case testing (empty input, negatives, rapid clicks)
- ✅ Performance testing (60 FPS maintained)

## User Impact

**Before**: Users could see the count but never validate their counting skills
**After**: Users get immediate feedback on counting accuracy with trackable progress

## Next Steps

Potential enhancements (future):
- True count verification
- Difficulty modes (verify mid-hand)
- Card-by-card replay with count breakdown
- Achievement system for accuracy milestones
- Historical accuracy graphs

## Screenshots

[TODO: Add screenshots of verification prompt and feedback]
```

**Step 2: Commit feature summary**

```bash
git add docs/feature-count-verification-complete.md
git commit -m "docs: add feature completion summary

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Completion Checklist

Before marking the feature complete, verify:

- [ ] All tests pass (`pytest tests/ -v`)
- [ ] Code formatted (`black`, `isort`)
- [ ] No linter errors (`flake8`)
- [ ] Documentation updated (CLAUDE.md, user guide)
- [ ] Manual testing completed (all scenarios)
- [ ] CSV export includes count data
- [ ] Stats modal shows count accuracy
- [ ] Toggle button works correctly
- [ ] Auto-advance works (2 seconds)
- [ ] Negative numbers work
- [ ] Skip button works
- [ ] 60 FPS maintained
- [ ] Feature branch committed to git

---

## Total Estimated Time

- Task 1-4: 1 hour (statistics and constants)
- Task 5-7: 1 hour (game state setup)
- Task 8-10: 2 hours (UI and drawing)
- Task 11-13: 1 hour (toggle and polish)
- Task 14-17: 2 hours (testing and documentation)

**Total: ~7 hours** (achievable in 1 full day)

## Dependencies

- Python 3.10+
- Pygame 2.6+
- pytest (for testing)
- Poetry (for environment)

## Notes

- **TDD Approach**: Tasks 1 and 4 use test-driven development
- **Frequent Commits**: 17 commits planned, each focused on single feature
- **DRY Principle**: Reuse existing UI components (TextInput, Button)
- **YAGNI Principle**: No premature optimization, MVP features only
