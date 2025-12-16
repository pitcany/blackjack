import { create } from 'zustand';
import { GameEngine, Action } from './engine';
import { saveSession, updateSettings, startSession, logHandEvent, endSession as endSessionApi } from './api';

export const useStore = create((set, get) => ({
  user: null,
  isAuthenticated: false,
  setUser: (user) => {
      set({ user, isAuthenticated: !!user });
      if (user && user.bankroll) {
          const { engine } = get();
          engine.bankroll = user.bankroll;
          set({ gameState: engine.getState() });
      }
  },
  logout: () => {
      localStorage.removeItem('token');
      set({ user: null, isAuthenticated: false, currentSessionId: null });
  },

  // Game State
  engine: new GameEngine(),
  gameState: null,

  // Session tracking (Phase 4)
  currentSessionId: null,
  sessionStats: {
      handsPlayed: 0,
      correctPlays: 0,
      mistakes: 0
  },

  // Play feedback
  lastPlayFeedback: null, // { isCorrect: bool, recommended: string }
  clearFeedback: () => set({ lastPlayFeedback: null }),

  initGame: (rules) => {
      const engine = new GameEngine(rules);
      set({ engine, gameState: engine.getState() });
  },

  // Start a new tracked session
  startTrackedSession: async () => {
      const { user } = get();
      if (!user) return;
      try {
          const result = await startSession();
          set({
              currentSessionId: result.session_id,
              sessionStats: { handsPlayed: 0, correctPlays: 0, mistakes: 0 }
          });
          return result.session_id;
      } catch (err) {
          console.error("Failed to start session", err);
      }
  },

  // End current session
  endTrackedSession: async () => {
      const { currentSessionId, engine, user } = get();
      if (!currentSessionId || !user) return;
      try {
          const result = await endSessionApi(currentSessionId, engine.bankroll);
          set({ currentSessionId: null });
          return result;
      } catch (err) {
          console.error("Failed to end session", err);
      }
  },

  dispatchAction: (action) => {
      const { engine, currentSessionId } = get();
      const recommendation = engine.getRecommendation();
      const isCorrect = recommendation.action === action;

      // Capture state before action
      const playerCards = engine.playerHands[engine.currentHandIndex]?.cards.map(c => c.toString()) || [];
      const dealerUpCard = engine.dealerHand.cards[0]?.toString() || '';
      const trueCount = engine.getTrueCount();
      const runningCount = engine.runningCount;
      const betAmount = engine.playerHands[engine.currentHandIndex]?.bet || 0;

      // Execute action
      engine.handleAction(action);
      set({
          gameState: engine.getState(),
          lastPlayFeedback: { isCorrect, recommended: recommendation.action }
      });

      // Auto-clear feedback after 1.5 seconds
      setTimeout(() => {
          get().clearFeedback();
      }, 1500);

      // Log the event if we have an active session
      if (currentSessionId) {
          const handResult = engine.phase === 'payout' ? get().getHandResult() : null;

          logHandEvent(currentSessionId, {
              player_cards: playerCards,
              dealer_up_card: dealerUpCard,
              player_action: action,
              recommended_action: recommendation.action,
              is_correct: isCorrect,
              true_count: trueCount,
              running_count: runningCount,
              hand_result: handResult,
              bet_amount: betAmount,
              payout: 0 // Will be calculated on backend
          }).catch(err => console.error("Failed to log event", err));

          // Update local session stats
          set(state => ({
              sessionStats: {
                  ...state.sessionStats,
                  handsPlayed: handResult ? state.sessionStats.handsPlayed + 1 : state.sessionStats.handsPlayed,
                  correctPlays: isCorrect ? state.sessionStats.correctPlays + 1 : state.sessionStats.correctPlays,
                  mistakes: !isCorrect ? state.sessionStats.mistakes + 1 : state.sessionStats.mistakes
              }
          }));
      }

      // Auto-save if round over
      if (engine.phase === 'payout') {
          get().saveProgress();
      }
  },

  getHandResult: () => {
      const { engine } = get();
      const hand = engine.playerHands[engine.currentHandIndex];
      if (!hand) return null;

      const dVal = engine.dealerHand.value;
      if (hand.status === 'busted') return 'loss';
      if (hand.isBlackjack && engine.dealerHand.isBlackjack) return 'push';
      if (hand.isBlackjack) return 'win';
      if (dVal > 21) return 'win';
      if (hand.value > dVal) return 'win';
      if (hand.value === dVal) return 'push';
      return 'loss';
  },

  deal: (bet) => {
      const { engine, currentSessionId, startTrackedSession } = get();

      // Auto-start session if not active
      if (!currentSessionId) {
          startTrackedSession();
      }

      engine.deal(bet);
      set({ gameState: engine.getState() });
  },

  resetShoe: () => {
      const { engine } = get();
      engine.shoe.reshuffle();
      set({ gameState: engine.getState() });
  },

  resetBankroll: () => {
      const { engine } = get();
      engine.bankroll = 10000;
      engine.shoe.reshuffle();
      engine.runningCount = 0;
      engine.phase = 'betting';
      set({
          gameState: engine.getState(),
          currentSessionId: null,
          sessionStats: { handsPlayed: 0, correctPlays: 0, mistakes: 0 }
      });
  },

  saveProgress: async () => {
      const { engine, user } = get();
      if (!user) return;
      try {
          await saveSession({
              bankroll_end: engine.bankroll,
              hands_played: 1,
              mistakes: 0
          });
          // Update local user bankroll
          set(state => ({ user: { ...state.user, bankroll: engine.bankroll } }));
      } catch (err) {
          console.error("Failed to save", err);
      }
  }
}));
