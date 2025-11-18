"""Advanced card counting systems and deviation indices."""
from typing import Optional, Dict
from enum import Enum
from .card import Card, Deck, Hand
from .counter import CardCounter


class CountingSystem(Enum):
    """Available counting systems."""
    HI_LO = "Hi-Lo"
    KO = "Knock-Out (KO)"
    OMEGA_II = "Omega II"


class AdvancedCounter(CardCounter):
    """Extended card counter with multiple systems and deviation indices."""

    # Card values for different counting systems
    SYSTEM_VALUES = {
        CountingSystem.HI_LO: {
            '2': 1, '3': 1, '4': 1, '5': 1, '6': 1,
            '7': 0, '8': 0, '9': 0,
            '10': -1, 'J': -1, 'Q': -1, 'K': -1, 'A': -1
        },
        CountingSystem.KO: {
            '2': 1, '3': 1, '4': 1, '5': 1, '6': 1, '7': 1,
            '8': 0, '9': 0,
            '10': -1, 'J': -1, 'Q': -1, 'K': -1, 'A': -1
        },
        CountingSystem.OMEGA_II: {
            '2': 1, '3': 1, '4': 2, '5': 2, '6': 2, '7': 1,
            '8': 0, '9': -1,
            '10': -2, 'J': -2, 'Q': -2, 'K': -2, 'A': 0
        }
    }

    # Initial running counts for unbalanced systems
    INITIAL_COUNTS = {
        CountingSystem.HI_LO: 0,
        CountingSystem.KO: 0,  # KO starts at 0, adjusts based on decks
        CountingSystem.OMEGA_II: 0,
    }

    def __init__(self, deck: Deck, base_bet: int = 10,
                 system: CountingSystem = CountingSystem.HI_LO):
        """Initialize the advanced counter.

        Args:
            deck: The deck being used
            base_bet: Base betting unit
            system: Counting system to use
        """
        super().__init__(deck, base_bet)
        self.system = system
        self.running_count = self.INITIAL_COUNTS[system]

        # For KO system, calculate the initial running count (IRC) and key count
        if system == CountingSystem.KO:
            # IRC = -4 * num_decks for KO system
            self.initial_running_count = -4 * deck.num_decks
            self.running_count = self.initial_running_count
            # Key count (pivot point) = decks - 1
            self.key_count = deck.num_decks - 1

    def reset(self):
        """Reset the count."""
        self.running_count = self.INITIAL_COUNTS[self.system]
        if self.system == CountingSystem.KO:
            self.running_count = self.initial_running_count

    def update(self, card: Card):
        """Update count based on dealt card using selected system.

        Args:
            card: The card that was dealt
        """
        card_value = self.SYSTEM_VALUES[self.system].get(card.rank, 0)
        self.running_count += card_value

    def get_true_count(self) -> float:
        """Get true count (or running count for unbalanced systems).

        Returns:
            float: True count for balanced systems, running count for KO
        """
        if self.system == CountingSystem.KO:
            # KO is unbalanced, use running count directly
            return float(self.running_count)

        # For balanced systems (Hi-Lo, Omega II), calculate true count
        decks_remaining = self.deck.decks_remaining()
        if decks_remaining <= 0:
            return 0.0
        return self.running_count / decks_remaining

    def get_advantage(self) -> float:
        """Estimate player advantage.

        Returns:
            float: Estimated advantage as percentage
        """
        if self.system == CountingSystem.HI_LO:
            return self.get_true_count() * 0.5
        elif self.system == CountingSystem.KO:
            # KO: advantage increases past key count
            if self.running_count > self.key_count:
                return (self.running_count - self.key_count) * 0.5
            return 0.0
        elif self.system == CountingSystem.OMEGA_II:
            # Omega II is more accurate, slightly different conversion
            return self.get_true_count() * 0.55

        return 0.0

    def get_count_status(self) -> str:
        """Get count status description.

        Returns:
            str: Status description
        """
        if self.system == CountingSystem.KO:
            # Use running count for KO
            if self.running_count < self.key_count - 2:
                return "Very Unfavorable"
            elif self.running_count < self.key_count:
                return "Unfavorable"
            elif self.running_count <= self.key_count + 2:
                return "Neutral"
            elif self.running_count <= self.key_count + 4:
                return "Favorable"
            else:
                return "Very Favorable"
        else:
            # Use true count for balanced systems
            return super().get_count_status()

    def get_system_name(self) -> str:
        """Get the name of the current counting system.

        Returns:
            str: System name
        """
        return self.system.value


