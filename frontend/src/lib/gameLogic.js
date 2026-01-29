// Card and Game Logic for Blackjack

// Enums
export const Suit = {
  HEARTS: '♥',
  DIAMONDS: '♦',
  CLUBS: '♣',
  SPADES: '♠'
};

export const Rank = {
  TWO: { value: 2, symbol: '2' },
  THREE: { value: 3, symbol: '3' },
  FOUR: { value: 4, symbol: '4' },
  FIVE: { value: 5, symbol: '5' },
  SIX: { value: 6, symbol: '6' },
  SEVEN: { value: 7, symbol: '7' },
  EIGHT: { value: 8, symbol: '8' },
  NINE: { value: 9, symbol: '9' },
  TEN: { value: 10, symbol: '10' },
  JACK: { value: 10, symbol: 'J' },
  QUEEN: { value: 10, symbol: 'Q' },
  KING: { value: 10, symbol: 'K' },
  ACE: { value: 11, symbol: 'A' }
};

export const GamePhase = {
  BETTING: 'BETTING',
  DEALING: 'DEALING',
  INSURANCE_OFFER: 'INSURANCE_OFFER',
  PLAYER_TURN: 'PLAYER_TURN',
  DEALER_TURN: 'DEALER_TURN',
  ROUND_OVER: 'ROUND_OVER'
};

export const Outcome = {
  WIN: 'WIN',
  LOSE: 'LOSE',
  PUSH: 'PUSH',
  BLACKJACK: 'BLACKJACK',
  BUST: 'BUST'
};

// Card class
export class Card {
  constructor(rank, suit) {
    this.rank = rank;
    this.suit = suit;
  }

  get value() {
    return this.rank.value;
  }

  get symbol() {
    return this.rank.symbol;
  }

  get isRed() {
    return this.suit === Suit.HEARTS || this.suit === Suit.DIAMONDS;
  }

  toString() {
    return `${this.symbol}${this.suit}`;
  }
}

// Calculate best total for a hand
export function calculateHandTotal(cards) {
  if (!cards || cards.length === 0) return { total: 0, isSoft: false };

  let total = 0;
  let aceCount = 0;

  for (const card of cards) {
    total += card.value;
    if (card.rank === Rank.ACE) aceCount++;
  }

  while (total > 21 && aceCount > 0) {
    total -= 10;
    aceCount--;
  }

  return {
    total,
    isSoft: aceCount > 0 && total <= 21
  };
}

// Check if hand is blackjack
export function isBlackjack(cards) {
  if (cards.length !== 2) return false;
  return calculateHandTotal(cards).total === 21;
}

// Check if hand is bust
export function isBust(cards) {
  return calculateHandTotal(cards).total > 21;
}

// Check if can split (same rank, or any two 10-value cards)
export function canSplit(cards) {
  if (cards.length !== 2) return false;
  return cards[0].rank === cards[1].rank || (cards[0].value === 10 && cards[1].value === 10);
}

// Hi-Lo counting value
export function hiLoValue(card) {
  const value = card.rank.value;
  const symbol = card.rank.symbol;
  
  if (['2', '3', '4', '5', '6'].includes(symbol)) return 1;
  if (['7', '8', '9'].includes(symbol)) return 0;
  return -1; // 10, J, Q, K, A
}

// Update running count
export function updateRunningCount(count, cards) {
  return cards.reduce((acc, card) => acc + hiLoValue(card), count);
}

// Calculate true count
export function trueCount(runningCount, decksRemaining) {
  if (decksRemaining < 0.5) decksRemaining = 0.5;
  return Math.round((runningCount / decksRemaining) * 10) / 10;
}

// Shoe class
export class Shoe {
  constructor(numDecks = 6, penetration = 0.75) {
    this.numDecks = numDecks;
    this.penetration = penetration;
    this.cards = [];
    this.totalCards = numDecks * 52;
    this.buildAndShuffle();
  }

  buildAndShuffle() {
    this.cards = [];
    const ranks = Object.values(Rank);
    const suits = Object.values(Suit);

    for (let d = 0; d < this.numDecks; d++) {
      for (const rank of ranks) {
        for (const suit of suits) {
          this.cards.push(new Card(rank, suit));
        }
      }
    }
    this.totalCards = this.cards.length;
    this.shuffle();
  }

  shuffle() {
    for (let i = this.cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
    }
  }

  draw() {
    if (this.cards.length === 0) {
      this.buildAndShuffle();
    }
    return this.cards.pop();
  }

  cardsRemaining() {
    return this.cards.length;
  }

  decksRemaining() {
    return this.cards.length / 52;
  }

  needsReshuffle() {
    const dealt = this.totalCards - this.cards.length;
    return dealt >= this.totalCards * this.penetration;
  }
}

// Default game config
export const defaultConfig = {
  numDecks: 6,
  startingBankroll: 1000,
  minBet: 10,
  blackjackPayout: 1.5,
  dealerHitsSoft17: false,
  doubleAfterSplit: true,
  splitAcesOneCardOnly: true,
  maxSplits: 3,
  insurancePays: 2.0,
  penetration: 0.75
};

// Dealer should hit logic
export function dealerShouldHit(cards, config) {
  const { total, isSoft } = calculateHandTotal(cards);
  
  if (total < 17) return true;
  if (total === 17 && isSoft && config.dealerHitsSoft17) return true;
  return false;
}

// Compare hands
// isSplitHand: if true, a 2-card 21 is not a natural blackjack (pays 1:1, not 3:2)
export function compareHands(playerCards, dealerCards, isSplitHand = false) {
  const playerResult = calculateHandTotal(playerCards);
  const dealerResult = calculateHandTotal(dealerCards);

  const playerBJ = !isSplitHand && isBlackjack(playerCards);
  const dealerBJ = isBlackjack(dealerCards);

  if (isBust(playerCards)) return Outcome.BUST;
  if (playerBJ && dealerBJ) return Outcome.PUSH;
  if (playerBJ) return Outcome.BLACKJACK;
  if (dealerBJ) return Outcome.LOSE;
  if (isBust(dealerCards)) return Outcome.WIN;

  if (playerResult.total > dealerResult.total) return Outcome.WIN;
  if (playerResult.total < dealerResult.total) return Outcome.LOSE;
  return Outcome.PUSH;
}

// Calculate payout
export function calculatePayout(outcome, bet, config) {
  switch (outcome) {
    case Outcome.BLACKJACK:
      return Math.floor(bet * config.blackjackPayout);
    case Outcome.WIN:
      return bet;
    case Outcome.LOSE:
    case Outcome.BUST:
      return -bet;
    case Outcome.PUSH:
    default:
      return 0;
  }
}
