// Coaching Progress - Track mastery and performance trends
import { loadFromStorage, saveToStorage } from './storage';

const STORAGE_KEY = 'blackjack_coaching_progress';

/**
 * Default progress structure
 */
const defaultProgress = {
  // Mastery levels per category (0-100)
  mastery: {},
  
  // Drill completion history
  drillHistory: [],
  
  // Session history
  sessions: [],
  
  // Performance trends (rolling averages)
  trends: {
    daily: [],
    weekly: [],
  },
  
  // Streak tracking
  streaks: {
    current: 0,
    best: 0,
    lastDrillDate: null,
  },
  
  // Total stats
  totals: {
    drillsCompleted: 0,
    scenariosAnswered: 0,
    correctAnswers: 0,
    totalTimeSpent: 0, // seconds
  }
};

/**
 * Load coaching progress
 */
export function loadCoachingProgress() {
  return loadFromStorage(STORAGE_KEY, defaultProgress);
}

/**
 * Save coaching progress
 */
export function saveCoachingProgress(progress) {
  return saveToStorage(STORAGE_KEY, progress);
}

/**
 * Update mastery level for a category
 */
export function updateMastery(category, correctRate, scenarioCount) {
  const progress = loadCoachingProgress();
  
  const currentMastery = progress.mastery[category] || 0;
  
  // Weighted moving average (recent performance weighted more)
  const weight = Math.min(scenarioCount / 20, 0.5); // Max 50% weight for new data
  const newMastery = Math.round(
    currentMastery * (1 - weight) + (correctRate * 100) * weight
  );
  
  progress.mastery[category] = Math.max(0, Math.min(100, newMastery));
  
  saveCoachingProgress(progress);
  return progress.mastery[category];
}

/**
 * Record drill completion
 */
export function recordDrillCompletion(drill, results) {
  const progress = loadCoachingProgress();
  const now = new Date().toISOString();
  
  const drillRecord = {
    drillId: drill.id,
    category: drill.category,
    completedAt: now,
    scenarioCount: results.totalScenarios,
    correctCount: results.correctCount,
    timeSpent: results.timeSpent || 0,
    accuracy: results.totalScenarios > 0 
      ? Math.round((results.correctCount / results.totalScenarios) * 100)
      : 0
  };
  
  // Add to drill history (keep last 100)
  progress.drillHistory.unshift(drillRecord);
  if (progress.drillHistory.length > 100) {
    progress.drillHistory = progress.drillHistory.slice(0, 100);
  }
  
  // Update totals
  progress.totals.drillsCompleted++;
  progress.totals.scenariosAnswered += results.totalScenarios;
  progress.totals.correctAnswers += results.correctCount;
  progress.totals.totalTimeSpent += results.timeSpent || 0;
  
  // Update streak
  const today = new Date().toDateString();
  const lastDrillDate = progress.streaks.lastDrillDate;
  
  if (lastDrillDate === today) {
    // Same day, streak continues
  } else if (lastDrillDate) {
    const lastDate = new Date(lastDrillDate);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (lastDate.toDateString() === yesterday.toDateString()) {
      // Yesterday, streak continues
      progress.streaks.current++;
    } else {
      // Streak broken
      progress.streaks.current = 1;
    }
  } else {
    // First drill ever
    progress.streaks.current = 1;
  }
  
  progress.streaks.lastDrillDate = today;
  progress.streaks.best = Math.max(progress.streaks.best, progress.streaks.current);
  
  // Update mastery
  updateMastery(drill.category, results.correctCount / results.totalScenarios, results.totalScenarios);
  
  saveCoachingProgress(progress);
  return progress;
}

/**
 * Record session completion
 */
export function recordSessionCompletion(session, results) {
  const progress = loadCoachingProgress();
  
  const sessionRecord = {
    sessionId: session.id,
    completedAt: new Date().toISOString(),
    focusAreas: session.focusAreas,
    drillCount: session.drills.length,
    totalScenarios: results.totalScenarios,
    correctCount: results.correctCount,
    timeSpent: results.timeSpent || 0,
    accuracy: results.totalScenarios > 0
      ? Math.round((results.correctCount / results.totalScenarios) * 100)
      : 0
  };
  
  // Add to session history (keep last 50)
  progress.sessions.unshift(sessionRecord);
  if (progress.sessions.length > 50) {
    progress.sessions = progress.sessions.slice(0, 50);
  }
  
  // Update daily trend
  updateDailyTrend(progress, sessionRecord.accuracy);
  
  saveCoachingProgress(progress);
  return progress;
}

/**
 * Update daily performance trend
 */
