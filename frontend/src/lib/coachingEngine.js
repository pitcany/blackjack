// Coaching Engine - Weakness analyzer and personalized drill generator

/**
 * Strategy weakness thresholds
 */
const WEAKNESS_THRESHOLDS = {
  ERROR_RATE: 0.30, // 30% error rate or higher
  MIN_DECISIONS: 10, // Minimum decisions to consider a weakness
  MASTERY_THRESHOLD: 0.85, // 85% correct to consider mastered
  TREND_WINDOW: 20, // Number of decisions to calculate trend
};

/**
 * Categories for strategic weaknesses
 */
export const WeaknessCategory = {
  HARD_TOTALS: 'hard_totals',
  SOFT_TOTALS: 'soft_totals',
  PAIRS: 'pairs',
  SURRENDER: 'surrender',
  DOUBLING: 'doubling',
  SPLITTING: 'splitting',
  INSURANCE: 'insurance',
  HITTING: 'hitting',
  STANDING: 'standing',
};

/**
 * Drill types
 */
export const DrillType = {
  FLASHCARD: 'flashcard',
  QUIZ: 'quiz',
  SCENARIO: 'scenario',
  TIMED: 'timed',
};

/**
 * Drill library - 20+ drills for different weaknesses
 */
export const DRILL_LIBRARY = [
  // Hard Total Drills
  {
    id: 'hard_12_vs_2_3',
    name: 'Hard 12 vs Dealer 2-3',
    description: 'Practice hitting on hard 12 against dealer 2 or 3',
    category: WeaknessCategory.HARD_TOTALS,
    type: DrillType.FLASHCARD,
    difficulty: 'medium',
    scenarios: [
      { playerHand: [7, 5], dealerUpcard: 2, correctAction: 'HIT' },
      { playerHand: [8, 4], dealerUpcard: 3, correctAction: 'HIT' },
      { playerHand: [9, 3], dealerUpcard: 2, correctAction: 'HIT' },
      { playerHand: [10, 2], dealerUpcard: 3, correctAction: 'HIT' },
    ]
  },
  {
    id: 'hard_12_vs_4_6',
    name: 'Hard 12 vs Dealer 4-6',
    description: 'Practice standing on hard 12 against dealer 4-6',
    category: WeaknessCategory.HARD_TOTALS,
    type: DrillType.FLASHCARD,
    difficulty: 'easy',
    scenarios: [
      { playerHand: [7, 5], dealerUpcard: 4, correctAction: 'STAND' },
      { playerHand: [8, 4], dealerUpcard: 5, correctAction: 'STAND' },
      { playerHand: [9, 3], dealerUpcard: 6, correctAction: 'STAND' },
    ]
  },
  {
    id: 'hard_16_vs_high',
    name: 'Hard 16 vs High Cards',
    description: 'The toughest hand in blackjack - practice 16 vs 9, 10, A',
    category: WeaknessCategory.HARD_TOTALS,
    type: DrillType.FLASHCARD,
    difficulty: 'hard',
    scenarios: [
      { playerHand: [10, 6], dealerUpcard: 9, correctAction: 'HIT' },
      { playerHand: [9, 7], dealerUpcard: 10, correctAction: 'HIT' },
      { playerHand: [10, 6], dealerUpcard: 11, correctAction: 'HIT' },
    ]
  },
  {
    id: 'hard_16_vs_2_6',
    name: 'Hard 16 vs Low Cards',
    description: 'Practice standing on hard 16 against dealer 2-6',
    category: WeaknessCategory.HARD_TOTALS,
    type: DrillType.FLASHCARD,
    difficulty: 'easy',
    scenarios: [
      { playerHand: [10, 6], dealerUpcard: 2, correctAction: 'STAND' },
      { playerHand: [9, 7], dealerUpcard: 5, correctAction: 'STAND' },
      { playerHand: [10, 6], dealerUpcard: 6, correctAction: 'STAND' },
    ]
  },
  
  // Soft Total Drills
  {
    id: 'soft_17',
    name: 'Soft 17 Decisions',
    description: 'Always hit or double soft 17',
    category: WeaknessCategory.SOFT_TOTALS,
    type: DrillType.FLASHCARD,
    difficulty: 'medium',
    scenarios: [
      { playerHand: [11, 6], dealerUpcard: 3, correctAction: 'DOUBLE' },
      { playerHand: [11, 6], dealerUpcard: 4, correctAction: 'DOUBLE' },
      { playerHand: [11, 6], dealerUpcard: 5, correctAction: 'DOUBLE' },
      { playerHand: [11, 6], dealerUpcard: 6, correctAction: 'DOUBLE' },
      { playerHand: [11, 6], dealerUpcard: 2, correctAction: 'HIT' },
      { playerHand: [11, 6], dealerUpcard: 7, correctAction: 'HIT' },
    ]
  },
  {
    id: 'soft_18',
    name: 'Soft 18 Decisions',
    description: 'The tricky soft 18 - stand, double, or hit?',
    category: WeaknessCategory.SOFT_TOTALS,
    type: DrillType.FLASHCARD,
    difficulty: 'hard',
    scenarios: [
      { playerHand: [11, 7], dealerUpcard: 2, correctAction: 'STAND' },
      { playerHand: [11, 7], dealerUpcard: 3, correctAction: 'DOUBLE' },
      { playerHand: [11, 7], dealerUpcard: 4, correctAction: 'DOUBLE' },
      { playerHand: [11, 7], dealerUpcard: 5, correctAction: 'DOUBLE' },
      { playerHand: [11, 7], dealerUpcard: 6, correctAction: 'DOUBLE' },
      { playerHand: [11, 7], dealerUpcard: 7, correctAction: 'STAND' },
      { playerHand: [11, 7], dealerUpcard: 8, correctAction: 'STAND' },
      { playerHand: [11, 7], dealerUpcard: 9, correctAction: 'HIT' },
      { playerHand: [11, 7], dealerUpcard: 10, correctAction: 'HIT' },
    ]
  },
  {
    id: 'soft_13_14',
    name: 'Soft 13-14 Decisions',
    description: 'Double against dealer 5-6, otherwise hit',
    category: WeaknessCategory.SOFT_TOTALS,
    type: DrillType.FLASHCARD,
    difficulty: 'medium',
    scenarios: [
      { playerHand: [11, 2], dealerUpcard: 5, correctAction: 'DOUBLE' },
      { playerHand: [11, 3], dealerUpcard: 6, correctAction: 'DOUBLE' },
      { playerHand: [11, 2], dealerUpcard: 4, correctAction: 'HIT' },
      { playerHand: [11, 3], dealerUpcard: 7, correctAction: 'HIT' },
    ]
  },
  
  // Pair Splitting Drills
  {
    id: 'split_aces_8s',
    name: 'Always Split Aces and 8s',
    description: 'The golden rules of splitting',
    category: WeaknessCategory.PAIRS,
    type: DrillType.FLASHCARD,
    difficulty: 'easy',
    scenarios: [
      { playerHand: [11, 11], dealerUpcard: 5, correctAction: 'SPLIT' },
      { playerHand: [11, 11], dealerUpcard: 10, correctAction: 'SPLIT' },
      { playerHand: [8, 8], dealerUpcard: 6, correctAction: 'SPLIT' },
      { playerHand: [8, 8], dealerUpcard: 10, correctAction: 'SPLIT' },
    ]
  },
  {
    id: 'never_split_10s_5s',
    name: 'Never Split 10s and 5s',
    description: 'Keep your 20, double your 10',
    category: WeaknessCategory.PAIRS,
    type: DrillType.FLASHCARD,
    difficulty: 'easy',
    scenarios: [
      { playerHand: [10, 10], dealerUpcard: 5, correctAction: 'STAND' },
      { playerHand: [10, 10], dealerUpcard: 6, correctAction: 'STAND' },
      { playerHand: [5, 5], dealerUpcard: 5, correctAction: 'DOUBLE' },
      { playerHand: [5, 5], dealerUpcard: 9, correctAction: 'HIT' },
    ]
  },
  {
    id: 'split_9s',
    name: 'Splitting 9s',
    description: 'Split 9s except vs 7, 10, or A',
    category: WeaknessCategory.PAIRS,
    type: DrillType.FLASHCARD,
    difficulty: 'medium',
    scenarios: [
      { playerHand: [9, 9], dealerUpcard: 2, correctAction: 'SPLIT' },
      { playerHand: [9, 9], dealerUpcard: 6, correctAction: 'SPLIT' },
      { playerHand: [9, 9], dealerUpcard: 7, correctAction: 'STAND' },
      { playerHand: [9, 9], dealerUpcard: 10, correctAction: 'STAND' },
      { playerHand: [9, 9], dealerUpcard: 11, correctAction: 'STAND' },
    ]
  },
  {
    id: 'split_2s_3s',
    name: 'Splitting 2s and 3s',
    description: 'Split against dealer 2-7',
    category: WeaknessCategory.PAIRS,
    type: DrillType.FLASHCARD,
    difficulty: 'medium',
    scenarios: [
      { playerHand: [2, 2], dealerUpcard: 4, correctAction: 'SPLIT' },
      { playerHand: [3, 3], dealerUpcard: 7, correctAction: 'SPLIT' },
      { playerHand: [2, 2], dealerUpcard: 8, correctAction: 'HIT' },
      { playerHand: [3, 3], dealerUpcard: 9, correctAction: 'HIT' },
    ]
  },
  {
    id: 'split_6s',
    name: 'Splitting 6s',
    description: 'Split 6s against dealer 2-6',
    category: WeaknessCategory.PAIRS,
    type: DrillType.FLASHCARD,
    difficulty: 'medium',
    scenarios: [
      { playerHand: [6, 6], dealerUpcard: 2, correctAction: 'SPLIT' },
      { playerHand: [6, 6], dealerUpcard: 6, correctAction: 'SPLIT' },
      { playerHand: [6, 6], dealerUpcard: 7, correctAction: 'HIT' },
    ]
  },
  
  // Doubling Drills
  {
    id: 'double_11',
    name: 'Doubling on 11',
    description: 'Double 11 against everything except Ace',
    category: WeaknessCategory.DOUBLING,
    type: DrillType.FLASHCARD,
    difficulty: 'easy',
    scenarios: [
      { playerHand: [6, 5], dealerUpcard: 5, correctAction: 'DOUBLE' },
      { playerHand: [7, 4], dealerUpcard: 10, correctAction: 'DOUBLE' },
      { playerHand: [8, 3], dealerUpcard: 11, correctAction: 'HIT' },
    ]
  },
  {
    id: 'double_10',
    name: 'Doubling on 10',
    description: 'Double 10 against dealer 2-9',
    category: WeaknessCategory.DOUBLING,
    type: DrillType.FLASHCARD,
    difficulty: 'easy',
    scenarios: [
      { playerHand: [6, 4], dealerUpcard: 5, correctAction: 'DOUBLE' },
      { playerHand: [7, 3], dealerUpcard: 9, correctAction: 'DOUBLE' },
      { playerHand: [8, 2], dealerUpcard: 10, correctAction: 'HIT' },
      { playerHand: [6, 4], dealerUpcard: 11, correctAction: 'HIT' },
    ]
  },
  {
    id: 'double_9',
    name: 'Doubling on 9',
    description: 'Double 9 against dealer 3-6',
    category: WeaknessCategory.DOUBLING,
    type: DrillType.FLASHCARD,
    difficulty: 'medium',
    scenarios: [
      { playerHand: [5, 4], dealerUpcard: 3, correctAction: 'DOUBLE' },
      { playerHand: [6, 3], dealerUpcard: 6, correctAction: 'DOUBLE' },
      { playerHand: [7, 2], dealerUpcard: 2, correctAction: 'HIT' },
      { playerHand: [5, 4], dealerUpcard: 7, correctAction: 'HIT' },
    ]
  },
  
  // Surrender Drills
  {
    id: 'surrender_16',
    name: 'Surrendering 16',
    description: 'Surrender 16 vs 9, 10, or Ace',
    category: WeaknessCategory.SURRENDER,
    type: DrillType.FLASHCARD,
    difficulty: 'medium',
    scenarios: [
      { playerHand: [10, 6], dealerUpcard: 9, correctAction: 'SURRENDER' },
      { playerHand: [9, 7], dealerUpcard: 10, correctAction: 'SURRENDER' },
      { playerHand: [10, 6], dealerUpcard: 11, correctAction: 'SURRENDER' },
      { playerHand: [10, 6], dealerUpcard: 7, correctAction: 'HIT' },
    ]
  },
  {
    id: 'surrender_15',
    name: 'Surrendering 15',
    description: 'Surrender 15 vs 10',
    category: WeaknessCategory.SURRENDER,
    type: DrillType.FLASHCARD,
    difficulty: 'medium',
    scenarios: [
      { playerHand: [10, 5], dealerUpcard: 10, correctAction: 'SURRENDER' },
      { playerHand: [9, 6], dealerUpcard: 9, correctAction: 'HIT' },
      { playerHand: [8, 7], dealerUpcard: 11, correctAction: 'HIT' },
    ]
  },
  
  // Mixed Strategy Drills
  {
    id: 'dealer_bust_cards',
    name: 'Dealer Bust Cards',
    description: 'Recognize when dealer is likely to bust (4, 5, 6)',
    category: WeaknessCategory.STANDING,
    type: DrillType.QUIZ,
    difficulty: 'easy',
    scenarios: [
      { playerHand: [10, 3], dealerUpcard: 5, correctAction: 'STAND' },
      { playerHand: [10, 2], dealerUpcard: 6, correctAction: 'STAND' },
      { playerHand: [9, 4], dealerUpcard: 4, correctAction: 'STAND' },
    ]
  },
  {
    id: 'hitting_vs_standing',
    name: 'Hit or Stand Challenge',
    description: 'Practice the hit/stand boundary decisions',
    category: WeaknessCategory.HITTING,
    type: DrillType.TIMED,
    difficulty: 'hard',
    scenarios: [
      { playerHand: [10, 2], dealerUpcard: 2, correctAction: 'HIT' },
      { playerHand: [10, 2], dealerUpcard: 4, correctAction: 'STAND' },
      { playerHand: [10, 3], dealerUpcard: 2, correctAction: 'STAND' },
      { playerHand: [10, 4], dealerUpcard: 10, correctAction: 'HIT' },
      { playerHand: [10, 6], dealerUpcard: 10, correctAction: 'HIT' },
      { playerHand: [10, 7], dealerUpcard: 10, correctAction: 'STAND' },
    ]
  },
  {
    id: 'comprehensive_review',
    name: 'Comprehensive Strategy Review',
    description: 'Mix of all basic strategy situations',
    category: WeaknessCategory.HARD_TOTALS,
    type: DrillType.QUIZ,
    difficulty: 'hard',
    scenarios: [
      { playerHand: [10, 6], dealerUpcard: 10, correctAction: 'HIT' },
      { playerHand: [11, 7], dealerUpcard: 9, correctAction: 'HIT' },
      { playerHand: [8, 8], dealerUpcard: 10, correctAction: 'SPLIT' },
      { playerHand: [6, 5], dealerUpcard: 6, correctAction: 'DOUBLE' },
      { playerHand: [10, 5], dealerUpcard: 10, correctAction: 'SURRENDER' },
    ]
  },
];

