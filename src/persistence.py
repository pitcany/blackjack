"""Save/load game sessions and export statistics."""
import json
import csv
import os
from datetime import datetime
from typing import Dict, Any, Optional
from .game import BlackjackGame


class GamePersistence:
    """Handle saving and loading game sessions."""

    SAVE_DIR = "saves"

    @staticmethod
    def _ensure_save_dir():
        """Ensure save directory exists."""
        if not os.path.exists(GamePersistence.SAVE_DIR):
            os.makedirs(GamePersistence.SAVE_DIR)

    @staticmethod
    def save_game(game: BlackjackGame, filename: Optional[str] = None) -> str:
        """Save game state to JSON file.

        Args:
            game: Game instance to save
            filename: Optional filename (will generate timestamp-based if None)

        Returns:
            str: Path to saved file
        """
        GamePersistence._ensure_save_dir()

        if filename is None:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"blackjack_save_{timestamp}.json"

        filepath = os.path.join(GamePersistence.SAVE_DIR, filename)

        # Serialize game state
        game_state = {
            "version": "1.0",
            "saved_at": datetime.now().isoformat(),
            "game_config": {
                "num_decks": game.deck.num_decks,
                "min_bet": game.min_bet,
                "max_bet": game.max_bet,
                "allow_surrender": game.allow_surrender,
                "allow_double_after_split": game.allow_double_after_split,
            },
            "player_state": {
                "balance": game.player_balance,
            },
            "statistics": {
                "rounds_played": game.rounds_played,
                "rounds_won": game.rounds_won,
                "rounds_lost": game.rounds_lost,
                "rounds_pushed": game.rounds_pushed,
                "total_wagered": game.total_wagered,
                "total_won": game.total_won,
            },
            "deck_state": {
                "cards_remaining": game.deck.cards_remaining(),
                "cards_dealt_count": len(game.deck.dealt_cards),
            },
            "counter_state": {
                "running_count": game.counter.running_count,
                "base_bet": game.counter.base_bet,
            }
        }

        with open(filepath, 'w') as f:
            json.dump(game_state, f, indent=2)

        return filepath

    @staticmethod
    def load_game(filepath: str) -> Dict[str, Any]:
        """Load game state from JSON file.

        Args:
            filepath: Path to saved game file

        Returns:
            dict: Game state dictionary

        Raises:
            FileNotFoundError: If file doesn't exist
            json.JSONDecodeError: If file is invalid JSON
        """
        with open(filepath, 'r') as f:
            game_state = json.load(f)

        return game_state

    @staticmethod
    def restore_game(game: BlackjackGame, game_state: Dict[str, Any]):
        """Restore game from saved state.

        Args:
            game: Game instance to restore into
            game_state: Saved game state dictionary
        """
        # Restore player state
        game.player_balance = game_state["player_state"]["balance"]

        # Restore statistics
        stats = game_state["statistics"]
        game.rounds_played = stats["rounds_played"]
        game.rounds_won = stats["rounds_won"]
        game.rounds_lost = stats["rounds_lost"]
        game.rounds_pushed = stats["rounds_pushed"]
        game.total_wagered = stats["total_wagered"]
        game.total_won = stats["total_won"]

        # Restore counter state
        counter_state = game_state["counter_state"]
        game.counter.running_count = counter_state["running_count"]

        # Note: Can't perfectly restore deck state, but we restore the count
        # The deck will be reshuffled on next round

    @staticmethod
    def list_saves() -> list:
        """List all saved game files.

        Returns:
            list: List of (filename, filepath, timestamp) tuples
        """
        GamePersistence._ensure_save_dir()
        saves = []

        for filename in os.listdir(GamePersistence.SAVE_DIR):
            if filename.endswith('.json'):
                filepath = os.path.join(GamePersistence.SAVE_DIR, filename)
                mtime = os.path.getmtime(filepath)
                timestamp = datetime.fromtimestamp(mtime)
                saves.append((filename, filepath, timestamp))

        # Sort by timestamp, newest first
        saves.sort(key=lambda x: x[2], reverse=True)
        return saves

    @staticmethod
    def export_statistics_csv(game: BlackjackGame, filepath: Optional[str] = None) -> str:
        """Export game statistics to CSV file.

        Args:
            game: Game instance
            filepath: Optional filepath (will generate if None)

        Returns:
            str: Path to exported CSV file
        """
        if filepath is None:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filepath = f"blackjack_stats_{timestamp}.csv"

        stats = game.get_statistics()

        # Calculate additional metrics
        win_rate = stats['win_rate']
        net_profit = stats['net_profit']
        house_edge = -net_profit / stats['total_wagered'] * 100 if stats['total_wagered'] > 0 else 0
        avg_bet = stats['total_wagered'] / stats['rounds_played'] if stats['rounds_played'] > 0 else 0

        # Write CSV
        with open(filepath, 'w', newline='') as f:
            writer = csv.writer(f)

            # Header
            writer.writerow(['Blackjack Session Statistics'])
            writer.writerow(['Generated', datetime.now().strftime("%Y-%m-%d %H:%M:%S")])
            writer.writerow([])

            # Session Summary
            writer.writerow(['Session Summary'])
            writer.writerow(['Metric', 'Value'])
            writer.writerow(['Current Balance', f"${stats['balance']}"])
            writer.writerow(['Starting Balance', '$1000'])
            writer.writerow(['Net Profit/Loss', f"${net_profit}"])
            writer.writerow(['Return on Investment', f"{net_profit/1000*100:.2f}%"])
            writer.writerow([])

            # Game Statistics
            writer.writerow(['Game Statistics'])
            writer.writerow(['Metric', 'Value'])
            writer.writerow(['Rounds Played', stats['rounds_played']])
            writer.writerow(['Rounds Won', stats['rounds_won']])
            writer.writerow(['Rounds Lost', stats['rounds_lost']])
            writer.writerow(['Rounds Pushed', stats['rounds_pushed']])
            writer.writerow(['Win Rate', f"{win_rate:.2f}%"])
            writer.writerow([])

            # Betting Statistics
            writer.writerow(['Betting Statistics'])
            writer.writerow(['Metric', 'Value'])
            writer.writerow(['Total Wagered', f"${stats['total_wagered']}"])
            writer.writerow(['Total Won', f"${stats['total_won']}"])
            writer.writerow(['Average Bet', f"${avg_bet:.2f}"])
            writer.writerow(['Effective House Edge', f"{house_edge:.2f}%"])
            writer.writerow([])

            # Card Counting
            writer.writerow(['Card Counting'])
            writer.writerow(['Metric', 'Value'])
            writer.writerow(['Running Count', stats['running_count']])
            writer.writerow(['True Count', f"{stats['true_count']:.2f}"])
            writer.writerow(['Decks Remaining', f"{stats['decks_remaining']:.2f}"])
            writer.writerow([])

            # Session Details
            writer.writerow(['Session Details'])
            writer.writerow(['Setting', 'Value'])
            writer.writerow(['Number of Decks', game.deck.num_decks])
            writer.writerow(['Minimum Bet', f"${game.min_bet}"])
            writer.writerow(['Maximum Bet', f"${game.max_bet}"])
            writer.writerow(['Surrender Allowed', 'Yes' if game.allow_surrender else 'No'])
            writer.writerow(['Double After Split', 'Yes' if game.allow_double_after_split else 'No'])

        return filepath

    @staticmethod
    def export_session_log_csv(sessions: list, filepath: Optional[str] = None) -> str:
        """Export detailed session log to CSV.

        Args:
            sessions: List of session data dictionaries
            filepath: Optional filepath

        Returns:
            str: Path to exported CSV file
        """
        if filepath is None:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filepath = f"blackjack_log_{timestamp}.csv"

        with open(filepath, 'w', newline='') as f:
            writer = csv.writer(f)

            # Header
            writer.writerow([
                'Round', 'Bet', 'Player Hand', 'Dealer Hand',
                'Result', 'Payout', 'Balance', 'Running Count',
                'True Count', 'Strategy Followed'
            ])

            # Write session data
            for session in sessions:
                writer.writerow([
                    session.get('round', ''),
                    session.get('bet', ''),
                    session.get('player_hand', ''),
                    session.get('dealer_hand', ''),
                    session.get('result', ''),
                    session.get('payout', ''),
                    session.get('balance', ''),
                    session.get('running_count', ''),
                    session.get('true_count', ''),
                    session.get('strategy_followed', '')
                ])

        return filepath
