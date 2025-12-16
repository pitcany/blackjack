import { create } from 'zustand';
import { GameEngine, Action } from './engine';
import { saveSession, updateSettings } from './api';

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
      set({ user: null, isAuthenticated: false });
  },
  
  // Game State
  engine: new GameEngine(),
  gameState: null, 
  
  initGame: (rules) => {
      const engine = new GameEngine(rules);
      set({ engine, gameState: engine.getState() });
  },
  
  dispatchAction: (action) => {
      const { engine } = get();
      engine.handleAction(action);
      set({ gameState: engine.getState() });
      // Auto-save if round over?
      if (engine.phase === 'payout') {
          get().saveProgress();
      }
  },
  
  deal: (bet) => {
      const { engine } = get();
      engine.deal(bet);
      set({ gameState: engine.getState() });
  },
  
  resetShoe: () => {
      const { engine } = get();
      engine.shoe.reshuffle();
      set({ gameState: engine.getState() });
  },

  saveProgress: async () => {
      const { engine, user } = get();
      if (!user) return;
      try {
          await saveSession({
              bankroll_end: engine.bankroll,
              hands_played: 1, // approximate
              mistakes: 0
          });
          // Update local user bankroll
          set(state => ({ user: { ...state.user, bankroll: engine.bankroll } }));
      } catch (err) {
          console.error("Failed to save", err);
      }
  }
}));
