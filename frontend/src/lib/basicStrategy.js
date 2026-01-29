// Basic Strategy Lookup Table and Deviation Indices for Blackjack
// Based on standard basic strategy for 6-deck, S17, DAS allowed

// Action codes
export const Actions = {
  H: 'HIT',
  S: 'STAND',
  D: 'DOUBLE',    // Double if allowed, otherwise Hit
  Ds: 'DOUBLE_S', // Double if allowed, otherwise Stand
  P: 'SPLIT',
  Ph: 'SPLIT_H',  // Split if DAS allowed, otherwise Hit
  Rh: 'SURRENDER_H', // Surrender if allowed, otherwise Hit
  Rs: 'SURRENDER_S', // Surrender if allowed, otherwise Stand
  Rp: 'SURRENDER_P'  // Surrender if allowed, otherwise Split
};

// Hard totals strategy (player total vs dealer upcard 2-A)
// Index: [playerTotal - 5][dealerUpcard - 2] (A = index 9)
const hardTotals = {
  5:  ['H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H'],
  6:  ['H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H'],
  7:  ['H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H'],
  8:  ['H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H'],
  9:  ['H', 'D', 'D', 'D', 'D', 'H', 'H', 'H', 'H', 'H'],
  10: ['D', 'D', 'D', 'D', 'D', 'D', 'D', 'D', 'H', 'H'],
  11: ['D', 'D', 'D', 'D', 'D', 'D', 'D', 'D', 'D', 'D'],
  12: ['H', 'H', 'S', 'S', 'S', 'H', 'H', 'H', 'H', 'H'],
  13: ['S', 'S', 'S', 'S', 'S', 'H', 'H', 'H', 'H', 'H'],
  14: ['S', 'S', 'S', 'S', 'S', 'H', 'H', 'H', 'H', 'H'],
  15: ['S', 'S', 'S', 'S', 'S', 'H', 'H', 'H', 'Rh', 'Rh'],
  16: ['S', 'S', 'S', 'S', 'S', 'H', 'H', 'Rh', 'Rh', 'Rh'],
  17: ['S', 'S', 'S', 'S', 'S', 'S', 'S', 'S', 'S', 'Rs'],
  18: ['S', 'S', 'S', 'S', 'S', 'S', 'S', 'S', 'S', 'S'],
  19: ['S', 'S', 'S', 'S', 'S', 'S', 'S', 'S', 'S', 'S'],
  20: ['S', 'S', 'S', 'S', 'S', 'S', 'S', 'S', 'S', 'S'],
  21: ['S', 'S', 'S', 'S', 'S', 'S', 'S', 'S', 'S', 'S']
};

// Soft totals strategy (A + X vs dealer upcard 2-A)
// Index: [softTotal - 13][dealerUpcard - 2]
const softTotals = {
  13: ['H', 'H', 'H', 'D', 'D', 'H', 'H', 'H', 'H', 'H'],  // A,2
  14: ['H', 'H', 'H', 'D', 'D', 'H', 'H', 'H', 'H', 'H'],  // A,3
  15: ['H', 'H', 'D', 'D', 'D', 'H', 'H', 'H', 'H', 'H'],  // A,4
  16: ['H', 'H', 'D', 'D', 'D', 'H', 'H', 'H', 'H', 'H'],  // A,5
  17: ['H', 'D', 'D', 'D', 'D', 'H', 'H', 'H', 'H', 'H'],  // A,6
  18: ['Ds', 'Ds', 'Ds', 'Ds', 'Ds', 'S', 'S', 'H', 'H', 'H'], // A,7
  19: ['S', 'S', 'S', 'S', 'Ds', 'S', 'S', 'S', 'S', 'S'], // A,8
  20: ['S', 'S', 'S', 'S', 'S', 'S', 'S', 'S', 'S', 'S'],  // A,9
  21: ['S', 'S', 'S', 'S', 'S', 'S', 'S', 'S', 'S', 'S']   // A,10 (BJ)
};

// Pairs strategy (pair vs dealer upcard 2-A)
// Index: [pairValue - 2][dealerUpcard - 2] (A-A = index 9)
const pairs = {
  2:  ['Ph', 'Ph', 'P', 'P', 'P', 'P', 'H', 'H', 'H', 'H'],
  3:  ['Ph', 'Ph', 'P', 'P', 'P', 'P', 'H', 'H', 'H', 'H'],
  4:  ['H', 'H', 'H', 'Ph', 'Ph', 'H', 'H', 'H', 'H', 'H'],
  5:  ['D', 'D', 'D', 'D', 'D', 'D', 'D', 'D', 'H', 'H'],  // Never split 5s
  6:  ['Ph', 'P', 'P', 'P', 'P', 'H', 'H', 'H', 'H', 'H'],
  7:  ['P', 'P', 'P', 'P', 'P', 'P', 'H', 'H', 'H', 'H'],
  8:  ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P', 'P', 'Rp'],
  9:  ['P', 'P', 'P', 'P', 'P', 'S', 'P', 'P', 'S', 'S'],
  10: ['S', 'S', 'S', 'S', 'S', 'S', 'S', 'S', 'S', 'S'],  // Never split 10s
  11: ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P', 'P', 'P']   // A-A (value 11)
};

