"""Statistics tracking for blackjack sessions."""

import json
import csv
from typing import Dict, List
from datetime import datetime
from pathlib import Path


class SessionStats:
    """Track and manage game statistics."""

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
        
        # Load previous stats if they exist
        self.load_stats()
    
    def record_hand(self, result: str, bet_amount: int, payout: int, is_blackjack: bool = False):
        """Record a completed hand.
        
        Args:
            result: 'win', 'loss', or 'push'
            bet_amount: Amount bet on the hand
            payout: Net payout (positive for win, negative for loss, 0 for push)
            is_blackjack: Whether player got blackjack
        """
        self.hands_played += 1
        self.total_wagered += bet_amount
        
        if result == 'win':
            self.hands_won += 1
            self.total_won += payout
            if payout > self.biggest_win:
                self.biggest_win = payout
        elif result == 'loss':
            self.hands_lost += 1
            self.total_lost += abs(payout)
            if abs(payout) > self.biggest_loss:
                self.biggest_loss = abs(payout)
        else:  # push
            self.hands_pushed += 1
        
        if is_blackjack:
            self.blackjacks += 1
    
    def record_bankroll(self, bankroll: int, running_count: int, true_count: int):
        """Record current bankroll for history tracking.
        
        Args:
            bankroll: Current bankroll amount
            running_count: Current running count
            true_count: Current true count
        """
        self.bankroll_history.append({
            'hand': self.hands_played,
            'bankroll': bankroll,
            'running_count': running_count,
            'true_count': true_count,
            'timestamp': datetime.now().isoformat()
        })
    
    def get_win_rate(self) -> float:
        """Calculate win rate percentage."""
        if self.hands_played == 0:
            return 0.0
        return (self.hands_won / self.hands_played) * 100
    
    def get_net_profit(self) -> int:
        """Calculate net profit/loss."""
        return self.total_won - self.total_lost
    
    def get_roi(self) -> float:
        """Calculate return on investment percentage."""
        if self.total_wagered == 0:
            return 0.0
        return (self.get_net_profit() / self.total_wagered) * 100
    
    def get_session_duration(self) -> str:
        """Get formatted session duration."""
        duration = datetime.now() - self.session_start
        hours = duration.seconds // 3600
        minutes = (duration.seconds % 3600) // 60
        if hours > 0:
            return f"{hours}h {minutes}m"
        return f"{minutes}m"
    
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
            'bankroll_history': self.bankroll_history
        }
        
        try:
            with open(self.stats_file, 'w') as f:
                json.dump(data, f, indent=2)
        except Exception as e:
            print(f"Error saving stats: {e}")
    
    def load_stats(self):
        """Load statistics from file."""
        try:
            if self.stats_file.exists():
                with open(self.stats_file, 'r') as f:
                    data = json.load(f)
                    self.hands_played = data.get('hands_played', 0)
                    self.hands_won = data.get('hands_won', 0)
                    self.hands_lost = data.get('hands_lost', 0)
                    self.hands_pushed = data.get('hands_pushed', 0)
                    self.blackjacks = data.get('blackjacks', 0)
                    self.total_wagered = data.get('total_wagered', 0)
                    self.total_won = data.get('total_won', 0)
                    self.total_lost = data.get('total_lost', 0)
                    self.biggest_win = data.get('biggest_win', 0)
                    self.biggest_loss = data.get('biggest_loss', 0)
                    self.bankroll_history = data.get('bankroll_history', [])
                    
                    # Parse session start time
                    start_str = data.get('session_start')
                    if start_str:
                        self.session_start = datetime.fromisoformat(start_str)
        except Exception as e:
            print(f"Error loading stats: {e}")
    
    def export_to_csv(self, filename: str = None):
        """Export session data to CSV.
        
        Args:
            filename: Output CSV filename (default: blackjack_session_YYYYMMDD_HHMMSS.csv)
        """
        if filename is None:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"blackjack_session_{timestamp}.csv"
        
        filepath = Path.home() / "Downloads" / filename
        filepath.parent.mkdir(exist_ok=True)
        
        try:
            with open(filepath, 'w', newline='') as f:
                writer = csv.writer(f)
                
                # Write summary statistics
                writer.writerow(['Session Statistics'])
                writer.writerow(['Metric', 'Value'])
                writer.writerow(['Hands Played', self.hands_played])
                writer.writerow(['Hands Won', self.hands_won])
                writer.writerow(['Hands Lost', self.hands_lost])
                writer.writerow(['Hands Pushed', self.hands_pushed])
                writer.writerow(['Blackjacks', self.blackjacks])
                writer.writerow(['Win Rate', f"{self.get_win_rate():.2f}%"])
                writer.writerow(['Total Wagered', f"${self.total_wagered}"])
                writer.writerow(['Total Won', f"${self.total_won}"])
                writer.writerow(['Total Lost', f"${self.total_lost}"])
                writer.writerow(['Net Profit/Loss', f"${self.get_net_profit()}"])
                writer.writerow(['ROI', f"{self.get_roi():.2f}%"])
                writer.writerow(['Biggest Win', f"${self.biggest_win}"])
                writer.writerow(['Biggest Loss', f"${self.biggest_loss}"])
                writer.writerow(['Session Duration', self.get_session_duration()])
                writer.writerow([])
                
                # Write bankroll history
                writer.writerow(['Bankroll History'])
                writer.writerow(['Hand', 'Bankroll', 'Running Count', 'True Count', 'Timestamp'])
                for record in self.bankroll_history:
                    writer.writerow([
                        record['hand'],
                        f"${record['bankroll']}",
                        record['running_count'],
                        record['true_count'],
                        record['timestamp']
                    ])
            
            return str(filepath)
        except Exception as e:
            print(f"Error exporting to CSV: {e}")
            return None
    
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
        self.save_stats()
