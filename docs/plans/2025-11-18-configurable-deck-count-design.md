# Configurable Deck Count Feature Design

**Date:** 2025-11-18
**Feature:** Allow users to modify the number of decks used in the game

## Overview

Add the ability for users to configure the number of decks (1-8) used in the blackjack shoe. This feature provides flexibility for players to experiment with different casino configurations and understand how deck count affects card counting effectiveness.

## Requirements

- Support 1-8 decks (standard casino range)
- Changing deck count creates a fresh shoe and resets the running count
- Only allow changes between rounds (not mid-hand)
- Preserve session statistics (balance, win/loss record)
- Display current deck count in the UI

## UI Components & User Flow

### Settings Dialog Structure

Following the existing "Adjust Balance" pattern (`gui.py:475-533`), add a "Game Settings" button in the statistics frame. The dialog contains:

- Current deck configuration display
- Spinbox to select 1-8 decks
- Warning message: "Changing decks will shuffle a new shoe and reset the card count"
- Save/Cancel buttons with validation

### User Flow

1. User clicks "Game Settings" button (available only between rounds, when `state == WAITING_FOR_BET`)
2. Dialog shows current deck count with spinbox selector
3. If user changes and saves:
   - System validates the selection (1-8 range)
   - Confirmation that shoe will be shuffled and count reset
   - Game creates new `Deck(num_decks)` instance
   - Counter resets with new deck configuration
   - Balance and statistics preserved
4. Display updates to show new deck count

### Visual Integration

**Settings Button Placement:**
- Location: Statistics frame, below balance adjustment
- Style: Matches existing button theme
- State: Disabled during active rounds

**Deck Count Display:**
- Location: Card Counting section (`gui.py:91-114`)
- Format: "Decks in Shoe: 6"
- Updates: Refreshed in `update_display()` method

## Backend Implementation

### Game Class Modifications (`game.py`)

**New State Storage:**
```python
self.num_decks = num_decks  # Store current configuration
```

**New Methods:**

1. **`set_num_decks(num_decks: int) -> bool`**
   - Validates deck count (1-8 range)
   - Checks game state (only allow during `WAITING_FOR_BET`)
   - Creates new `Deck(num_decks)` instance
   - Reinitializes `CardCounter(new_deck, base_bet=self.min_bet)`
   - Preserves: balance, statistics, min/max bet, game rules
   - Returns: `True` if successful, `False` if invalid/not allowed

2. **`get_num_decks() -> int`**
   - Returns current deck count
   - Used by GUI for display

### Counter Reset Logic

When changing deck count:
- Create new `Deck(num_decks)` instance
- Create new `CardCounter(deck, base_bet)` instance
- Running count automatically resets to 0 (new counter instance)
- True count recalculated based on new deck configuration

### Statistics Preservation

All session data preserved:
- `player_balance`
- `rounds_played`, `rounds_won`, `rounds_lost`
- `total_wagered`, `total_won`
- Game settings: `min_bet`, `max_bet`, `allow_surrender`, `allow_double_after_split`

## GUI Implementation Details

### Settings Button (`_create_top_section` modification)

After balance adjustment button at `gui.py:74-78`:
```python
settings_btn = tk.Button(stats_frame, text="Game Settings",
                        command=self.open_settings,
                        bg=self.button_color, fg=self.text_color,
                        font=('Arial', 9), width=12)
settings_btn.pack(pady=2)
```

### Settings Dialog Method

New method `open_settings()` following pattern of `adjust_balance()` (`gui.py:475-533`):

**Dialog Structure:**
- Title: "Game Settings"
- Size: 400x250
- Modal (transient, grab_set)

**Components:**
- Header label: "Game Settings"
- Current deck display: "Current Decks: 6"
- Spinbox: range 1-8, increment 1
- Warning label (yellow text): "Changing decks will shuffle a new shoe and reset the card count"
- Save button: validates and applies changes
- Cancel button: closes dialog

**Validation & Error Handling:**
- If mid-round: Show error messagebox "Cannot change settings during an active round"
- If invalid range: Handled by Spinbox constraints
- On success: Show info messagebox "Game settings updated. New shoe shuffled."

### Deck Count Display Label

Add to Card Counting frame (`_create_top_section`, after `gui.py:114`):
```python
self.deck_count_label = tk.Label(count_frame,
                                text="Decks in Shoe: 6",
                                bg=self.bg_color, fg=self.text_color,
                                font=('Arial', 10))
self.deck_count_label.pack(pady=2)
```

Update in `update_display()` method:
```python
self.deck_count_label.config(text=f"Decks in Shoe: {self.game.get_num_decks()}")
```

### Button State Management

Add to `_update_button_states()` method (`gui.py:398-415`):
```python
# Settings button
can_change_settings = self.game.state == GameState.WAITING_FOR_BET
self.settings_btn.config(state=tk.NORMAL if can_change_settings else tk.DISABLED)
```

Store reference to button as `self.settings_btn` during creation.

## Technical Considerations

### Deck Configuration Impact

**Card Counting Accuracy:**
- True count = Running count / Remaining decks
- More decks = slower count changes, less volatile
- Fewer decks = faster count changes, more advantage/disadvantage swings

**Game Balance:**
- Single deck: Player advantage with counting (~0.5-1%)
- 6-8 decks: House advantage even with counting (standard casino defense)

### State Management

**Safe Transition:**
1. Only allow changes when `state == WAITING_FOR_BET`
2. No active bets or hands in play
3. Clean state for shoe replacement

**Preserved vs. Reset:**
- Preserved: Balance, statistics, game rules, bet limits
- Reset: Deck, running count, true count, cards dealt

## Files Modified

1. **`src/game.py`**
   - Add `self.num_decks` attribute
   - Add `set_num_decks()` method
   - Add `get_num_decks()` method

2. **`src/gui.py`**
   - Add settings button in `_create_top_section()`
   - Add deck count label in `_create_top_section()`
   - Add `open_settings()` method (new dialog)
   - Update `update_display()` to refresh deck count
   - Update `_update_button_states()` for settings button
   - Store `self.settings_btn` reference

3. **`docs/plans/`** (this document)

## Testing Considerations

**Unit Tests (`tests/test_game.py`):**
- Test `set_num_decks()` with valid range (1-8)
- Test rejection outside range (0, 9, -1)
- Test rejection during active round
- Test deck instance replacement
- Test counter reset
- Test statistics preservation

**Integration Tests:**
- Test full flow: change decks → deal → verify new shoe
- Test true count calculation with different deck counts
- Test UI button states during round vs. between rounds

**Manual Testing:**
- Verify dialog appearance and behavior
- Test spinbox controls
- Verify count reset and deck count display update
- Test changing decks multiple times in sequence

## Future Enhancements

- Save deck preference to config file for persistence across sessions
- Advanced settings: penetration percentage, dealer rule variations (S17 vs H17)
- Visual indicator when deck count differs from default (6)
- Statistics tracking per deck configuration

## Success Criteria

- User can change deck count via settings dialog
- Deck count only changeable between rounds
- Changing decks creates new shoe and resets count
- Current deck count always visible in UI
- Balance and session statistics preserved
- No errors or state corruption from deck changes
