// Sync Service - Handles data synchronization between localStorage and backend
import {
  loadGameStats,
  loadStrategyStats,
  loadTrainingStats,
  loadHandHistory,
  loadGameConfig,
  saveGameStats,
  saveStrategyStats,
  saveTrainingStats,
  saveGameConfig,
  STORAGE_KEYS
} from './storage';

const API_URL = process.env.REACT_APP_BACKEND_URL;

// Sync status tracking
let syncInProgress = false;
let offlineQueue = [];
let lastSyncTime = null;

/**
 * Merge stats with server (take max for cumulative values)
 */
function mergeStats(local, server) {
  if (!server || Object.keys(server).length === 0) return local;
  if (!local || Object.keys(local).length === 0) return server;

  const merged = { ...local };
  for (const [key, value] of Object.entries(server)) {
    if (key in merged) {
      if (typeof value === 'number' && typeof merged[key] === 'number') {
        merged[key] = Math.max(merged[key], value);
      } else if (typeof value === 'object' && typeof merged[key] === 'object' && !Array.isArray(value)) {
        merged[key] = mergeStats(merged[key], value);
      } else {
        // For non-numeric, server wins (more recent)
        merged[key] = value;
      }
    } else {
      merged[key] = value;
    }
  }
  return merged;
}

/**
 * Merge hand history arrays (dedupe by timestamp, cap at 200)
 */
function mergeHistory(localHands, serverHands) {
  const allHands = [...(localHands || []), ...(serverHands || [])];
  const seen = new Set();
  const unique = [];
  
  for (const hand of allHands) {
    const ts = hand.timestamp;
    if (ts && !seen.has(ts)) {
      seen.add(ts);
      unique.push(hand);
    }
  }
  
  // Sort by timestamp descending and cap at 200
  unique.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
  return unique.slice(0, 200);
}

/**
 * Check if user is authenticated
 */
async function isAuthenticated() {
  try {
    const response = await fetch(`${API_URL}/api/auth/me`, {
      credentials: 'include'
    });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Perform full sync - push local data and pull server data
 */
export async function fullSync() {
  if (syncInProgress) {
    console.log('Sync already in progress');
    return { success: false, reason: 'sync_in_progress' };
  }

  const authenticated = await isAuthenticated();
  if (!authenticated) {
    return { success: false, reason: 'not_authenticated' };
  }

  syncInProgress = true;

  try {
    // Gather local data
    const localGameStats = loadGameStats();
    const localStrategyStats = loadStrategyStats();
    const localTrainingStats = loadTrainingStats();
    const localHistory = loadHandHistory();
    const localSettings = loadGameConfig();

    // Send local data to server and get merged response
    const response = await fetch(`${API_URL}/api/sync/full`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        game_stats: localGameStats,
        strategy_stats: localStrategyStats,
        training_stats: localTrainingStats,
        hands: localHistory,
        settings: localSettings
      })
    });

    if (!response.ok) {
      throw new Error(`Sync failed: ${response.status}`);
    }

    const serverData = await response.json();

    // Merge and save locally
    const mergedGameStats = mergeStats(localGameStats, serverData.stats?.game_stats);
    const mergedStrategyStats = mergeStats(localStrategyStats, serverData.stats?.strategy_stats);
    const mergedTrainingStats = mergeStats(localTrainingStats, serverData.stats?.training_stats);
    const mergedHistory = mergeHistory(localHistory, serverData.history?.hands);
    const mergedSettings = { ...localSettings, ...serverData.settings };

    saveGameStats(mergedGameStats);
    saveStrategyStats(mergedStrategyStats);
    saveTrainingStats(mergedTrainingStats);
    
    // Save merged history
    try {
      localStorage.setItem(STORAGE_KEYS.HAND_HISTORY, JSON.stringify(mergedHistory));
    } catch (e) {
      console.error('Failed to save history:', e);
    }

    if (mergedSettings && Object.keys(mergedSettings).length > 0) {
      saveGameConfig(mergedSettings);
    }

    lastSyncTime = Date.now();
    
    // Process offline queue
    await processOfflineQueue();

    return {
      success: true,
      data: {
        gameStats: mergedGameStats,
        strategyStats: mergedStrategyStats,
        trainingStats: mergedTrainingStats,
        history: mergedHistory,
        settings: mergedSettings
      },
      lastSync: lastSyncTime
    };
  } catch (error) {
    console.error('Full sync error:', error);
    return { success: false, reason: error.message };
  } finally {
    syncInProgress = false;
  }
}