// Hi-Lo Deviation Indices (Illustrious 18 + Fab 4)
// Format: { situation: { threshold, action, description } }
export const deviationIndices = {
  // Insurance
  'INSURANCE': { threshold: 3, action: 'TAKE', description: 'Take insurance at TC ≥ +3' },
  
  // 16 vs 10
  '16_vs_10': { threshold: 0, action: 'STAND', description: 'Stand on 16 vs 10 at TC ≥ 0' },
  
  // 15 vs 10
  '15_vs_10': { threshold: 4, action: 'STAND', description: 'Stand on 15 vs 10 at TC ≥ +4' },
  
  // 10 vs 10
  '10_vs_10': { threshold: 4, action: 'DOUBLE', description: 'Double 10 vs 10 at TC ≥ +4' },
  
  // 10 vs A
  '10_vs_A': { threshold: 4, action: 'DOUBLE', description: 'Double 10 vs A at TC ≥ +4' },
  
  // 12 vs 3
  '12_vs_3': { threshold: 2, action: 'STAND', description: 'Stand on 12 vs 3 at TC ≥ +2' },
  
  // 12 vs 2
  '12_vs_2': { threshold: 3, action: 'STAND', description: 'Stand on 12 vs 2 at TC ≥ +3' },
  
  // 11 vs A
  '11_vs_A': { threshold: 1, action: 'DOUBLE', description: 'Double 11 vs A at TC ≥ +1' },
  
  // 9 vs 2
  '9_vs_2': { threshold: 1, action: 'DOUBLE', description: 'Double 9 vs 2 at TC ≥ +1' },
  
  // 9 vs 7
  '9_vs_7': { threshold: 3, action: 'DOUBLE', description: 'Double 9 vs 7 at TC ≥ +3' },
  
  // 10 vs A (for double)
  '16_vs_9': { threshold: 5, action: 'STAND', description: 'Stand on 16 vs 9 at TC ≥ +5' },
  
  // 13 vs 2
  '13_vs_2': { threshold: -1, action: 'HIT', description: 'Hit 13 vs 2 at TC ≤ -1' },
  
  // 13 vs 3
  '13_vs_3': { threshold: -2, action: 'HIT', description: 'Hit 13 vs 3 at TC ≤ -2' },
  
  // 12 vs 4
  '12_vs_4': { threshold: 0, action: 'HIT', description: 'Hit 12 vs 4 at TC < 0' },
  
  // 12 vs 5
  '12_vs_5': { threshold: -2, action: 'HIT', description: 'Hit 12 vs 5 at TC ≤ -2' },
  
  // 12 vs 6
  '12_vs_6': { threshold: -1, action: 'HIT', description: 'Hit 12 vs 6 at TC ≤ -1' },
  
  // Surrender deviations (Fab 4)
  '14_vs_10_surr': { threshold: 3, action: 'SURRENDER', description: 'Surrender 14 vs 10 at TC ≥ +3' },
  '15_vs_9_surr': { threshold: 2, action: 'SURRENDER', description: 'Surrender 15 vs 9 at TC ≥ +2' },
  '15_vs_A_surr': { threshold: 1, action: 'SURRENDER', description: 'Surrender 15 vs A at TC ≥ +1' },
  '14_vs_A_surr': { threshold: 3, action: 'SURRENDER', description: 'Surrender 14 vs A at TC ≥ +3' }
};

/**
 * Get dealer upcard index for strategy tables (2-10 = 0-8, A = 9)
 */
function getDealerIndex(dealerUpcard) {
  const value = dealerUpcard.rank?.value || dealerUpcard.value || dealerUpcard;
  if (value === 11 || value === 1) return 9; // Ace
  return Math.min(value, 10) - 2;
}

/**
 * Check if hand is a pair
 */
function isPair(cards) {
  if (cards.length !== 2) return false;
  const rank1 = cards[0].rank?.symbol || cards[0].symbol;
  const rank2 = cards[1].rank?.symbol || cards[1].symbol;
  return rank1 === rank2;
}

/**
 * Get pair value for strategy lookup (2-10 for pairs, 11 for A-A)
 */
