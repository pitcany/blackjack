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
    
    get canSplit() {
        const hand = this.playerHands[this.currentHandIndex];
        return this.phase === 'player_turn' && hand && hand.cards.length === 2 && hand.cards[0].value === hand.cards[1].value;
    }

    get canDouble() {
         const hand = this.playerHands[this.currentHandIndex];
         return this.phase === 'player_turn' && hand && hand.cards.length === 2 && this.bankroll >= hand.bet;
    }
}