/**
 * Sync stats only (lighter operation)
 */
export async function syncStats() {
  const authenticated = await isAuthenticated();
  if (!authenticated) {
    return { success: false, reason: 'not_authenticated' };
  }

  try {
    const localGameStats = loadGameStats();
    const localStrategyStats = loadStrategyStats();
    const localTrainingStats = loadTrainingStats();

    const response = await fetch(`${API_URL}/api/sync/stats`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        game_stats: localGameStats,
        strategy_stats: localStrategyStats,
        training_stats: localTrainingStats
      })
    });

    if (!response.ok) {
      throw new Error(`Stats sync failed: ${response.status}`);
    }

    const serverStats = await response.json();

    // Merge and save
    const mergedGameStats = mergeStats(localGameStats, serverStats.game_stats);
    const mergedStrategyStats = mergeStats(localStrategyStats, serverStats.strategy_stats);
    const mergedTrainingStats = mergeStats(localTrainingStats, serverStats.training_stats);

    saveGameStats(mergedGameStats);
    saveStrategyStats(mergedStrategyStats);
    saveTrainingStats(mergedTrainingStats);

    return { success: true };
  } catch (error) {
    console.error('Stats sync error:', error);
    addToOfflineQueue({ type: 'stats' });
    return { success: false, reason: error.message };
  }
}

/**
 * Add operation to offline queue for later processing
 */
function addToOfflineQueue(operation) {
  offlineQueue.push({
    ...operation,
    timestamp: Date.now()
  });
  
  // Persist queue to localStorage
  try {
    localStorage.setItem('blackjack_sync_queue', JSON.stringify(offlineQueue));
  } catch (e) {
    console.error('Failed to save offline queue:', e);
  }
}

/**
 * Process offline queue when back online
 */
async function processOfflineQueue() {
  // Load persisted queue
  try {
    const stored = localStorage.getItem('blackjack_sync_queue');
    if (stored) {
      offlineQueue = JSON.parse(stored);
    }
  } catch (e) {
    offlineQueue = [];
  }

  if (offlineQueue.length === 0) return;

  const authenticated = await isAuthenticated();
  if (!authenticated) return;

  // Process queue
  const processed = [];
  for (const op of offlineQueue) {
    try {
      if (op.type === 'stats') {
        await syncStats();
      }
      processed.push(op);
    } catch (e) {
      console.error('Failed to process queued operation:', e);
    }
  }

  // Remove processed items
  offlineQueue = offlineQueue.filter(op => !processed.includes(op));
  
  // Update persisted queue
  try {
    localStorage.setItem('blackjack_sync_queue', JSON.stringify(offlineQueue));
  } catch (e) {
    console.error('Failed to update offline queue:', e);
  }
}

/**
 * Get sync status
 */
export function getSyncStatus() {
  return {
    inProgress: syncInProgress,
    lastSync: lastSyncTime,
    queuedOperations: offlineQueue.length
  };
}

/**
 * Get last sync time
 */
export function getLastSyncTime() {
  return lastSyncTime;
}

/**
 * Auto-sync hook setup (call periodically)
 */
export function setupAutoSync(intervalMs = 60000) {
  // Load queue from storage on init
  try {
    const stored = localStorage.getItem('blackjack_sync_queue');
    if (stored) {
      offlineQueue = JSON.parse(stored);
    }
  } catch (e) {
    offlineQueue = [];
  }

  // Set up periodic sync
  const intervalId = setInterval(async () => {
    const authenticated = await isAuthenticated();
    if (authenticated && !syncInProgress) {
      await syncStats();
    }
  }, intervalMs);

  // Process queue when online
  window.addEventListener('online', processOfflineQueue);

  return () => {
    clearInterval(intervalId);
    window.removeEventListener('online', processOfflineQueue);
  };
}

export default {
  fullSync,
  syncStats,
  getSyncStatus,
  getLastSyncTime,
  setupAutoSync,
  mergeStats,
  mergeHistory
};
