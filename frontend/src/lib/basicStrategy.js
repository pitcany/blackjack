// Basic Strategy Lookup Table for Blackjack
// Supports H17/S17, DAS/NDAS rules
// Actions: H=Hit, S=Stand, D=Double(hit if can't), Ds=Double(stand if can't), P=Split, Ph=Split(hit if can't), Rh=Surrender(hit if can't), Rs=Surrender(stand if can't), Rp=Surrender(split if can't)

// Dealer upcard index: 2=0, 3=1, ..., 9=7, 10=8, A=9
function dealerIndex(upcardValue) {
  if (upcardValue === 11 || upcardValue === 1) return 9; // Ace
  return upcardValue - 2;
}

// Hard totals: rows are player totals 5-21, columns are dealer 2-A
// S17 table (dealer stands on soft 17)
const HARD_S17 = {
  5:  'HHHHHHHHHH',
  6:  'HHHHHHHHHH',
  7:  'HHHHHHHHHH',
  8:  'HHHHHHHHHH',
  9:  'HHDDDHHHHH',
  10: 'DDDDDDDDHH',
  11: 'DDDDDDDDDH',
  12: 'HHSSSHHHHH',
  13: 'SSSSSHHHHH',
  14: 'SSSSSHHHHH',
  15: 'SSSSSHHHHH',
  16: 'SSSSSHHHHH',
  17: 'SSSSSSSSSS',
  18: 'SSSSSSSSSS',
  19: 'SSSSSSSSSS',
  20: 'SSSSSSSSSS',
  21: 'SSSSSSSSSS',
};

// H17 differs slightly for some hands
const HARD_H17 = {
  ...HARD_S17,
  11: 'DDDDDDDDDD',
};

// Soft totals: rows are soft total (A+X), columns are dealer 2-A
const SOFT_S17 = {
  13: 'HHDDDHHHHH', // A,2
  14: 'HHDDDHHHHH', // A,3
  15: 'HHHDDHHHHH', // A,4
  16: 'HHHDDHHHHH', // A,5
  17: 'HDDDDHHHHH', // A,6
  18: 'SDDDDSSHHH', // A,7
  19: 'SSSSSSSSSS', // A,8
  20: 'SSSSSSSSSS', // A,9
  21: 'SSSSSSSSSS', // A,10 (blackjack handled separately)
};

const SOFT_H17 = {
  ...SOFT_S17,
  18: 'SDDDDSSHHH', // differs: double vs 2 in H17
  19: 'SSSSSSSSSS',
};

// Pairs: rows are pair value, columns are dealer 2-A
// Uses 'P' for split, 'H' for hit, 'S' for stand, 'D' for double
const PAIRS_S17_DAS = {
  2:  'PPPPPPHHHH'.substring(0,10), // 2,2
  3:  'PPPPPPHHHH'.substring(0,10), // 3,3
  4:  'HHHPPHHHHH', // 4,4
  5:  'DDDDDDDDHH', // 5,5 - never split, treat as 10
  6:  'PPPPPHHHHH'.substring(0,10), // 6,6
  7:  'PPPPPPHHHH', // 7,7
  8:  'PPPPPPPPPP', // 8,8
  9:  'PPPPPSPPSS', // 9,9
  10: 'SSSSSSSSSS', // 10,10
  11: 'PPPPPPPPPP', // A,A
};

const PAIRS_S17_NDAS = {
  2:  'HPPPPPHHHH', // 2,2
  3:  'HPPPPPHHHH', // 3,3
  4:  'HHHHHHHHHH', // 4,4
  5:  'DDDDDDDDHH', // 5,5
  6:  'PPPPPHHHHH', // 6,6
  7:  'PPPPPPHHHH', // 7,7
  8:  'PPPPPPPPPP', // 8,8
  9:  'PPPPPSPPSS', // 9,9
  10: 'SSSSSSSSSS', // 10,10
  11: 'PPPPPPPPPP', // A,A
};

const PAIRS_H17_DAS = {
  ...PAIRS_S17_DAS,
};

const PAIRS_H17_NDAS = {
  ...PAIRS_S17_NDAS,
};