/**
 * Analyze player stats to identify weaknesses
 */
export function analyzeWeaknesses(strategyStats) {
  const weaknesses = [];
  const mistakes = strategyStats?.mistakes || {};
  
  // Group mistakes by category
  const categoryMistakes = {
    [WeaknessCategory.HARD_TOTALS]: [],
    [WeaknessCategory.SOFT_TOTALS]: [],
    [WeaknessCategory.PAIRS]: [],
    [WeaknessCategory.DOUBLING]: [],
    [WeaknessCategory.SURRENDER]: [],
    [WeaknessCategory.SPLITTING]: [],
    [WeaknessCategory.HITTING]: [],
    [WeaknessCategory.STANDING]: [],
  };
  
  // Analyze each mistake
  for (const [key, data] of Object.entries(mistakes)) {
    const count = data.count || 0;
    if (count < WEAKNESS_THRESHOLDS.MIN_DECISIONS) continue;
    
    // Parse the key (e.g., "16_vs_10")
    const [playerTotal, dealerCard] = key.split('_vs_');
    const total = parseInt(playerTotal);
    const correctAction = data.correct;
    
    // Categorize the mistake
    let category = WeaknessCategory.HARD_TOTALS;
    
    if (correctAction === 'SPLIT') {
      category = WeaknessCategory.SPLITTING;
    } else if (correctAction === 'SURRENDER') {
      category = WeaknessCategory.SURRENDER;
    } else if (correctAction === 'DOUBLE') {
      category = WeaknessCategory.DOUBLING;
    } else if (total >= 13 && total <= 21 && key.includes('soft')) {
      category = WeaknessCategory.SOFT_TOTALS;
    } else if (correctAction === 'HIT') {
      category = WeaknessCategory.HITTING;
    } else if (correctAction === 'STAND') {
      category = WeaknessCategory.STANDING;
    }
    
    categoryMistakes[category].push({
      key,
      count,
      correct: correctAction,
      wrong: data.wrong,
      playerTotal: total,
      dealerCard
    });
  }
  
  // Calculate error rates for each category
  for (const [category, categoryData] of Object.entries(categoryMistakes)) {
    const totalMistakes = categoryData.reduce((sum, m) => sum + m.count, 0);
    
    if (totalMistakes >= WEAKNESS_THRESHOLDS.MIN_DECISIONS) {
      weaknesses.push({
        category,
        severity: calculateSeverity(totalMistakes, categoryData),
        mistakeCount: totalMistakes,
        commonMistakes: categoryData.slice(0, 3), // Top 3 mistakes
        recommendedDrills: getRecommendedDrills(category, categoryData)
      });
    }
  }
  
  // Sort by severity (highest first)
  weaknesses.sort((a, b) => b.severity - a.severity);
  
  return weaknesses;
}