function updateDailyTrend(progress, accuracy) {
  const today = new Date().toDateString();
  const dailyTrends = progress.trends.daily;
  
  // Find today's entry or create new
  const todayIndex = dailyTrends.findIndex(t => t.date === today);
  
  if (todayIndex >= 0) {
    // Update existing entry (average)
    const entry = dailyTrends[todayIndex];
    entry.accuracy = Math.round((entry.accuracy + accuracy) / 2);
    entry.sessionsCount++;
  } else {
    // Add new entry
    dailyTrends.unshift({
      date: today,
      accuracy,
      sessionsCount: 1
    });
  }
  
  // Keep last 30 days
  if (dailyTrends.length > 30) {
    progress.trends.daily = dailyTrends.slice(0, 30);
  }
  
  // Update weekly trend (every 7 days)
  if (dailyTrends.length >= 7) {
    const lastWeek = dailyTrends.slice(0, 7);
    const weeklyAvg = Math.round(
      lastWeek.reduce((sum, d) => sum + d.accuracy, 0) / lastWeek.length
    );
    
    const weekStart = dailyTrends[6]?.date || today;
    const weeklyTrends = progress.trends.weekly;
    
    // Add or update weekly entry
    if (!weeklyTrends.length || weeklyTrends[0].weekStart !== weekStart) {
      weeklyTrends.unshift({
        weekStart,
        accuracy: weeklyAvg
      });
      
      // Keep last 12 weeks
      if (weeklyTrends.length > 12) {
        progress.trends.weekly = weeklyTrends.slice(0, 12);
      }
    }
  }
}

/**
 * Get performance stats
 */
export function getPerformanceStats() {
  const progress = loadCoachingProgress();
  
  const overallAccuracy = progress.totals.scenariosAnswered > 0
    ? Math.round((progress.totals.correctAnswers / progress.totals.scenariosAnswered) * 100)
    : 0;
  
  // Calculate improvement trend
  const dailyTrends = progress.trends.daily;
  let improvementTrend = 0;
  
  if (dailyTrends.length >= 7) {
    const recent = dailyTrends.slice(0, 3);
    const older = dailyTrends.slice(3, 7);
    
    const recentAvg = recent.reduce((sum, d) => sum + d.accuracy, 0) / recent.length;
    const olderAvg = older.reduce((sum, d) => sum + d.accuracy, 0) / older.length;
    
    improvementTrend = Math.round(recentAvg - olderAvg);
  }
  
  return {
    overallAccuracy,
    totalDrills: progress.totals.drillsCompleted,
    totalScenarios: progress.totals.scenariosAnswered,
    totalTimeSpent: progress.totals.totalTimeSpent,
    currentStreak: progress.streaks.current,
    bestStreak: progress.streaks.best,
    improvementTrend,
    mastery: progress.mastery,
    dailyTrends: progress.trends.daily,
    weeklyTrends: progress.trends.weekly,
    recentSessions: progress.sessions.slice(0, 5)
  };
}

/**
 * Get category mastery levels
 */
export function getMasteryLevels() {
  const progress = loadCoachingProgress();
  return progress.mastery;
}

/**
 * Check if user should practice today
 */
export function shouldPracticeToday() {
  const progress = loadCoachingProgress();
  const lastDrillDate = progress.streaks.lastDrillDate;
  
  if (!lastDrillDate) return true;
  
  const today = new Date().toDateString();
  return lastDrillDate !== today;
}

/**
 * Get practice recommendation
 */
export function getPracticeRecommendation(weaknesses) {
  const progress = loadCoachingProgress();
  const mastery = progress.mastery;
  
  // Find lowest mastery category
  let lowestCategory = null;
  let lowestMastery = 100;
  
  for (const [category, level] of Object.entries(mastery)) {
    if (level < lowestMastery) {
      lowestMastery = level;
      lowestCategory = category;
    }
  }
  
  // Check if there's a weakness with recent mistakes
  const recentWeakness = weaknesses.find(w => w.severity >= 50);
  
  if (recentWeakness) {
    return {
      type: 'weakness',
      category: recentWeakness.category,
      reason: `You've been making frequent errors in ${recentWeakness.category}`,
      priority: 'high'
    };
  }
  
  if (lowestCategory && lowestMastery < 70) {
    return {
      type: 'mastery',
      category: lowestCategory,
      reason: `Your ${lowestCategory} mastery is at ${lowestMastery}%`,
      priority: 'medium'
    };
  }
  
  return {
    type: 'general',
    category: null,
    reason: 'Keep practicing to maintain your skills!',
    priority: 'low'
  };
}

/**
 * Reset coaching progress
 */
export function resetCoachingProgress() {
  saveCoachingProgress(defaultProgress);
  return defaultProgress;
}

export default {
  loadCoachingProgress,
  saveCoachingProgress,
  updateMastery,
  recordDrillCompletion,
  recordSessionCompletion,
  getPerformanceStats,
  getMasteryLevels,
  shouldPracticeToday,
  getPracticeRecommendation,
  resetCoachingProgress
};
