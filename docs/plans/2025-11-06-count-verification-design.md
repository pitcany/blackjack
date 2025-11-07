# Count Verification System Design

**Date:** 2025-11-06
**Feature:** Interactive count verification for card counting training
**Impact:** Transforms passive simulation into active learning trainer
**Effort Estimate:** 2-3 days

## Problem Statement

The current blackjack trainer displays the running count automatically, but provides no mechanism for users to verify they're counting correctly. Users can see the count but never validate their own counting skills, missing the core educational value of a counting trainer.

## Goals

1. **Validate Learning**: Allow users to test their count accuracy after each hand
2. **Track Progress**: Measure count accuracy over time to show improvement
3. **Maintain Flow**: Keep verification non-intrusive and quick
4. **Stay Flexible**: Make verification optional for advanced users or strategy-only practice

## Design Decisions

### Timing: When to Verify
**Decision:** After each hand ends (before next bet)

**Rationale:**
- Non-intrusive to gameplay flow
- Natural checkpoint in the betting → playing → verify → bet cycle
- Ensures consistent practice without feeling repetitive

### Feedback: What to Show
**Decision:** Immediate, clear feedback with correct count displayed

**Options considered:**
- Show difference only ("off by +3") - rejected: too indirect for beginners
- Highlight missed cards - rejected: over-engineered for MVP
- Graduated feedback - rejected: slows flow

**Feedback format:**
- ✅ Correct: Green checkmark + "Correct! Running count: X"
- ❌ Incorrect: Red X + "Incorrect. Your count: Y | Actual count: X"

### Requirement Level: Optional or Mandatory
**Decision:** Optional toggle (defaults to ON)

**Rationale:**
- Beginners benefit from mandatory practice
- Advanced users can disable for strategy-only training
- Flexibility supports multiple use cases

## Architecture

### New Game State

Current state machine:
```
betting → playing → dealer → finished → betting
```

New state machine (when verification enabled):
```
betting → playing → dealer → finished → verify_count → betting
                                      ↓ (if disabled)
                                    betting
```

### Data Model Extensions

**BlackjackGame class additions:**
```python
# Verification state
count_verification_enabled: bool = True       # Toggle for verification mode
user_count_input: TextInput                   # Input field for user's count
verification_result: Optional[str]            # "correct", "incorrect", or None
verification_feedback_timer: int              # Timestamp for 2-second feedback display
count_accuracy_history: List[bool]            # Track recent attempts (last 50)
```

**SessionStats extensions (statistics.py):**
```python
count_correct: int = 0                        # Number of correct verifications
count_attempts: int = 0                       # Total verification attempts
count_accuracy_by_session: List[float]        # Historical accuracy tracking

def record_count_verification(self, is_correct: bool):
    """Record a count verification attempt."""

@property
def count_accuracy_percentage(self) -> float:
    """Calculate count accuracy as percentage."""
```

### Key Methods

**game.py additions:**

```python
def check_count_verification(self, user_count: int) -> bool:
    """Compare user's count with actual running count.

    Args:
        user_count: The count value entered by the user

    Returns:
        True if correct, False otherwise

    Side effects:
        - Updates statistics via stats.record_count_verification()
        - Sets verification_result for display
        - Sets verification_feedback_timer for auto-advance
    """
    is_correct = (user_count == self.running_count)
    self.stats.record_count_verification(is_correct)
    self.verification_result = "correct" if is_correct else "incorrect"
    self.verification_feedback_timer = pygame.time.get_ticks()
    return is_correct

def draw_verification_screen(self, screen):
    """Render the count verification interface.

    Shows:
    - Prompt: "What's the running count?"
    - Text input field (centered)
    - Submit button (or Enter to submit)
    - Skip button (shows answer without guessing)
    """

def draw_verification_feedback(self, screen):
    """Render verification result feedback.

    Shows for 2 seconds:
    - Green checkmark OR red X
    - Message with user's count vs. actual count
    - Semi-transparent overlay to focus attention

    Auto-advances to betting state after 2 seconds.
    """
```

## UI/UX Specifications

### Verification Screen Layout

**Location:** Center screen, below dealer/player cards

**Elements:**
1. **Prompt Text**
   - Content: "What's the running count?"
   - Font: LARGE_FONT
   - Color: WHITE
   - Position: Centered, y=500

2. **Input Field**
   - TextInput widget (150px wide)
   - Accepts integers (including negatives with minus sign)
   - Centered horizontally
   - Auto-focused (ready for typing)

3. **Buttons**
   - "Submit" button (120px wide, BLUE) - or press Enter
   - "Skip" button (120px wide, GRAY) - shows answer without attempt
   - Positioned side-by-side below input

### Feedback Display

**Duration:** 2 seconds (then auto-advance to betting)

**Correct Feedback:**
- Large green checkmark (✓)
- Text: "Correct! Running count: {X}"
- Background: Semi-transparent green overlay (alpha=100)

**Incorrect Feedback:**
- Large red X (✗)
- Text: "Incorrect. Your count: {Y} | Actual count: {X}"
- Background: Semi-transparent red overlay (alpha=100)

### Settings Toggle

**Location:** Top bar, near existing Help/Stats buttons

