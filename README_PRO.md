# Blackjack Pro - Advanced Card Counting Simulator

Professional-grade Blackjack training software with multiple counting systems, deviation indices, and advanced features.

![Python Version](https://img.shields.io/badge/python-3.7%2B-blue)
![Version](https://img.shields.io/badge/version-2.0-green)

## 🎯 New in Version 2.0

### **Multiple Counting Systems**
- **Hi-Lo** - The classic balanced system (easiest to learn)
- **Knock-Out (KO)** - Unbalanced system, no true count conversion needed
- **Omega II** - Advanced balanced system for maximum accuracy

### **Deviation Indices**
- **Illustrious 18** - The 18 most profitable strategy deviations
- **Fab Four** - Critical surrender decisions
- Real-time deviation recommendations based on true count

### **Session Management**
- **Save/Load Games** - Continue your sessions anytime
- **CSV Export** - Professional statistics export for analysis
- **Session History** - Track all your saved games

### **Enhanced Analytics**
- Player advantage percentage display
- Detailed betting statistics
- ROI tracking
- Effective house edge calculation

## 🚀 Quick Start

### Standard Version
```bash
python main.py
```
Features basic Hi-Lo counting and standard play.

### Pro Version (Recommended)
```bash
python main_pro.py
```
Includes all advanced features: multiple counting systems, deviation indices, save/load, CSV export.

## 📊 Counting Systems Explained

### Hi-Lo (Balanced)
The most popular card counting system - perfect for beginners.

**Card Values:**
- 2-6: +1
- 7-9: 0
- 10-A: -1

**How to Use:**
- Calculate true count by dividing running count by remaining decks
- Bet more when true count is positive
- Use basic strategy with deviation indices at high counts

### Knock-Out/KO (Unbalanced)
Simpler than Hi-Lo - no true count conversion needed!

**Card Values:**
- 2-7: +1 (note: 7 is +1, unlike Hi-Lo)
- 8-9: 0
- 10-A: -1

**How to Use:**
- Running count starts at IRC (Initial Running Count)
- IRC = -4 × number of decks
- Key Count (pivot point) = decks - 1
- Bet more when running count exceeds Key Count
- No division required - faster and easier

### Omega II (Balanced)
Most accurate system but more complex.

**Card Values:**
- 2, 3, 7: +1
- 4, 5, 6: +2
- 8, A: 0
- 9: -1
- 10, J, Q, K: -2

**How to Use:**
- More granular card values provide better accuracy
- Calculate true count like Hi-Lo
- Requires more practice but gives ~10% more edge
- Best for serious players

## 🎓 Deviation Indices

### What Are Deviations?
Strategy adjustments based on the true count that increase your edge beyond basic strategy.

### The Illustrious 18
The 18 most valuable count-based strategy deviations:

#### Standing Decisions
- **16 vs 10**: Stand at TC 0+ (normally surrender/hit)
- **16 vs 9**: Stand at TC +5
- **15 vs 10**: Stand at TC +4
- **13 vs 2**: Stand at TC -1
- **13 vs 3**: Stand at TC -2
- **12 vs 2**: Stand at TC +3
- **12 vs 3**: Stand at TC +2
- **12 vs 4**: Stand at TC 0
- **12 vs 5**: Stand at TC -2
- **12 vs 6**: Stand at TC -1

#### Doubling Decisions
- **11 vs A**: Double at TC +1 (normally hit)
- **10 vs 10**: Double at TC +4 (normally hit)
- **10 vs A**: Double at TC +4 (normally hit)
- **9 vs 2**: Double at TC +1 (normally hit)
- **9 vs 7**: Double at TC +3 (normally hit)

#### Splitting Decisions
- **10-10 vs 5**: Split at TC +5 (normally stand)
- **10-10 vs 6**: Split at TC +4 (normally stand)

#### Insurance
- **Any hand vs A**: Take insurance at TC +3

### The Fab Four (Surrender Deviations)
- **14 vs 10**: Surrender at TC +3
- **15 vs 10**: Surrender at TC 0
- **15 vs 9**: Surrender at TC +2
- **15 vs A**: Surrender at TC +1

## 💾 Save/Load Feature

### Saving Your Game
1. Click **File → Save Game**
2. Game state saved automatically with timestamp
3. Saves include:
   - Current balance
   - All statistics (wins, losses, etc.)
   - Card count state
   - Game configuration

### Loading a Game
1. Click **File → Load Game**
2. Select from list of saved games
3. Game restores exactly where you left off

**Save Location:** `saves/` directory in project folder

## 📈 CSV Export

### What Gets Exported
- **Session Summary**: Balance, ROI, net profit/loss
- **Game Statistics**: Rounds played, win rate, pushes
- **Betting Statistics**: Total wagered, average bet, house edge
- **Card Counting**: Current counts, decks remaining
- **Game Configuration**: Rules, bet limits, etc.

### How to Export
1. Click **File → Export Statistics (CSV)**
2. File saved with timestamp: `blackjack_stats_YYYYMMDD_HHMMSS.csv`
3. Open in Excel, Google Sheets, or any spreadsheet software

### Example Uses
- Track your performance over time
- Analyze betting patterns
- Compare different counting systems
- Calculate actual ROI and variance

## 🎮 Using the Pro Version

### Changing Counting Systems
1. Go to **Settings → Counting System**
2. Select: Hi-Lo, KO, or Omega II
3. Deck automatically resets
4. Counts update according to new system

### Enabling Deviation Indices
1. Go to **Settings → Use Deviation Indices**
2. Check the box to enable
3. Strategy recommendations will show deviations in **magenta color**
4. Format: "Strategy: STAND (DEVIATION at TC +2.0)"

### Reading the Display

**Statistics Panel (Left):**
- Current balance
- Rounds/wins/losses
- Win rate percentage

**Card Counting Panel (Middle):**
- Active counting system
- Running count
- True count (or RC for KO)
- Count status (Favorable/Unfavorable)

**Betting Panel (Right):**
- Suggested bet based on count
- Player advantage percentage
- Deviation status (ON/OFF)

## 📚 Strategy Tips

### For Beginners
1. Start with **Hi-Lo** system
2. Master basic strategy first
3. Practice counting at home before using deviations
4. Use the suggested bet feature
5. Export stats regularly to track progress

### For Intermediate Players
1. Try **KO system** for faster play
2. Enable **deviation indices**
3. Focus on the **Fab Four** surrenders first
4. Then add standing deviations (16 vs 10, etc.)
5. Track your advantage percentage

### For Advanced Players
1. Use **Omega II** for maximum edge
2. Memorize all **Illustrious 18** deviations
3. Adjust bet sizing based on bankroll and risk
4. Export and analyze CSV data
5. Practice in different scenarios (save/load feature)

## 🎯 Optimal Betting Strategy

### Kelly Criterion
The mathematically optimal bet sizing:

**Formula:** Bet = Edge × Bankroll

**Example:**
- True Count: +3
- Edge: 1.5% (3 × 0.5%)
- Bankroll: $1,000
- Optimal Bet: $15 (1.5% of $1,000)

### Conservative Approach
- Bet 0.5-1% of bankroll per hand
- Use suggested bet feature
- Reduce bets when count is negative
- Minimum bet when TC ≤ +1

### Aggressive Approach
- Bet 1-2% of bankroll per hand
- Increase bets dramatically at high counts
- Leave table when count goes very negative
- Only for players with large bankrolls

## 🔬 Statistical Analysis

### Expected Results (Perfect Play)

**With Basic Strategy:**
- House Edge: ~0.5%
- Expected Loss: $0.50 per $100 wagered

**With Card Counting (Hi-Lo):**
- Player Edge: 0.5-1.5% (depending on count)
- Expected Win: $0.50-$1.50 per $100 wagered

**With Deviations:**
- Additional Edge: ~0.1-0.2%
- Deviations add about 20% more profit

### Variance
- Standard Deviation: ~1.15 bets per hand
- Expect swings of ±20% of total action
- Need proper bankroll management (100x max bet minimum)

## 🆘 Troubleshooting

### Save Files Not Loading
- Check `saves/` directory exists
- Ensure JSON files are not corrupted
- Try loading a different save

### Counting System Issues
- Changing systems resets the deck
- KO starts at negative IRC (normal)
- Omega II uses different values (2-6 are not all +1)

### Performance Tips
- Close other applications
- Save games regularly
- Export CSVs before long sessions

## 🎓 Learning Resources

### Books
- "Beat the Dealer" by Edward Thorp
- "Professional Blackjack" by Stanford Wong
- "Blackjack Attack" by Don Schlesinger

### Practice Regimen
1. **Week 1-2**: Master basic strategy
2. **Week 3-4**: Learn Hi-Lo counting
3. **Week 5-6**: Add Fab Four surrenders
4. **Week 7-8**: Add Illustrious 18 deviations
5. **Week 9+**: Practice with different systems

## 🚨 Disclaimer

This software is for **educational and entertainment purposes only**.

- Card counting is legal but casinos may ask you to leave
- Never bet more than you can afford to lose
- This is not gambling advice
- Practice responsible gaming
- Software accuracy not guaranteed for real casino play

## 📝 Version History

### Version 2.0 (Current)
- ✅ Multiple counting systems (Hi-Lo, KO, Omega II)
- ✅ Deviation indices (Illustrious 18)
- ✅ Save/Load game sessions
- ✅ CSV statistics export
- ✅ Enhanced GUI with menu system
- ✅ Advanced analytics display

### Version 1.0
- Full Blackjack implementation
- Hi-Lo card counting
- Basic strategy engine
- Tkinter GUI
- Session statistics

## 🤝 Contributing

Contributions welcome! Areas for improvement:
- Additional counting systems (Zen, Red 7, etc.)
- More deviation indices
- Advanced bet sizing strategies
- Multi-player mode
- Enhanced graphics

## 📄 License

MIT License - See LICENSE file for details.

---

**Happy Counting!** Remember: The house edge is beatable with perfect play and proper bankroll management. 🎰♠️♥️♣️♦️