function getPairValue(cards) {
  const value = cards[0].rank?.value || cards[0].value;
  return value === 11 ? 11 : Math.min(value, 10);
}

/**
 * Check if hand is soft (has an Ace counted as 11)
 */
function isSoft(cards) {
  let total = 0;
  let aceCount = 0;
  
  for (const card of cards) {
    const value = card.rank?.value || card.value;
    total += value;
    if (value === 11) aceCount++;
  }
  
  while (total > 21 && aceCount > 0) {
    total -= 10;
    aceCount--;
  }
  
  return aceCount > 0 && total <= 21;
}

/**
 * Get hand total
 */
function getTotal(cards) {
  let total = 0;
  let aceCount = 0;
  
  for (const card of cards) {
    const value = card.rank?.value || card.value;
    total += value;
    if (value === 11) aceCount++;
  }
  
  while (total > 21 && aceCount > 0) {
    total -= 10;
    aceCount--;
  }
  
  return total;
}

/**
 * Convert action code to full action name
 */
function resolveAction(code, canDouble, canSurrender, canSplit) {
  switch (code) {
    case 'H': return 'HIT';
    case 'S': return 'STAND';
    case 'D': return canDouble ? 'DOUBLE' : 'HIT';
    case 'Ds': return canDouble ? 'DOUBLE' : 'STAND';
    case 'P': return canSplit ? 'SPLIT' : 'HIT';
    case 'Ph': return canSplit ? 'SPLIT' : 'HIT';
    case 'Rh': return canSurrender ? 'SURRENDER' : 'HIT';
    case 'Rs': return canSurrender ? 'SURRENDER' : 'STAND';
    case 'Rp': return canSurrender ? 'SURRENDER' : (canSplit ? 'SPLIT' : 'HIT');
    default: return 'STAND';
  }
}

/**
 * Get the optimal basic strategy action
 * @param {Array} playerCards - Player's cards
 * @param {Object} dealerUpcard - Dealer's face-up card
 * @param {Object} options - Game options
 * @returns {Object} - { action, reason, isDeviation, deviationInfo }
 */
export function getOptimalAction(playerCards, dealerUpcard, options = {}) {
  const {
    canDouble = true,
    canSplit = true,
    canSurrender = true,
    trueCount = null,
    showDeviations = true
  } = options;

  const dealerIdx = getDealerIndex(dealerUpcard);
  const playerTotal = getTotal(playerCards);
  const soft = isSoft(playerCards);
  const pair = isPair(playerCards);

  let action;
  let reason;
  let table;

  // Check for deviations first if true count is provided
  if (showDeviations && trueCount !== null) {
    const deviation = checkDeviation(playerCards, dealerUpcard, trueCount, canSurrender);
    if (deviation) {
      return {
        action: deviation.action,
        reason: deviation.description,
        isDeviation: true,
        deviationInfo: deviation
      };
    }
  }

  // Check pairs first
  if (pair && canSplit) {
    const pairVal = getPairValue(playerCards);
    if (pairs[pairVal]) {
      const code = pairs[pairVal][dealerIdx];
      action = resolveAction(code, canDouble, canSurrender, canSplit);
      table = 'pairs';
      reason = `Pair of ${pairVal}s vs ${getDealerDisplay(dealerUpcard)}`;
    }
  }

  // Check soft totals
  if (!action && soft && softTotals[playerTotal]) {
    const code = softTotals[playerTotal][dealerIdx];
    action = resolveAction(code, canDouble, canSurrender, false);
    table = 'soft';
    reason = `Soft ${playerTotal} vs ${getDealerDisplay(dealerUpcard)}`;
  }

  // Check hard totals
  if (!action) {
    const total = Math.min(Math.max(playerTotal, 5), 21);
    if (hardTotals[total]) {
      const code = hardTotals[total][dealerIdx];
      action = resolveAction(code, canDouble, canSurrender, false);
      table = 'hard';
      reason = `Hard ${playerTotal} vs ${getDealerDisplay(dealerUpcard)}`;
    }
  }

  // Default fallback
  if (!action) {
    action = playerTotal >= 17 ? 'STAND' : 'HIT';
    reason = 'Default action';
  }

  return {
    action,
    reason,
    isDeviation: false,
    deviationInfo: null,
    table
  };
}

/**
 * Get dealer display string
 */
function getDealerDisplay(dealerUpcard) {
  const value = dealerUpcard.rank?.value || dealerUpcard.value || dealerUpcard;
  if (value === 11 || value === 1) return 'A';
  return value.toString();
}

/**
 * Check for count-based deviations
 */