/**
 * Calculate severity score (0-100)
 */
function calculateSeverity(totalMistakes, mistakes) {
  // Base severity from mistake count
  let severity = Math.min(totalMistakes * 2, 50);
  
  // Add severity for high-cost mistakes (doubling, splitting)
  const highCostMistakes = mistakes.filter(m => 
    m.correct === 'DOUBLE' || m.correct === 'SPLIT'
  );
  severity += highCostMistakes.length * 10;
  
  // Cap at 100
  return Math.min(severity, 100);
}

/**
 * Get recommended drills for a weakness category
 */
function getRecommendedDrills(category, mistakes) {
  // Filter drills by category
  let relevantDrills = DRILL_LIBRARY.filter(d => d.category === category);
  
  // If no exact match, get related drills
  if (relevantDrills.length === 0) {
    relevantDrills = DRILL_LIBRARY.filter(d => 
      d.category === WeaknessCategory.HARD_TOTALS ||
      d.category === WeaknessCategory.SOFT_TOTALS
    );
  }
  
  // Sort by difficulty (easier first for beginners)
  const difficultyOrder = { easy: 1, medium: 2, hard: 3 };
  relevantDrills.sort((a, b) => 
    difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty]
  );
  
  return relevantDrills.slice(0, 3);
}