class DeviationIndices:
    """Implements strategy deviations based on true count (Illustrious 18)."""

    # The "Illustrious 18" - most valuable strategy deviations
    # Format: (player_hand, dealer_card): {true_count: action}
    ILLUSTRIOUS_18 = {
        # Insurance
        ('insurance', 'any'): {3: 'take'},  # Take insurance at TC +3

        # Standing decisions (normally hit)
        (16, 10): {0: 'stand'},  # Stand 16 vs 10 at TC 0+
        (16, 9): {5: 'stand'},   # Stand 16 vs 9 at TC +5
        (15, 10): {4: 'stand'},  # Stand 15 vs 10 at TC +4
        (13, 2): {-1: 'stand'},  # Stand 13 vs 2 at TC -1
        (13, 3): {-2: 'stand'},  # Stand 13 vs 3 at TC -2
        (12, 2): {3: 'stand'},   # Stand 12 vs 2 at TC +3
        (12, 3): {2: 'stand'},   # Stand 12 vs 3 at TC +2
        (12, 4): {0: 'stand'},   # Stand 12 vs 4 at TC 0
        (12, 5): {-2: 'stand'},  # Stand 12 vs 5 at TC -2
        (12, 6): {-1: 'stand'},  # Stand 12 vs 6 at TC -1

        # Doubling decisions (normally hit)
        (11, 1): {1: 'double'},  # Double 11 vs A at TC +1
        (10, 10): {4: 'double'}, # Double 10 vs 10 at TC +4
        (10, 1): {4: 'double'},  # Double 10 vs A at TC +4
        (9, 2): {1: 'double'},   # Double 9 vs 2 at TC +1
        (9, 7): {3: 'double'},   # Double 9 vs 7 at TC +3

        # Pair splitting
        ((10, 10), 5): {5: 'split'},  # Split 10s vs 5 at TC +5
        ((10, 10), 6): {4: 'split'},  # Split 10s vs 6 at TC +4
    }

    @staticmethod
    def get_deviation(player_hand: Hand, dealer_card: Card,
                     true_count: float, basic_action: str) -> str:
        """Check if count warrants deviating from basic strategy.

        Args:
            player_hand: Player's hand
            dealer_card: Dealer's up card
            true_count: Current true count
            basic_action: Basic strategy recommendation

        Returns:
            str: Action to take (may be different from basic_action)
        """
        player_value = player_hand.get_value()
        dealer_value = dealer_card.value if dealer_card.rank != 'A' else 1

        # Check for deviation in Illustrious 18
        # First check for pairs
        if player_hand.is_pair():
            key = ((10, 10), dealer_value)
            if key in DeviationIndices.ILLUSTRIOUS_18:
                threshold = list(DeviationIndices.ILLUSTRIOUS_18[key].keys())[0]
                if true_count >= threshold:
                    return DeviationIndices.ILLUSTRIOUS_18[key][threshold]

        # Check regular hands
        key = (player_value, dealer_value)
        if key in DeviationIndices.ILLUSTRIOUS_18:
            threshold = list(DeviationIndices.ILLUSTRIOUS_18[key].keys())[0]
            if true_count >= threshold:
                action = DeviationIndices.ILLUSTRIOUS_18[key][threshold]
                # Convert to action codes
                if action == 'stand':
                    return 'S'
                elif action == 'double':
                    return 'D'
                elif action == 'split':
                    return 'P'

        # Check special case: Insurance
        if dealer_card.rank == 'A' and true_count >= 3:
            # At high counts, insurance becomes profitable
            # (Not implemented in base game, but noted here)
            pass

        # No deviation, use basic strategy
        return basic_action

    @staticmethod
    def get_fab_four(player_hand: Hand, dealer_card: Card,
                     true_count: float) -> Optional[str]:
        """Check Fab Four surrender deviations.

        Args:
            player_hand: Player's hand
            dealer_card: Dealer's up card
            true_count: Current true count

        Returns:
            Optional[str]: 'R' if should surrender, None otherwise
        """
        player_value = player_hand.get_value()
        dealer_value = dealer_card.value if dealer_card.rank != 'A' else 1

        fab_four = {
            (14, 10): 3,   # Surrender 14 vs 10 at TC +3
            (15, 10): 0,   # Surrender 15 vs 10 at TC 0
            (15, 9): 2,    # Surrender 15 vs 9 at TC +2
            (15, 1): 1,    # Surrender 15 vs A at TC +1
        }

        key = (player_value, dealer_value)
        if key in fab_four:
            if true_count >= fab_four[key]:
                return 'R'

        return None

    @staticmethod
    def should_take_insurance(true_count: float) -> bool:
        """Determine if insurance should be taken based on count.

        Args:
            true_count: Current true count

        Returns:
            bool: True if should take insurance
        """
        # Insurance becomes profitable at TC +3 or higher
        return true_count >= 3.0
