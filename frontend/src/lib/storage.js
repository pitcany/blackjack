// localStorage persistence utilities for Blackjack Trainer

const STORAGE_KEYS = {
  GAME_CONFIG: 'blackjack_config',
  GAME_STATE: 'blackjack_state',
  GAME_STATS: 'blackjack_stats',
  HAND_HISTORY: 'blackjack_history',
  TRAINING_STATS: 'blackjack_training_stats',
  STRATEGY_STATS: 'blackjack_strategy_stats'
};

const MAX_HISTORY_SIZE = 200;

/**
 * Save data to localStorage
 */
export function saveToStorage(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
    return false;
  }
}

/**
 * Load data from localStorage
 */
export function loadFromStorage(key, defaultValue = null) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  } catch (error) {
    console.error('Failed to load from localStorage:', error);
    return defaultValue;
  }
}

/**
 * Save game configuration
 */
export function saveGameConfig(config) {
  return saveToStorage(STORAGE_KEYS.GAME_CONFIG, config);
}

/**
 * Load game configuration
 */
export function loadGameConfig() {
  return loadFromStorage(STORAGE_KEYS.GAME_CONFIG);
}

/**
 * Save game state (bankroll, etc.)
 */
export function saveGameState(state) {
  const saveableState = {
    bankroll: state.bankroll,
    runningCount: state.runningCount
  };
  return saveToStorage(STORAGE_KEYS.GAME_STATE, saveableState);
}

/**
 * Load game state
 */
export function loadGameState() {
  return loadFromStorage(STORAGE_KEYS.GAME_STATE);
}

/**
 * Save game statistics
 */
export function saveGameStats(stats) {
  return saveToStorage(STORAGE_KEYS.GAME_STATS, stats);
}

/**
 * Load game statistics
 */
export function loadGameStats() {
  return loadFromStorage(STORAGE_KEYS.GAME_STATS, {
    handsPlayed: 0,
    handsWon: 0,
    handsLost: 0,
    blackjacks: 0,
    pushes: 0,
    surrenders: 0,
    totalWagered: 0,
    totalWon: 0,
    peakBankroll: 0,
    lowestBankroll: 0
  });
}

/**
 * Save strategy statistics
 */
export function saveStrategyStats(stats) {
  return saveToStorage(STORAGE_KEYS.STRATEGY_STATS, stats);
}

/**
 * Load strategy statistics
 */
export function loadStrategyStats() {
  return loadFromStorage(STORAGE_KEYS.STRATEGY_STATS, {
    totalDecisions: 0,
    correctDecisions: 0,
    hardTotalDecisions: 0,
    hardTotalCorrect: 0,
    softTotalDecisions: 0,
    softTotalCorrect: 0,
    pairDecisions: 0,
    pairCorrect: 0,
    deviationsOffered: 0,
    deviationsTaken: 0,
    mistakes: {} // { "16_vs_10": { wrong: 5, correct: "STAND" } }
  });
}

/**
 * Add a hand to history
 */
export function addHandToHistory(handData) {
  const history = loadFromStorage(STORAGE_KEYS.HAND_HISTORY, []);
  
  history.unshift({
    ...handData,
    timestamp: Date.now()
  });
  
  // Keep only last MAX_HISTORY_SIZE hands
  if (history.length > MAX_HISTORY_SIZE) {
    history.length = MAX_HISTORY_SIZE;
  }
  
  return saveToStorage(STORAGE_KEYS.HAND_HISTORY, history);
}

/**
 * Load hand history
 */
export function loadHandHistory() {
  return loadFromStorage(STORAGE_KEYS.HAND_HISTORY, []);
}

/**
 * Save training statistics
 */
export function saveTrainingStats(stats) {
  return saveToStorage(STORAGE_KEYS.TRAINING_STATS, stats);
}

/**
 * Load training statistics
 */
export function loadTrainingStats() {
  return loadFromStorage(STORAGE_KEYS.TRAINING_STATS, {
    totalAttempts: 0,
    correctRC: 0,
    correctTC: 0,
    bestStreak: 0,
    sessionHistory: [] // Last 50 sessions
  });
}

/**
 * Clear all stored data
 */
export function clearAllData() {
  try {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
    return true;
  } catch (error) {
    console.error('Failed to clear localStorage:', error);
    return false;
  }
}

/**
 * Export all data as JSON
 */
export function exportAllData() {
  const data = {};
  Object.entries(STORAGE_KEYS).forEach(([name, key]) => {
    data[name] = loadFromStorage(key);
  });
  return data;
}

/**
 * Import data from JSON
 */
export function importData(data) {
  try {
    Object.entries(STORAGE_KEYS).forEach(([name, key]) => {
      if (data[name]) {
        saveToStorage(key, data[name]);
      }
    });
    return true;
  } catch (error) {
    console.error('Failed to import data:', error);
    return false;
  }
}

export default {
  saveGameConfig,
  loadGameConfig,
  saveGameState,
  loadGameState,
  saveGameStats,
  loadGameStats,
  saveStrategyStats,
  loadStrategyStats,
  addHandToHistory,
  loadHandHistory,
  saveTrainingStats,
  loadTrainingStats,
  clearAllData,
  exportAllData,
  importData,
  STORAGE_KEYS
};
