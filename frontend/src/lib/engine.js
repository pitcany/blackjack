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
         return this.cards.length <= limit;
    }

    stack(cards) {
        // Prepend cards to the top of the shoe (next to be dealt)
        // cards: array of Card objects
        this.cards.unshift(...cards);
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
        return this.value > hardTotal;
    }
    
    get isBlackjack() {
        return this.cards.length === 2 && this.value === 21;
    }
    
    get isPair() {
        return this.cards.length === 2 && this.cards[0].value === this.cards[1].value;
    }
}

// Strategy Table Helper
const createMap = (range, action) => {
    const map = {};
    for (let i = range[0]; i <= range[1]; i++) map[i] = action;
    return map;
};

const BASIC_STRATEGY = {
    hard: {
        4: createMap([2,11], Action.HIT),
        5: createMap([2,11], Action.HIT),
        6: createMap([2,11], Action.HIT),
        7: createMap([2,11], Action.HIT),
        8: createMap([2,11], Action.HIT),
        9: { 2: Action.HIT, ...createMap([3,6], Action.DOUBLE), ...createMap([7,11], Action.HIT) },
        10: { ...createMap([2,9], Action.DOUBLE), ...createMap([10,11], Action.HIT) },
        11: createMap([2,11], Action.DOUBLE),
        12: { ...createMap([2,3], Action.HIT), ...createMap([4,6], Action.STAND), ...createMap([7,11], Action.HIT) },
        13: { ...createMap([2,6], Action.STAND), ...createMap([7,11], Action.HIT) },
        14: { ...createMap([2,6], Action.STAND), ...createMap([7,11], Action.HIT) },
        15: { ...createMap([2,6], Action.STAND), ...createMap([7,11], Action.HIT) },
        16: { ...createMap([2,6], Action.STAND), ...createMap([7,11], Action.HIT) },
        17: createMap([2,11], Action.STAND),
        18: createMap([2,11], Action.STAND),
        19: createMap([2,11], Action.STAND),
        20: createMap([2,11], Action.STAND),
        21: createMap([2,11], Action.STAND),
    },
    soft: {
        13: { ...createMap([5,6], Action.DOUBLE), ...createMap([2,4], Action.HIT), ...createMap([7,11], Action.HIT) },
        14: { ...createMap([5,6], Action.DOUBLE), ...createMap([2,4], Action.HIT), ...createMap([7,11], Action.HIT) },
        15: { ...createMap([4,6], Action.DOUBLE), ...createMap([2,3], Action.HIT), ...createMap([7,11], Action.HIT) },
        16: { ...createMap([4,6], Action.DOUBLE), ...createMap([2,3], Action.HIT), ...createMap([7,11], Action.HIT) },
        17: { ...createMap([3,6], Action.DOUBLE), ...createMap([2,2], Action.HIT), ...createMap([7,11], Action.HIT) },
        18: { ...createMap([2,2], Action.STAND), ...createMap([7,8], Action.STAND), ...createMap([3,6], Action.DOUBLE), ...createMap([9,11], Action.HIT) },
        19: { 6: Action.DOUBLE, ...createMap([2,5], Action.STAND), ...createMap([7,11], Action.STAND) },
        20: createMap([2,11], Action.STAND),
    },
    pairs: {
        2: { ...createMap([2,7], Action.SPLIT), ...createMap([8,11], Action.HIT) },
        3: { ...createMap([2,7], Action.SPLIT), ...createMap([8,11], Action.HIT) },
        4: { 5: Action.SPLIT, 6: Action.SPLIT, ...createMap([2,4], Action.HIT), ...createMap([7,11], Action.HIT) },
        5: { ...createMap([2,9], Action.DOUBLE), ...createMap([10,11], Action.HIT) },
        6: { ...createMap([2,6], Action.SPLIT), ...createMap([7,11], Action.HIT) },
        7: { ...createMap([2,7], Action.SPLIT), ...createMap([8,11], Action.HIT) },
        8: createMap([2,11], Action.SPLIT),
        9: { ...createMap([2,6], Action.SPLIT), ...createMap([8,9], Action.SPLIT), 7: Action.STAND, 10: Action.STAND, 11: Action.STAND },
        10: createMap([2,11], Action.STAND),
        11: createMap([2,11], Action.SPLIT),
    }
};