**Button:**
- Label: "Count Training"
- States: "ON" (green) / "OFF" (gray)
- Position: Right side of top bar (x=1150, y=20)
- Width: 180px, Height: 50px

**Behavior:**
- Click to toggle between ON/OFF
- When OFF: Game skips verify_count state entirely
- Setting persists (save to user config)

### Statistics Display Updates

**Stats Modal additions:**

```
Session Statistics
------------------
Hands Played: 47
Win Rate: 42.6% (20 wins, 27 losses)
Count Accuracy: 87.2% (41/47 correct)  ← NEW
Bankroll: $1,240 (↑ 24%)
...
```

**CSV Export additions:**
- Add columns: `count_correct`, `count_attempts`, `count_accuracy_pct`

## Implementation Plan

### Phase 1: Core Verification Logic (Day 1)
1. Add verification state variables to `BlackjackGame.__init__`
2. Implement `check_count_verification()` method
3. Add state transition logic (finished → verify_count → betting)
4. Create `draw_verification_screen()` method
5. Handle user input in `handle_events()` for verify_count state

### Phase 2: Feedback & Statistics (Day 2)
1. Implement `draw_verification_feedback()` with 2-second timer
2. Extend `SessionStats` with count tracking
3. Update stats modal to display count accuracy
4. Add CSV export columns
5. Create count training toggle button

### Phase 3: Input Enhancement & Polish (Day 3)
1. Update `TextInput` to accept negative integers
2. Add "Skip" button functionality
3. Add keyboard shortcut (Enter to submit)
4. Test all edge cases (negative counts, large numbers, etc.)
5. Add visual polish (colors, overlay effects)

### Phase 4: Testing & Documentation
1. Manual testing of full verification flow
2. Test toggle ON/OFF behavior
3. Verify statistics accuracy
4. Update user documentation
5. Test CSV export format

## Files Modified

### Primary Changes
- `blackjack_card_counter/game.py` - Main implementation (~150 lines added)
- `blackjack_card_counter/statistics.py` - Count tracking (~40 lines added)
- `blackjack_card_counter/ui.py` - TextInput negative number support (~10 lines modified)
- `blackjack_card_counter/constants.py` - New colors (~5 lines added)

### Documentation
- Update CLAUDE.md with verification feature description
- Add user guide section for count training mode

## Testing Strategy

### Manual Test Cases
1. **Happy Path**: Enter correct count → See green feedback → Stats updated
2. **Incorrect Count**: Enter wrong count → See red feedback with both values
3. **Negative Counts**: Verify negative number input works
4. **Skip Button**: Click skip → See correct answer → Stats not updated
5. **Toggle OFF**: Disable verification → Hand ends → Skip directly to betting
6. **Statistics**: Complete 10 hands → Check accuracy percentage is correct
7. **CSV Export**: Export stats → Verify count columns present
8. **Edge Cases**:
   - Count of 0
   - Very large counts (+30, -30)
   - Empty input submission
   - Multiple rapid submissions

### Success Criteria
- ✅ Verification appears after every hand (when enabled)
- ✅ Feedback displays for exactly 2 seconds
- ✅ Accuracy percentage calculates correctly
- ✅ Toggle persists across sessions
- ✅ No performance impact (maintains 60 FPS)
- ✅ Input handles all valid integer values

## Future Enhancements (Out of Scope)

### Potential v2 Features
1. **Difficulty Modes**
   - Easy: Verify after hand (current design)
   - Medium: Verify after dealer reveals hole card
   - Hard: Verify mid-hand after each card

2. **Detailed Feedback**
   - Show which cards were miscounted
   - Replay hand with count breakdown
   - Practice mode with slower card reveals

3. **True Count Verification**
   - Verify both running and true count
   - Test deck estimation skills

4. **Achievement System**
   - "Perfect Session" badge (100% accuracy)
   - "Consistency" badge (90%+ for 10 sessions)
   - Streak tracking

5. **Historical Analytics**
   - Graph of accuracy over time
   - Accuracy by deck count (6-deck vs 8-deck)
   - Correlation with bankroll performance

## Risk Assessment

### Low Risk
- ✅ Feature is additive (doesn't modify existing game logic)
- ✅ Optional toggle prevents disruption to existing users
- ✅ Simple state machine addition

### Mitigation
- Extensive manual testing of state transitions
- Toggle defaults to ON but clearly visible for disabling
- Statistics tracking isolated in SessionStats class

## Success Metrics

**Quantitative:**
- Feature completion: All Phase 1-3 tasks done
- No performance regression: 60 FPS maintained
- Statistics accuracy: 100% match with actual count

**Qualitative:**
- User can verify count after each hand
- Feedback is clear and immediate
- Flow feels natural and non-intrusive
- Toggle is discoverable and functional

## Conclusion

This count verification system transforms the blackjack trainer from a passive display tool into an active learning platform. By requiring users to test their counting skills after each hand, we create deliberate practice opportunities that directly improve card counting accuracy.

The optional toggle ensures flexibility for different user skill levels and use cases, while the statistics tracking provides measurable progress indicators that motivate continued practice.

**Next Steps:**
1. Review and approve this design
2. Create implementation plan with detailed tasks
3. Set up isolated git worktree for development
4. Begin Phase 1 implementation