// Surrender table (late surrender): returns true if should surrender
// Key: `${playerTotal}_${dealerIndex}`
const SURRENDER_S17 = {
  '16_7': true,  // 16 vs 9
  '16_8': true,  // 16 vs 10
  '15_8': true,  // 15 vs 10
};

const SURRENDER_H17 = {
  '16_7': true,  // 16 vs 9
  '16_8': true,  // 16 vs 10
  '16_9': true,  // 16 vs A
  '15_7': true,  // 15 vs 9 (H17 only)
  '15_8': true,  // 15 vs 10
  '15_9': true,  // 15 vs A
  '17_9': true,  // 17 vs A
};

function charToAction(ch) {
  switch (ch) {
    case 'H': return 'hit';
    case 'S': return 'stand';
    case 'D': return 'double';
    case 'P': return 'split';
    case 'R': return 'surrender';
    default: return 'hit';
  }
}

/**
 * Get the basic strategy recommendation.
 * @param {object} params
 * @param {number} params.playerTotal - Player hand total
 * @param {boolean} params.isSoft - Whether the hand is soft
 * @param {boolean} params.isPair - Whether the hand is a pair (2 cards of same rank)
 * @param {number} params.pairValue - Value of the pair card (2-11, 11=Ace)
 * @param {number} params.dealerUpcard - Dealer's upcard value (2-11)
 * @param {boolean} params.canDouble - Whether doubling is allowed
 * @param {boolean} params.canSplit - Whether splitting is allowed
 * @param {boolean} params.canSurrender - Whether surrender is allowed
 * @param {boolean} params.dealerHitsSoft17 - H17 rule
 * @param {boolean} params.doubleAfterSplit - DAS rule
 * @param {number} params.numCards - Number of cards in hand
 * @returns {string} - 'hit', 'stand', 'double', 'split', 'surrender'
 */
export function getBasicStrategy({
  playerTotal,
  isSoft,
  isPair,
  pairValue,
  dealerUpcard,
  canDouble = true,
  canSplit = true,
  canSurrender = true,
  dealerHitsSoft17 = false,
  doubleAfterSplit = true,
  numCards = 2,
}) {
  const di = dealerIndex(dealerUpcard);

  // Check surrender first (only on initial 2 cards)
  if (canSurrender && numCards === 2 && !isSoft) {
    const surrenderTable = dealerHitsSoft17 ? SURRENDER_H17 : SURRENDER_S17;
    if (surrenderTable[`${playerTotal}_${di}`]) {
      return 'surrender';
    }
  }

  // Pairs
  if (isPair && canSplit && numCards === 2) {
    let pairTable;
    if (dealerHitsSoft17) {
      pairTable = doubleAfterSplit ? PAIRS_H17_DAS : PAIRS_H17_NDAS;
    } else {
      pairTable = doubleAfterSplit ? PAIRS_S17_DAS : PAIRS_S17_NDAS;
    }

    const pairKey = pairValue === 1 ? 11 : pairValue;
    const row = pairTable[pairKey];
    if (row) {
      const action = charToAction(row[di]);
      if (action === 'split') return 'split';
      if (action === 'double' && !canDouble) return 'hit';
      if (action !== 'split') {
        // Fall through to hard/soft totals for non-split recommendation
      } else {
        return action;
      }
    }
  }

  // Soft totals
  if (isSoft && playerTotal >= 13 && playerTotal <= 21) {
    const softTable = dealerHitsSoft17 ? SOFT_H17 : SOFT_S17;
    const row = softTable[playerTotal];
    if (row) {
      const action = charToAction(row[di]);
      if (action === 'double' && !canDouble) return 'hit';
      return action;
    }
  }

  // Hard totals
  if (playerTotal >= 5 && playerTotal <= 21) {
    const hardTable = dealerHitsSoft17 ? HARD_H17 : HARD_S17;
    const row = hardTable[playerTotal] || hardTable[Math.min(playerTotal, 21)];
    if (row) {
      const action = charToAction(row[di]);
      if (action === 'double' && !canDouble) return 'hit';
      return action;
    }
  }

  // Default: hit for low totals
  return playerTotal >= 17 ? 'stand' : 'hit';
}

/**
 * Hi-Lo deviation indices.
 * Each entry: { playerTotal, isSoft, dealerUpcard, normalAction, deviationAction, index, description }
 * index = true count at which to deviate
 */
