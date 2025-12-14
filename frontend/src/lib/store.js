import { create } from 'zustand';
import { GameEngine, Action } from './engine';

export const useStore = create((set, get) => ({
  user: null,
  isAuthenticated: false,
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  logout: () => {
      localStorage.removeItem('token');
      set({ user: null, isAuthenticated: false });
  },
  
  // Game State
  engine: new GameEngine(),
  gameState: null, // Return value of engine.getState()
  
  initGame: (rules) => {
      const engine = new GameEngine(rules);
      set({ engine, gameState: engine.getState() });
  },
  
  dispatchAction: (action) => {
      const { engine } = get();
      engine.handleAction(action);
      set({ gameState: engine.getState() });
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
  }
}));