/**
 * Generate a personalized training session
 */
export function generateTrainingSession(weaknesses, options = {}) {
  const {
    maxDrills = 5,
    focusCategory = null,
    difficulty = null
  } = options;
  
  const session = {
    id: Date.now(),
    createdAt: new Date().toISOString(),
    drills: [],
    totalScenarios: 0,
    focusAreas: []
  };
  
  // If specific category requested
  if (focusCategory) {
    const categoryDrills = DRILL_LIBRARY.filter(d => d.category === focusCategory);
    session.drills = categoryDrills.slice(0, maxDrills);
    session.focusAreas = [focusCategory];
  } 
  // Otherwise build from weaknesses
  else if (weaknesses.length > 0) {
    const drillSet = new Set();
    
    for (const weakness of weaknesses) {
      for (const drill of weakness.recommendedDrills) {
        if (!drillSet.has(drill.id) && session.drills.length < maxDrills) {
          drillSet.add(drill.id);
          session.drills.push(drill);
          if (!session.focusAreas.includes(weakness.category)) {
            session.focusAreas.push(weakness.category);
          }
        }
      }
    }
  }
  // No weaknesses - provide general practice
  else {
    const generalDrills = DRILL_LIBRARY.filter(d => d.difficulty === 'medium');
    session.drills = shuffleArray(generalDrills).slice(0, maxDrills);
    session.focusAreas = ['general'];
  }
  
  // Filter by difficulty if specified
  if (difficulty) {
    session.drills = session.drills.filter(d => d.difficulty === difficulty);
  }
  
  // Count total scenarios
  session.totalScenarios = session.drills.reduce(
    (sum, d) => sum + (d.scenarios?.length || 0), 
    0
  );
  
  return session;
}

