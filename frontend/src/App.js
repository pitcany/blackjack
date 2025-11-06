import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import Card from './components/Card';
import './App.css';

const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

function App() {
  const [gameState, setGameState] = useState(null);
  const [gameId, setGameId] = useState(null);
  const [betAmount, setBetAmount] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showStats, setShowStats] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    startNewGame();
  }, []);

  const startNewGame = async (numDecks = 6, bankroll = 1000) => {
    try {
      setLoading(true);
      const response = await axios.post(`${API_URL}/game/new`, null, {
        params: { num_decks: numDecks, starting_bankroll: bankroll }
      });
      setGameId(response.data.game_state.game_id);
      setGameState(response.data.game_state);
      setError(null);
    } catch (err) {
      setError('Failed to start game. Make sure the backend server is running on port 8001.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const makeAction = async (endpoint, data = null) => {
    try {
      setLoading(true);
      const url = `${API_URL}/game/${gameId}/${endpoint}`;
      const response = data ? await axios.post(url, data) : await axios.post(url);
      
      if (response.data.success) {
        setGameState(response.data.game_state);
        setError(null);
      } else {
        setError(response.data.error);
      }
    } catch (err) {
      setError('Action failed: ' + (err.response?.data?.detail || err.message));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const placeBet = async () => {
    await makeAction('bet', { amount: betAmount });
  };

  const dealCards = async () => {
    await makeAction('deal');
  };

  const hit = async () => {
    await makeAction('hit');
  };

  const stand = async () => {
    await makeAction('stand');
  };

  const doubleDown = async () => {
    await makeAction('double');
  };

  const split = async () => {
    await makeAction('split');
  };

  const takeInsurance = async () => {
    await makeAction('insurance/take');
  };

  const declineInsurance = async () => {
    await makeAction('insurance/decline');
  };

  const newHand = async () => {
    await makeAction('new-hand');
  };

  const newShoe = async () => {
    await makeAction('new-shoe');
  };

  const calculateHandValue = (hand) => {
    let value = 0;
    let aces = 0;

    hand.forEach(card => {
      if (card.rank === 'A') {
        aces += 1;
        value += 11;
      } else if (['J', 'Q', 'K'].includes(card.rank)) {
        value += 10;
      } else {
        value += parseInt(card.rank);
      }
    });

    while (value > 21 && aces > 0) {
      value -= 10;
      aces -= 1;
    }

    return value;
  };

  if (!gameState) {
    return (
      <div className=\"app loading-screen\">
        <div className=\"loading-content\">
          <h1>♠ Blackjack Card Counter ♥</h1>
          {error ? (
            <div className=\"error-message\">
              <p>{error}</p>
              <button onClick={() => startNewGame()} className=\"btn-primary\">
                Retry Connection
              </button>
            </div>
          ) : (
            <p>Loading...</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className=\"app\">
      {/* Header */}
      <header className=\"header\">
        <div className=\"header-left\">
          <h1 className=\"title\">♠ Blackjack Card Counter ♥</h1>
        </div>
        <div className=\"header-right\">
          <button className=\"btn-icon\" onClick={() => setShowHelp(true)} title=\"Help\">
            ?
          </button>
          <button className=\"btn-icon\" onClick={() => setShowStats(true)} title=\"Statistics\">
            📊
          </button>
          <button className=\"btn-secondary\" onClick={newShoe}>
            🔄 New Shoe
          </button>
        </div>
      </header>

      {/* Stats Bar */}
      <div className=\"stats-bar\">
        <div className=\"stat-item\">
          <span className=\"stat-label\">Bankroll</span>
          <span className=\"stat-value bankroll\">${gameState.bankroll}</span>
        </div>
        <div className=\"stat-item\">
          <span className=\"stat-label\">Bet</span>
          <span className=\"stat-value\">${gameState.current_bet}</span>
        </div>
        <div className=\"stat-item\">
          <span className=\"stat-label\">Running Count</span>
          <span className={`stat-value ${gameState.running_count > 0 ? 'positive' : gameState.running_count < 0 ? 'negative' : ''}`}>
            {gameState.running_count > 0 ? '+' : ''}{gameState.running_count}
          </span>
        </div>
        <div className=\"stat-item\">
          <span className=\"stat-label\">True Count</span>
          <span className={`stat-value ${gameState.true_count > 0 ? 'positive' : gameState.true_count < 0 ? 'negative' : ''}`}>
            {gameState.true_count > 0 ? '+' : ''}{gameState.true_count}
          </span>
        </div>
        <div className=\"stat-item\">
          <span className=\"stat-label\">Cards</span>
          <span className=\"stat-value\">{gameState.cards_dealt}/{gameState.num_decks * 52}</span>
        </div>
      </div>

      {/* Betting Advice */}
      {gameState.betting_advice && (
        <motion.div 
          className=\"advice-banner betting\"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          💡 Recommended: {gameState.betting_advice}
        </motion.div>
      )}

      {/* Main Game Area */}
      <div className=\"game-area\">
        {/* Dealer Section */}
        <div className=\"dealer-section\">
          <div className=\"hand-header\">
            <h2>Dealer</h2>
            {gameState.dealer_hand.length > 0 && (
              <span className=\"hand-value\">
                ({gameState.state === 'playing' || gameState.state === 'insurance' ? '?' : calculateHandValue(gameState.dealer_hand)})
              </span>
            )}
          </div>
          <div className=\"card-container\">
            {gameState.dealer_hand.map((card, index) => (
              <Card
                key={index}
                rank={card.rank}
                suit={card.suit}
                hidden={index === 1 && (gameState.state === 'playing' || gameState.state === 'insurance')}
                delay={index * 0.1}
              />
            ))}
          </div>
        </div>

        {/* Player Section */}
        <div className=\"player-section\">
          {!gameState.is_split ? (
            <>
              <div className=\"hand-header\">
                <h2>Your Hand</h2>
                {gameState.player_hand.length > 0 && (
                  <span className=\"hand-value\">
                    ({calculateHandValue(gameState.player_hand)})
                  </span>
                )}
              </div>
              <div className=\"card-container\">
                {gameState.player_hand.map((card, index) => (
                  <Card
                    key={index}
                    rank={card.rank}
                    suit={card.suit}
                    delay={index * 0.1 + 0.2}
                  />
                ))}
              </div>
            </>
          ) : (
            <div className=\"split-hands\">
              {gameState.split_hands.map((hand, handIndex) => (
                <div 
                  key={handIndex} 
                  className={`split-hand ${handIndex === gameState.active_split_hand && gameState.state === 'playing' ? 'active' : ''}`}
                >
                  <div className=\"hand-header\">
                    <h3>Hand {handIndex + 1}</h3>
                    <span className=\"hand-value\">({calculateHandValue(hand)})</span>
                  </div>
                  <div className=\"card-container\">
                    {hand.map((card, cardIndex) => (
                      <Card
                        key={cardIndex}
                        rank={card.rank}
                        suit={card.suit}
                        delay={cardIndex * 0.1}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Message Display */}
      <motion.div 
        className=\"message-display\"
        key={gameState.message}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        {gameState.message}
      </motion.div>

      {/* Strategy Advice */}
      {gameState.strategy_advice && (
        <motion.div 
          className=\"advice-banner strategy\"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          🎯 Strategy: {gameState.strategy_advice}
        </motion.div>
      )}

      {/* Controls */}
      <div className=\"controls\">
        {gameState.state === 'betting' && (
          <div className=\"betting-controls\">
            <div className=\"bet-input-group\">
              <label>Bet Amount:</label>
              <div className=\"bet-buttons\">
                <button className=\"btn-bet\" onClick={() => setBetAmount(10)}>$10</button>
                <button className=\"btn-bet\" onClick={() => setBetAmount(25)}>$25</button>
                <button className=\"btn-bet\" onClick={() => setBetAmount(50)}>$50</button>
                <button className=\"btn-bet\" onClick={() => setBetAmount(100)}>$100</button>
              </div>
              <input
                type=\"number\"
                value={betAmount}
                onChange={(e) => setBetAmount(Math.max(1, parseInt(e.target.value) || 10))}
                className=\"bet-input\"
                min=\"1\"
                max={gameState.bankroll}
              />
              <button className=\"btn-primary\" onClick={placeBet}>
                Set Bet
              </button>
            </div>
            <button 
              className=\"btn-action deal\" 
              onClick={dealCards}
              disabled={gameState.current_bet === 0}
            >
              Deal Cards
            </button>
          </div>
        )}

        {gameState.state === 'insurance' && (
          <div className=\"action-buttons insurance-buttons\">
            <button className=\"btn-action insurance\" onClick={takeInsurance}>
              Take Insurance (${gameState.current_bet / 2})
            </button>
            <button className=\"btn-action\" onClick={declineInsurance}>
              Decline Insurance
            </button>
          </div>
        )}

        {gameState.state === 'playing' && (
          <div className=\"action-buttons\">
            <button className=\"btn-action hit\" onClick={hit}>
              Hit
            </button>
            <button className=\"btn-action stand\" onClick={stand}>
              Stand
            </button>
            <button 
              className=\"btn-action double\" 
              onClick={doubleDown}
              disabled={!gameState.can_double}
            >
              Double
            </button>
            <button 
              className=\"btn-action split\" 
              onClick={split}
              disabled={!gameState.can_split}
            >
              Split
            </button>
          </div>
        )}

        {gameState.state === 'finished' && (
          <div className=\"action-buttons\">
            <button className=\"btn-action new-hand\" onClick={newHand}>
              New Hand
            </button>
          </div>
        )}
      </div>

      {/* Error Display */}
      <AnimatePresence>
        {error && (
          <motion.div 
            className=\"error-toast\"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
          >
            {error}
            <button onClick={() => setError(null)}>×</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Help Modal */}
      <AnimatePresence>
        {showHelp && (
          <motion.div 
            className=\"modal-overlay\"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowHelp(false)}
          >
            <motion.div 
              className=\"modal\"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2>Card Counting Guide</h2>
              <div className=\"modal-content\">
                <section>
                  <h3>Hi-Lo Counting System</h3>
                  <ul>
                    <li><strong>+1:</strong> Cards 2, 3, 4, 5, 6 (low cards)</li>
                    <li><strong>0:</strong> Cards 7, 8, 9 (neutral)</li>
                    <li><strong>-1:</strong> Cards 10, J, Q, K, A (high cards)</li>
                  </ul>
                </section>
                <section>
                  <h3>Counts</h3>
                  <p><strong>Running Count:</strong> Add/subtract as cards are dealt</p>
                  <p><strong>True Count:</strong> Running Count ÷ Decks Remaining</p>
                </section>
                <section>
                  <h3>Betting Strategy</h3>
                  <p>Increase your bet when the true count is +2 or higher. The higher the true count, the better your advantage!</p>
                </section>
                <section>
                  <h3>Basic Strategy</h3>
                  <ul>
                    <li>Always stand on 17 or higher</li>
                    <li>Always split Aces and 8s</li>
                    <li>Double on 11 vs any dealer card</li>
                    <li>Hit on 16 vs dealer 7 or higher</li>
                  </ul>
                </section>
              </div>
              <button className=\"btn-primary\" onClick={() => setShowHelp(false)}>
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