function checkDeviation(playerCards, dealerUpcard, trueCount, canSurrender) {
  const total = getTotal(playerCards);
  const dealerVal = dealerUpcard.rank?.value || dealerUpcard.value;
  const dealerDisplay = getDealerDisplay(dealerUpcard);
  
  // Build situation key
  const situationKey = `${total}_vs_${dealerDisplay === 'A' ? 'A' : dealerVal}`;
  
  // Check for specific deviations
  const deviations = [
    // 16 vs 10: Stand at TC >= 0
    { key: '16_vs_10', total: 16, dealer: 10, threshold: 0, above: true, action: 'STAND' },
    // 15 vs 10: Stand at TC >= +4
    { key: '15_vs_10', total: 15, dealer: 10, threshold: 4, above: true, action: 'STAND' },
    // 12 vs 3: Stand at TC >= +2
    { key: '12_vs_3', total: 12, dealer: 3, threshold: 2, above: true, action: 'STAND' },
    // 12 vs 2: Stand at TC >= +3
    { key: '12_vs_2', total: 12, dealer: 2, threshold: 3, above: true, action: 'STAND' },
    // 13 vs 2: Hit at TC <= -1
    { key: '13_vs_2', total: 13, dealer: 2, threshold: -1, above: false, action: 'HIT' },
    // 16 vs 9: Stand at TC >= +5
    { key: '16_vs_9', total: 16, dealer: 9, threshold: 5, above: true, action: 'STAND' },
  ];

  for (const dev of deviations) {
    if (total === dev.total && dealerVal === dev.dealer) {
      const shouldDeviate = dev.above ? trueCount >= dev.threshold : trueCount <= dev.threshold;
      if (shouldDeviate) {
        return {
          ...deviationIndices[dev.key],
          action: dev.action,
          triggered: true
        };
      }
    }
  }

  // Check surrender deviations
  if (canSurrender) {
    const surrDeviations = [
      { total: 14, dealer: 10, threshold: 3, key: '14_vs_10_surr' },
      { total: 15, dealer: 9, threshold: 2, key: '15_vs_9_surr' },
      { total: 15, dealer: 11, threshold: 1, key: '15_vs_A_surr' },
      { total: 14, dealer: 11, threshold: 3, key: '14_vs_A_surr' }
    ];

    for (const dev of surrDeviations) {
      if (total === dev.total && dealerVal === dev.dealer && trueCount >= dev.threshold) {
        return {
          ...deviationIndices[dev.key],
          action: 'SURRENDER',
          triggered: true
        };
      }
    }
  }

  return null;
}

/**
 * Check if insurance is a good play based on true count
 */
export function shouldTakeInsurance(trueCount) {
  return trueCount >= 3;
}

/**
 * Get a description of why the action is optimal
 */
export function getActionExplanation(action, playerTotal, dealerUpcard, isSoft, isPair) {
  const dealer = getDealerDisplay(dealerUpcard);
  
  const explanations = {
    HIT: {
      low: `With ${playerTotal}, you need to improve. Dealer's ${dealer} is strong.`,
      mid: `${playerTotal} is risky. Hit to try to improve without busting.`,
      high: `Even with ${playerTotal}, hitting is correct here based on probabilities.`
    },
    STAND: {
      low: `Stand on ${playerTotal} and hope dealer busts with their ${dealer}.`,
      mid: `${playerTotal} is strong enough. Let the dealer take the risk.`,
      high: `${playerTotal} is very strong. Standing is optimal.`
    },
    DOUBLE: {
      default: `${playerTotal} vs ${dealer} is a favorable doubling situation.`
    },
    SPLIT: {
      default: `Splitting gives you two chances to beat dealer's ${dealer}.`
    },
    SURRENDER: {
      default: `${playerTotal} vs ${dealer} has very low win probability. Surrender saves half your bet.`
    }
  };

  if (action === 'DOUBLE' || action === 'SPLIT' || action === 'SURRENDER') {
    return explanations[action].default;
  }

  if (playerTotal <= 11) return explanations[action].low;
  if (playerTotal <= 16) return explanations[action].mid;
  return explanations[action].high;
}

/**
 * Compare player's action to optimal and return feedback
 */
export function evaluateAction(playerAction, playerCards, dealerUpcard, options = {}) {
  const optimal = getOptimalAction(playerCards, dealerUpcard, options);
  const isCorrect = playerAction.toUpperCase() === optimal.action.toUpperCase();
  
  return {
    isCorrect,
    playerAction: playerAction.toUpperCase(),
    optimalAction: optimal.action,
    reason: optimal.reason,
    isDeviation: optimal.isDeviation,
    deviationInfo: optimal.deviationInfo
  };
}

export default {
  getOptimalAction,
  evaluateAction,
  shouldTakeInsurance,
  getActionExplanation,
  deviationIndices,
  Actions
};