const DEVIATION_INDICES = [
  { playerTotal: 16, isSoft: false, dealerUpcard: 10, normalAction: 'hit', deviationAction: 'stand', index: 0, description: '16 vs 10: Stand at TC >= 0' },
  { playerTotal: 15, isSoft: false, dealerUpcard: 10, normalAction: 'hit', deviationAction: 'stand', index: 4, description: '15 vs 10: Stand at TC >= +4' },
  { playerTotal: 13, isSoft: false, dealerUpcard: 2, normalAction: 'stand', deviationAction: 'hit', index: -1, description: '13 vs 2: Hit at TC <= -1' },
  { playerTotal: 13, isSoft: false, dealerUpcard: 3, normalAction: 'stand', deviationAction: 'hit', index: -2, description: '13 vs 3: Hit at TC <= -2' },
  { playerTotal: 12, isSoft: false, dealerUpcard: 2, normalAction: 'hit', deviationAction: 'stand', index: 3, description: '12 vs 2: Stand at TC >= +3' },
  { playerTotal: 12, isSoft: false, dealerUpcard: 3, normalAction: 'hit', deviationAction: 'stand', index: 2, description: '12 vs 3: Stand at TC >= +2' },
  { playerTotal: 12, isSoft: false, dealerUpcard: 4, normalAction: 'stand', deviationAction: 'hit', index: -1, description: '12 vs 4: Hit at TC <= -1' },
  { playerTotal: 11, isSoft: false, dealerUpcard: 11, normalAction: 'hit', deviationAction: 'double', index: 1, description: '11 vs A: Double at TC >= +1' },
  { playerTotal: 10, isSoft: false, dealerUpcard: 10, normalAction: 'hit', deviationAction: 'double', index: 4, description: '10 vs 10: Double at TC >= +4' },
  { playerTotal: 10, isSoft: false, dealerUpcard: 11, normalAction: 'hit', deviationAction: 'double', index: 3, description: '10 vs A: Double at TC >= +3' },
  { playerTotal: 9, isSoft: false, dealerUpcard: 2, normalAction: 'hit', deviationAction: 'double', index: 1, description: '9 vs 2: Double at TC >= +1' },
  { playerTotal: 9, isSoft: false, dealerUpcard: 7, normalAction: 'hit', deviationAction: 'double', index: 3, description: '9 vs 7: Double at TC >= +3' },
  { playerTotal: 20, isSoft: false, dealerUpcard: 5, normalAction: 'stand', deviationAction: 'split', index: 5, description: '10,10 vs 5: Split at TC >= +5', isPair: true },
  { playerTotal: 20, isSoft: false, dealerUpcard: 6, normalAction: 'stand', deviationAction: 'split', index: 4, description: '10,10 vs 6: Split at TC >= +4', isPair: true },
  // Insurance
  { playerTotal: 0, isSoft: false, dealerUpcard: 11, normalAction: 'no_insurance', deviationAction: 'insurance', index: 3, description: 'Insurance: Take at TC >= +3', isInsurance: true },
];

/**
 * Check if any deviation applies to the current situation.
 * @param {number} playerTotal
 * @param {boolean} isSoft
 * @param {boolean} isPair
 * @param {number} dealerUpcard - dealer upcard value (2-11)
 * @param {number} trueCount
 * @returns {object|null} - deviation object if one applies, null otherwise
 */
export function getDeviation(playerTotal, isSoft, isPair, dealerUpcard, trueCount) {
  for (const dev of DEVIATION_INDICES) {
    if (dev.isInsurance) continue; // Insurance handled separately
    if (dev.playerTotal !== playerTotal) continue;
    if (dev.isSoft !== isSoft) continue;
    if (dev.dealerUpcard !== dealerUpcard) continue;
    if (dev.isPair && !isPair) continue;

    // Check if true count triggers the deviation
    if (dev.index >= 0 && trueCount >= dev.index) {
      return dev;
    }
    if (dev.index < 0 && trueCount <= dev.index) {
      return dev;
    }
  }
  return null;
}

/**
 * Check if insurance deviation applies.
 * @param {number} trueCount
 * @returns {boolean}
 */
export function shouldTakeInsurance(trueCount) {
  return trueCount >= 3;
}
