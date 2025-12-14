// Engine Logic Ported from Python

export const Suit = {
    HEARTS: 'H',
    DIAMONDS: 'D',
    CLUBS: 'C',
    SPADES: 'S'
};

export const Rank = {
    TWO: '2', THREE: '3', FOUR: '4', FIVE: '5', SIX: '6', SEVEN: '7',
    EIGHT: '8', NINE: '9', TEN: '10', JACK: 'J', QUEEN: 'Q', KING: 'K', ACE: 'A'
};

export const Action = {
    HIT: 'Hit',
    STAND: 'Stand',
    DOUBLE: 'Double',
    SPLIT: 'Split',
    SURRENDER: 'Surrender',
    INSURANCE: 'Insurance'
};

export class Card {
    constructor(rank, suit) {
        this.rank = rank;
        this.suit = suit;
        this.isFaceUp = true;
    }

    get value() {
        if (['J', 'Q', 'K'].includes(this.rank)) return 10;
        if (this.rank === 'A') return 11;
        return parseInt(this.rank);
    }
    
    get hiLoValue() {
        const v = this.value;
        if (v >= 2 && v <= 6) return 1;
        if (v >= 7 && v <= 9) return 0;
        return -1;
    }
    
    toString() {
        return `${this.rank}${this.suit}`;
    }
}

export class Shoe {
    constructor(numDecks = 6, penetration = 0.75) {
        this.numDecks = numDecks;
        this.penetration = penetration;
        this.cards = [];
        this.reshuffle();
    }

    reshuffle() {
        this.cards = [];
        const suits = Object.values(Suit);
        const ranks = Object.values(Rank);
        for (let i = 0; i < this.numDecks; i++) {
            for (const s of suits) {
                for (const r of ranks) {
                    this.cards.push(new Card(r, s));
                }
            }
        }
        // Shuffle
        for (let i = this.cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
        }
    }

    dealCard() {
        if (this.cards.length === 0) throw new Error("Empty shoe");
        return this.cards.shift();
    }
    
    get decksRemaining() {
        return Math.max(0.5, Math.round(this.cards.length / 52 * 2) / 2);
    }
    
    get needsShuffle() {
         const limit = Math.floor(this.numDecks * 52 * (1 - this.penetration));
         // Logic: if cards remaining < limit. 
         // Example 6 decks (312), pen 0.75 (play 234, leave 78).
         return this.cards.length <= limit;
    }
}

export class Hand {
    constructor() {
        this.cards = [];
        this.bet = 0;
        this.isDone = false;
        this.status = 'playing'; // playing, busted, stood, blackjack, surrendered
    }

    addCard(card) {
        this.cards.push(card);
    }

    get value() {
        let total = this.cards.reduce((acc, c) => acc + c.value, 0);
        let aces = this.cards.filter(c => c.rank === 'A').length;
        while (total > 21 && aces > 0) {
            total -= 10;
            aces -= 1;
        }
        return total;
    }

    get isSoft() {
        const hardTotal = this.cards.reduce((acc, c) => acc + (c.rank === 'A' ? 1 : c.value), 0);
        return this.value > hardTotal; // If value > hardTotal, we are using an ace as 11
    }
    
    get isBlackjack() {
        return this.cards.length === 2 && this.value === 21;
    }
    
    get isPair() {
        return this.cards.length === 2 && this.cards[0].value === this.cards[1].value;
    }
}

export class GameEngine {
    constructor(rules = {}) {
        this.rules = { decks: 6, s17: true, das: true, ...rules };
        this.shoe = new Shoe(this.rules.decks, 0.75);
        this.runningCount = 0;
        this.dealerHand = new Hand();
        this.playerHands = []; // Array of Hand objects
        this.currentHandIndex = 0;
        this.phase = 'betting'; // betting, dealing, player_turn, dealer_turn, payout
        this.message = '';
        this.bankroll = 10000;
        this.dealerHoleCard = null;
    }
    
    getState() {
        return {
            phase: this.phase,
            dealerHand: this.dealerHand,
            playerHands: this.playerHands,
            currentHandIndex: this.currentHandIndex,
            runningCount: this.runningCount,
            trueCount: this.getTrueCount(),
            decksRemaining: this.shoe.decksRemaining,
            message: this.message,
            bankroll: this.bankroll,
            recommendation: this.getRecommendation(),
            dealerHoleCard: this.dealerHoleCard // For debug/display if phase ended
        };
    }
    
    getTrueCount() {
        return this.runningCount / this.shoe.decksRemaining;
    }
    