/**
 * Evaluate a drill answer
 */
export function evaluateDrillAnswer(drill, scenarioIndex, userAnswer) {
  const scenario = drill.scenarios[scenarioIndex];
  if (!scenario) return { correct: false, error: 'Invalid scenario' };
  
  const isCorrect = userAnswer.toUpperCase() === scenario.correctAction.toUpperCase();
  
  return {
    correct: isCorrect,
    userAnswer: userAnswer.toUpperCase(),
    correctAnswer: scenario.correctAction,
    explanation: getExplanation(scenario)
  };
}

/**
 * Get explanation for a scenario
 */
function getExplanation(scenario) {
  const { playerHand, dealerUpcard, correctAction } = scenario;
  const total = playerHand.reduce((sum, c) => sum + (c === 11 ? 11 : c), 0);
  const isSoft = playerHand.includes(11);
  
  let explanation = '';
  
  switch (correctAction) {
    case 'HIT':
      explanation = `With ${isSoft ? 'soft' : 'hard'} ${total} vs dealer ${dealerUpcard}, hitting is the mathematically optimal play.`;
      break;
    case 'STAND':
      explanation = `Standing on ${total} vs dealer ${dealerUpcard} has the highest expected value.`;
      break;
    case 'DOUBLE':
      explanation = `Doubling on ${total} vs dealer ${dealerUpcard} maximizes profit when you have the advantage.`;
      break;
    case 'SPLIT':
      explanation = `Splitting this pair vs dealer ${dealerUpcard} gives you better starting hands.`;
      break;
    case 'SURRENDER':
      explanation = `Surrendering ${total} vs dealer ${dealerUpcard} minimizes your losses in this unfavorable situation.`;
      break;
    default:
      explanation = `The correct play is ${correctAction}.`;
  }
  
  return explanation;
}