export class GameEngine {
    constructor(rules = {}) {
        this.rules = { decks: 6, s17: true, das: true, ...rules };
        this.shoe = new Shoe(this.rules.decks, 0.75);
        this.runningCount = 0;
        this.dealerHand = new Hand();
        this.playerHands = [];
        this.currentHandIndex = 0;
        this.phase = 'betting';
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
            dealerHoleCard: this.dealerHoleCard
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
        
        this.playerHands[0].addCard(this.shoe.dealCard());
        this.updateCount(this.playerHands[0].cards[0]);
        
        this.dealerHand.addCard(this.shoe.dealCard());
        this.updateCount(this.dealerHand.cards[0]);
        
        this.playerHands[0].addCard(this.shoe.dealCard());
        this.updateCount(this.playerHands[0].cards[1]);
        
        const holeCard = this.shoe.dealCard();
        this.dealerHoleCard = holeCard;
        
        this.phase = 'player_turn';
        
        if (this.playerHands[0].isBlackjack) {
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
            hand.status = hand.value > 21 ? 'busted' : 'stood';
            this.nextHand();
        } else if (action === Action.SPLIT) {
             // Basic split logic
             if (this.bankroll < hand.bet) {
                 this.message = 'Not enough chips to split';
                 return;
             }
             this.bankroll -= hand.bet;
             const splitCard = hand.cards[0];
             const isSplitAces = splitCard.rank === 'A';
             const card2 = hand.cards.pop();
             const newHand = new Hand();
             newHand.addCard(card2);
             newHand.bet = hand.bet;

             this.playerHands.splice(this.currentHandIndex + 1, 0, newHand);

             // Deal second card to first split hand
             const c1 = this.shoe.dealCard();
             hand.addCard(c1);
             this.updateCount(c1);

             // Deal second card to second split hand
             const c2 = this.shoe.dealCard();
             newHand.addCard(c2);
             this.updateCount(c2);

             // Split aces: only one card per hand, then automatically stand
             if (isSplitAces) {
                 hand.status = 'stood';
                 newHand.status = 'stood';
                 this.message = 'Split Aces: One card only';
                 // Move through all split hands to dealer turn
                 this.currentHandIndex = this.playerHands.length - 1;
                 this.nextHand();
             }
             // Regular split: player plays first hand completely, then moves to second hand
        }
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
                 this.bankroll += hand.bet;
                 msg += 'Push (BJ). ';
             } else if (hand.isBlackjack) {
                 this.bankroll += hand.bet * 2.5;
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
        const hand = this.playerHands[this.currentHandIndex];
        if (!hand || this.phase !== 'player_turn') return { action: '', reason: '' };
        
        const dealerUp = this.dealerHand.cards[0];
        const dealerVal = dealerUp.value === 1 ? 11 : dealerUp.value; // Handle Ace initial logic
        // But Card.value for Ace is 11.
        
        let action = Action.HIT;
        let reason = "Basic Strategy";
        
        // Lookup
        if (hand.isPair) {
            // Note: split logic for pair lookup
            const val = hand.cards[0].value; 
            // Ace pair is 11,11? Yes.
            action = BASIC_STRATEGY.pairs[val] ? BASIC_STRATEGY.pairs[val][dealerVal] : Action.HIT;
        } else if (hand.isSoft) {
            const total = hand.value;
            if (total >= 20) action = Action.STAND;
            else if (total <= 12) action = Action.HIT;
            else action = BASIC_STRATEGY.soft[total] ? BASIC_STRATEGY.soft[total][dealerVal] : Action.HIT;
        } else {
            const total = hand.value;
            if (total >= 21) action = Action.STAND;
            else if (total <= 4) action = Action.HIT;
            else action = BASIC_STRATEGY.hard[total] ? BASIC_STRATEGY.hard[total][dealerVal] : Action.HIT;
        }
        
        // DEVIATIONS
        const tc = this.getTrueCount();
        
        // 16 vs 10 TC >= 0
        if (hand.value === 16 && dealerVal === 10 && !hand.isSoft && !hand.isPair && tc >= 0) {
            action = Action.STAND;
            reason = "Stand on 16 vs 10 (TC >= 0)";
        }
        // 15 vs 10 TC >= 4
        if (hand.value === 15 && dealerVal === 10 && !hand.isSoft && tc >= 4) {
             action = Action.STAND;
             reason = "Stand on 15 vs 10 (TC >= +4)";
        }
        
        // 12 vs 3 TC >= 2
        if (hand.value === 12 && dealerVal === 3 && !hand.isSoft && tc >= 2) {
            action = Action.STAND;
            reason = "Stand on 12 vs 3 (TC >= +2)";
        }
        
        return { action, reason };
    }
    
    get canSplit() {
        const hand = this.playerHands[this.currentHandIndex];
        return this.phase === 'player_turn' && hand && hand.cards.length === 2 && hand.cards[0].value === hand.cards[1].value;
    }

    get canDouble() {
         const hand = this.playerHands[this.currentHandIndex];
         return this.phase === 'player_turn' && hand && hand.cards.length === 2 && this.bankroll >= hand.bet;
    }
    
    setScenario(scenario) {
        // scenario: { playerHands: [[c1, c2]], dealerHand: [c1, c2], runningCount: int, nextCards: [c1, c2...] }
        if (scenario.runningCount !== undefined) this.runningCount = scenario.runningCount;
        
        if (scenario.dealerHand) {
            this.dealerHand = new Hand();
            scenario.dealerHand.forEach(c => this.dealerHand.addCard(c));
            // Assuming first is up, second is hole.
            this.dealerHoleCard = this.dealerHand.cards[1];
            // In a real deal, dealerHoleCard is separate until reveal.
            // But for scenario setting, we might want to just set it.
            // Let's ensure dealerHand only has upcard visible if phase is player_turn.
            if (this.phase === 'player_turn') {
                this.dealerHoleCard = this.dealerHand.cards.pop(); 
            }
        }
        
        if (scenario.playerHands) {
            this.playerHands = scenario.playerHands.map(cards => {
                const h = new Hand();
                cards.forEach(c => h.addCard(c));
                h.bet = 10; // default for scenario
                return h;
            });
            this.currentHandIndex = 0;
        }

        if (scenario.nextCards) {
            this.shoe.stack(scenario.nextCards);
        }
        
        if (scenario.phase) {
            this.phase = scenario.phase;
        }
        
        // Recalc messages or status if needed
        this.message = scenario.message || '';
    }
}