    deal(bet) {
        if (this.shoe.needsShuffle) {
            this.shoe.reshuffle();
            this.runningCount = 0;
            this.message = 'Shoe reshuffled.';
        }
        
        if (bet > this.bankroll) {
            this.message = 'Insufficient funds';
            return;
        }
        
        this.bankroll -= bet;
        this.playerHands = [new Hand()];
        this.playerHands[0].bet = bet;
        this.dealerHand = new Hand();
        this.currentHandIndex = 0;
        
        // Deal initial cards
        this.playerHands[0].addCard(this.shoe.dealCard());
        this.updateCount(this.playerHands[0].cards[0]);
        
        this.dealerHand.addCard(this.shoe.dealCard()); // Upcard
        this.updateCount(this.dealerHand.cards[0]);
        
        this.playerHands[0].addCard(this.shoe.dealCard());
        this.updateCount(this.playerHands[0].cards[1]);
        
        const holeCard = this.shoe.dealCard();
        this.dealerHoleCard = holeCard; // Hidden
        // Do not update count for hole card yet!
        
        this.phase = 'player_turn';
        
        // Check dealer BJ (if we implemented peek)
        // Check player BJ
        if (this.playerHands[0].isBlackjack) {
             // Handle instant payout or wait for dealer
             this.resolveRound();
        }
    }
    
    updateCount(card) {
        this.runningCount += card.hiLoValue;
    }
    
    handleAction(action) {
        const hand = this.playerHands[this.currentHandIndex];
        
        if (action === Action.HIT) {
            const card = this.shoe.dealCard();
            hand.addCard(card);
            this.updateCount(card);
            if (hand.value > 21) {
                hand.status = 'busted';
                this.nextHand();
            }
        } else if (action === Action.STAND) {
            hand.status = 'stood';
            this.nextHand();
        } else if (action === Action.DOUBLE) {
            if (this.bankroll < hand.bet) {
                this.message = 'Not enough chips to double';
                return;
            }
            this.bankroll -= hand.bet;
            hand.bet *= 2;
            const card = this.shoe.dealCard();
            hand.addCard(card);
            this.updateCount(card);
            hand.status = hand.value > 21 ? 'busted' : 'stood'; // Force stand after double
            this.nextHand();
        }
        // Split/Insurance omitted for brevity in batch 1, can add in fix
    }
    
    nextHand() {
        if (this.currentHandIndex < this.playerHands.length - 1) {
            this.currentHandIndex++;
        } else {
            this.phase = 'dealer_turn';
            this.playDealer();
        }
    }
    
    playDealer() {
        // Reveal hole card
        this.dealerHand.addCard(this.dealerHoleCard);
        this.updateCount(this.dealerHoleCard);
        
        while (this.dealerHand.value < 17) {
            const card = this.shoe.dealCard();
            this.dealerHand.addCard(card);
            this.updateCount(card);
        }
        
        this.resolveRound();
    }
    
    resolveRound() {
        this.phase = 'payout';
        const dVal = this.dealerHand.value;
        let msg = '';
        
        this.playerHands.forEach(hand => {
             if (hand.status === 'busted') {
                 msg += 'Busted. ';
             } else if (hand.isBlackjack && (this.dealerHand.isBlackjack)) {
                 this.bankroll += hand.bet; // Push
                 msg += 'Push (BJ). ';
             } else if (hand.isBlackjack) {
                 this.bankroll += hand.bet * 2.5; // 3:2
                 msg += 'Blackjack! ';
             } else if (dVal > 21) {
                 this.bankroll += hand.bet * 2;
                 msg += 'Dealer busts. You win! ';
             } else if (hand.value > dVal) {
                 this.bankroll += hand.bet * 2;
                 msg += 'You win! ';
             } else if (hand.value === dVal) {
                 this.bankroll += hand.bet;
                 msg += 'Push. ';
             } else {
                 msg += 'Dealer wins. ';
             }
        });
        this.message = msg;
    }
    
    getRecommendation() {
        // Basic strategy placeholder
        const tc = this.getTrueCount();
        const hand = this.playerHands[this.currentHandIndex];
        if (!hand || this.phase !== 'player_turn') return { action: '', reason: '' };
        
        // Simple heuristic for now - Expand later
        const pVal = hand.value;
        const dVal = this.dealerHand.cards[0].value;
        
        if (pVal >= 17) return { action: Action.STAND, reason: 'Always stand on hard 17+' };
        if (pVal <= 11) return { action: Action.HIT, reason: 'Always hit hard 11 or less (except double)' };
        if (dVal >= 7 && pVal < 17) return { action: Action.HIT, reason: 'Hit against high dealer card' };
        
        return { action: Action.STAND, reason: 'Stand against low dealer card' };
    }
}