/**
 * Shuffle array helper
 */
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Get category display name
 */
export function getCategoryDisplayName(category) {
  const names = {
    [WeaknessCategory.HARD_TOTALS]: 'Hard Totals',
    [WeaknessCategory.SOFT_TOTALS]: 'Soft Totals',
    [WeaknessCategory.PAIRS]: 'Pair Splitting',
    [WeaknessCategory.SURRENDER]: 'Surrender',
    [WeaknessCategory.DOUBLING]: 'Doubling Down',
    [WeaknessCategory.SPLITTING]: 'Splitting',
    [WeaknessCategory.INSURANCE]: 'Insurance',
    [WeaknessCategory.HITTING]: 'Hitting',
    [WeaknessCategory.STANDING]: 'Standing',
  };
  return names[category] || category;
}

/**
 * Get severity label
 */
export function getSeverityLabel(severity) {
  if (severity >= 70) return { label: 'Critical', color: 'destructive' };
  if (severity >= 40) return { label: 'Needs Work', color: 'warning' };
  return { label: 'Minor', color: 'muted' };
}

export default {
  analyzeWeaknesses,
  generateTrainingSession,
  evaluateDrillAnswer,
  getCategoryDisplayName,
  getSeverityLabel,
  DRILL_LIBRARY,
  WeaknessCategory,
  DrillType,
  WEAKNESS_THRESHOLDS
};
