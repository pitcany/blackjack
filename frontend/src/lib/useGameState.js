// Game state management with React hooks
import { useState, useCallback, useRef, useEffect } from 'react';
import {
  Shoe,
  GamePhase,
  Outcome,
  calculateHandTotal,
  isBlackjack,
  isBust,
  canSplit,
  dealerShouldHit,
  compareHands,
  calculatePayout,
  updateRunningCount,
  defaultConfig,
  Rank,
  trueCount
} from './gameLogic';
import {
  saveGameState,
  loadGameState,
  saveGameStats,
  loadGameStats,
  saveGameConfig,
  loadGameConfig,
  addHandToHistory,
  saveStrategyStats,
  loadStrategyStats
} from './storage';
import { getOptimalAction, evaluateAction } from './basicStrategy';

export function useBlackjackGame(initialConfig = defaultConfig) {
  // Load saved config or use initial
  const savedConfig = loadGameConfig();
  const [config, setConfig] = useState(savedConfig || initialConfig);
  const shoeRef = useRef(new Shoe(config.numDecks, config.penetration));
  
  // Load saved state or use defaults
  const savedState = loadGameState();
  const [gameState, setGameState] = useState({
    bankroll: savedState?.bankroll || config.startingBankroll,
    currentBet: 0,
    playerHands: [],
    dealerCards: [],
    phase: GamePhase.BETTING,
    message: 'Place your bet to begin',
    runningCount: savedState?.runningCount || 0,
    activeHandIndex: 0,
    insuranceBet: 0,
    splitCount: 0,
    lastAction: null,
    lastActionCorrect: null,
    optimalAction: null
  });

  // Load saved stats
  const savedStats = loadGameStats();
  const [stats, setStats] = useState(savedStats || {
    handsPlayed: 0,
    handsWon: 0,
    handsLost: 0,
    blackjacks: 0,
    pushes: 0,
    surrenders: 0,
    totalWagered: 0,
    totalWon: 0
  });

  // Load strategy stats
  const savedStrategyStats = loadStrategyStats();
  const [strategyStats, setStrategyStats] = useState(savedStrategyStats || {
    totalDecisions: 0,
    correctDecisions: 0,
    mistakes: {}
  });

  // Save state and stats when they change
  useEffect(() => {
    saveGameState({ bankroll: gameState.bankroll, runningCount: gameState.runningCount });
  }, [gameState.bankroll, gameState.runningCount]);

  useEffect(() => {
    saveGameStats(stats);
  }, [stats]);

  useEffect(() => {
    saveStrategyStats(strategyStats);
  }, [strategyStats]);

  useEffect(() => {
    saveGameConfig(config);
  }, [config]);

  // Reset game
  const resetGame = useCallback(() => {
    shoeRef.current = new Shoe(config.numDecks, config.penetration);
    setGameState({
      bankroll: config.startingBankroll,
      currentBet: 0,
      playerHands: [],
      dealerCards: [],
      phase: GamePhase.BETTING,
      message: 'Place your bet to begin',
      runningCount: 0,
      activeHandIndex: 0,
      insuranceBet: 0,
      splitCount: 0,
      lastAction: null,
      lastActionCorrect: null,
      optimalAction: null
    });
    setStats({
      handsPlayed: 0,
      handsWon: 0,
      handsLost: 0,
      blackjacks: 0,
      pushes: 0,
      surrenders: 0,
      totalWagered: 0,
      totalWon: 0
    });
    setStrategyStats({
      totalDecisions: 0,
      correctDecisions: 0,
      mistakes: {}
    });
  }, [config]);

  // Start round
  const startRound = useCallback((bet) => {
    if (bet < config.minBet) {
      setGameState(prev => ({ ...prev, message: `Minimum bet is $${config.minBet}` }));
      return false;
    }
    if (bet > gameState.bankroll) {
      setGameState(prev => ({ ...prev, message: 'Insufficient bankroll' }));
      return false;
    }

    const shoe = shoeRef.current;
    if (shoe.needsReshuffle()) {
      shoe.buildAndShuffle();
      setGameState(prev => ({ ...prev, runningCount: 0 }));
    }

    setGameState(prev => ({
      ...prev,
      bankroll: prev.bankroll - bet,
      currentBet: bet,
      playerHands: [{
        id: 0,
        cards: [],
        bet,
        isActive: true,
        isDoubled: false,
        isSplitChild: false,
        resolved: false,
        result: null
      }],
      dealerCards: [],
      phase: GamePhase.DEALING,
      insuranceBet: 0,
      activeHandIndex: 0,
      splitCount: 0,
      message: 'Dealing...'
    }));

    return true;
  }, [config, gameState.bankroll]);

  // Deal initial cards
  const dealInitial = useCallback(() => {
    const shoe = shoeRef.current;
    
    setGameState(prev => {
      const playerCards = [shoe.draw(), shoe.draw()];
      const dealerCards = [shoe.draw(), shoe.draw()];
      
      const newPlayerHands = [{
        ...prev.playerHands[0],
        cards: playerCards
      }];

      const allDealt = [...playerCards, ...dealerCards];
      const newRunningCount = updateRunningCount(prev.runningCount, allDealt);
      
      const playerBJ = isBlackjack(playerCards);
      const dealerShowsAce = dealerCards[0].rank === Rank.ACE;
      const dealerBJ = isBlackjack(dealerCards);

      // Insurance offer
      if (dealerShowsAce) {
        return {
          ...prev,
          playerHands: newPlayerHands,
          dealerCards,
          runningCount: newRunningCount,
          phase: GamePhase.INSURANCE_OFFER,
          message: 'Insurance? Dealer shows Ace'
        };
      }

      // Immediate resolution
      if (playerBJ && dealerBJ) {
        newPlayerHands[0].resolved = true;
        newPlayerHands[0].result = Outcome.PUSH;
        return {
          ...prev,
          playerHands: newPlayerHands,
          dealerCards,
          runningCount: newRunningCount,
          bankroll: prev.bankroll + prev.currentBet,
          phase: GamePhase.ROUND_OVER,
          message: 'Both Blackjack! Push'
        };
      }

      if (playerBJ) {
        const payout = calculatePayout(Outcome.BLACKJACK, prev.currentBet, config);
        newPlayerHands[0].resolved = true;
        newPlayerHands[0].result = Outcome.BLACKJACK;
        return {
          ...prev,
          playerHands: newPlayerHands,
          dealerCards,
          runningCount: newRunningCount,
          bankroll: prev.bankroll + prev.currentBet + payout,
          phase: GamePhase.ROUND_OVER,
          message: 'Blackjack! You win!'
        };
      }

      if (dealerBJ) {
        newPlayerHands[0].resolved = true;
        newPlayerHands[0].result = Outcome.LOSE;
        return {
          ...prev,
          playerHands: newPlayerHands,
          dealerCards,
          runningCount: newRunningCount,
          phase: GamePhase.ROUND_OVER,
          message: 'Dealer has Blackjack!'
        };
      }

      return {
        ...prev,
        playerHands: newPlayerHands,
        dealerCards,
        runningCount: newRunningCount,
        phase: GamePhase.PLAYER_TURN,
        message: 'Your turn'
      };
    });
  }, [config]);

  // Take insurance
  const takeInsurance = useCallback((take) => {
    setGameState(prev => {
      const dealerBJ = isBlackjack(prev.dealerCards);
      const playerBJ = isBlackjack(prev.playerHands[0].cards);
      let newBankroll = prev.bankroll;
      let insuranceBet = 0;
      let message = '';

      if (take) {
        insuranceBet = Math.floor(prev.currentBet / 2);
        if (insuranceBet <= prev.bankroll) {
          newBankroll -= insuranceBet;
        } else {
          insuranceBet = 0;
        }
      }

      if (dealerBJ) {
        if (insuranceBet > 0) {
          const insuranceWin = Math.floor(insuranceBet * config.insurancePays);
          newBankroll += insuranceBet + insuranceWin;
          message = `Dealer Blackjack! Insurance wins $${insuranceWin}`;
        } else {
          message = 'Dealer has Blackjack!';
        }

        const newHands = [...prev.playerHands];
        if (playerBJ) {
          newHands[0] = { ...newHands[0], resolved: true, result: Outcome.PUSH };
          newBankroll += prev.currentBet;
          message += ' Main bet pushes.';
        } else {
          newHands[0] = { ...newHands[0], resolved: true, result: Outcome.LOSE };
        }

        return {
          ...prev,
          playerHands: newHands,
          bankroll: newBankroll,
          insuranceBet: 0,
          phase: GamePhase.ROUND_OVER,
          message
        };
      }

      // No dealer blackjack
      if (insuranceBet > 0) {
        message = `No dealer Blackjack. Insurance lost ($${insuranceBet})`;
      } else {
        message = 'No dealer Blackjack';
      }

      if (playerBJ) {
        const payout = calculatePayout(Outcome.BLACKJACK, prev.currentBet, config);
        const newHands = [...prev.playerHands];
        newHands[0] = { ...newHands[0], resolved: true, result: Outcome.BLACKJACK };
        return {
          ...prev,
          playerHands: newHands,
          bankroll: newBankroll + prev.currentBet + payout,
          insuranceBet: 0,
          phase: GamePhase.ROUND_OVER,
          message: 'Blackjack! You win!'
        };
      }

      return {
        ...prev,
        bankroll: newBankroll,
        insuranceBet: 0,
        phase: GamePhase.PLAYER_TURN,
        message: message + '. Your turn.'
      };
    });
  }, [config]);

  // Get available actions
  const getAvailableActions = useCallback(() => {
    if (gameState.phase !== GamePhase.PLAYER_TURN) return [];
    
    const hand = gameState.playerHands[gameState.activeHandIndex];
    if (!hand || hand.resolved) return [];

    const actions = ['hit', 'stand'];
    
    if (hand.cards.length === 2) {
      const canDouble = hand.bet <= gameState.bankroll &&
        (!hand.isSplitChild || config.doubleAfterSplit);
      if (canDouble) actions.push('double');
      
      if (canSplit(hand.cards) && 
          gameState.splitCount < config.maxSplits &&
          hand.bet <= gameState.bankroll) {
        actions.push('split');
      }
      
      // Surrender only on initial 2 cards, not after split
      if (config.allowSurrender && !hand.isSplitChild) {
        actions.push('surrender');
      }
    }

    return actions;
  }, [gameState, config]);

  // Get optimal action hint
  const getHint = useCallback(() => {
    if (gameState.phase !== GamePhase.PLAYER_TURN) return null;
    
    const hand = gameState.playerHands[gameState.activeHandIndex];
    if (!hand || hand.resolved || !gameState.dealerCards.length) return null;

    const decksLeft = shoeRef.current.decksRemaining();
    const tc = trueCount(gameState.runningCount, decksLeft);
    
    return getOptimalAction(hand.cards, gameState.dealerCards[0], {
      canDouble: hand.cards.length === 2 && hand.bet <= gameState.bankroll,
      canSplit: canSplit(hand.cards) && gameState.splitCount < config.maxSplits,
      canSurrender: config.allowSurrender && hand.cards.length === 2 && !hand.isSplitChild,
      trueCount: tc,
      showDeviations: true
    });
  }, [gameState, config]);

  // Track action for strategy stats
  const trackAction = useCallback((action) => {
    const hand = gameState.playerHands[gameState.activeHandIndex];
    if (!hand || !gameState.dealerCards.length) return;

    const decksLeft = shoeRef.current.decksRemaining();
    const tc = trueCount(gameState.runningCount, decksLeft);
    
    const evaluation = evaluateAction(action, hand.cards, gameState.dealerCards[0], {
      canDouble: hand.cards.length === 2,
      canSplit: canSplit(hand.cards),
      canSurrender: config.allowSurrender && !hand.isSplitChild,
      trueCount: tc
    });

    setGameState(prev => ({
      ...prev,
      lastAction: action,
      lastActionCorrect: evaluation.isCorrect,
      optimalAction: evaluation.optimalAction
    }));

    setStrategyStats(prev => {
      const newStats = {
        ...prev,
        totalDecisions: prev.totalDecisions + 1,
        correctDecisions: prev.correctDecisions + (evaluation.isCorrect ? 1 : 0)
      };

      if (!evaluation.isCorrect) {
        const total = calculateHandTotal(hand.cards).total;
        const dealerVal = gameState.dealerCards[0].rank?.symbol || gameState.dealerCards[0].symbol;
        const mistakeKey = `${total}_vs_${dealerVal}`;
        newStats.mistakes = {
          ...prev.mistakes,
          [mistakeKey]: {
            count: (prev.mistakes[mistakeKey]?.count || 0) + 1,
            correct: evaluation.optimalAction,
            wrong: action
          }
        };
      }

      return newStats;
    });

    return evaluation;
  }, [gameState, config]);
        actions.push('split');
      }
    }

    return actions;
  }, [gameState, config]);

  // Hit action
  const hit = useCallback(() => {
    if (gameState.phase !== GamePhase.PLAYER_TURN) return;
    
    // Track the action
    trackAction('HIT');
    
    const shoe = shoeRef.current;
    const card = shoe.draw();

    setGameState(prev => {
      const newHands = [...prev.playerHands];
      const handIndex = prev.activeHandIndex;
      const hand = { ...newHands[handIndex] };
      
      hand.cards = [...hand.cards, card];
      newHands[handIndex] = hand;

      const newRunningCount = updateRunningCount(prev.runningCount, [card]);
      
      if (isBust(hand.cards)) {
        hand.resolved = true;
        hand.result = Outcome.BUST;
        newHands[handIndex] = hand;
        
        // Check for next hand or dealer turn
        const nextHandIndex = findNextActiveHand(newHands, handIndex);
        if (nextHandIndex === -1) {
          return runDealerTurn(prev, newHands, newRunningCount);
        }
        
        newHands[nextHandIndex] = { ...newHands[nextHandIndex], isActive: true };
        return {
          ...prev,
          playerHands: newHands,
          runningCount: newRunningCount,
          activeHandIndex: nextHandIndex,
          message: `Hand ${handIndex + 1} busts! Playing hand ${nextHandIndex + 1}`,
          lastAction: null,
          lastActionCorrect: null
        };
      }

      const { total, isSoft } = calculateHandTotal(hand.cards);
      return {
        ...prev,
        playerHands: newHands,
        runningCount: newRunningCount,
        message: `You have ${total}${isSoft ? ' (soft)' : ''}`
      };
    });
  }, [gameState.phase, trackAction]);

  // Stand action
  const stand = useCallback(() => {
    if (gameState.phase !== GamePhase.PLAYER_TURN) return;
    
    // Track the action
    trackAction('STAND');

    setGameState(prev => {
      const newHands = [...prev.playerHands];
      const handIndex = prev.activeHandIndex;
      newHands[handIndex] = { ...newHands[handIndex], isActive: false };

      const nextHandIndex = findNextActiveHand(newHands, handIndex);
      if (nextHandIndex === -1) {
        return runDealerTurn(prev, newHands, prev.runningCount);
      }

      newHands[nextHandIndex] = { ...newHands[nextHandIndex], isActive: true };
      return {
        ...prev,
        playerHands: newHands,
        activeHandIndex: nextHandIndex,
        message: `Playing hand ${nextHandIndex + 1}`,
        lastAction: null,
        lastActionCorrect: null
      };
    });
  }, [gameState.phase, trackAction]);

  // Double action
  const double = useCallback(() => {
    if (gameState.phase !== GamePhase.PLAYER_TURN) return;
    
    // Track the action
    trackAction('DOUBLE');
    
    const shoe = shoeRef.current;
    const card = shoe.draw();

    setGameState(prev => {
      const hand = prev.playerHands[prev.activeHandIndex];
      if (hand.bet > prev.bankroll) {
        return { ...prev, message: 'Insufficient bankroll to double' };
      }

      const newHands = [...prev.playerHands];
      const newHand = {
        ...hand,
        cards: [...hand.cards, card],
        bet: hand.bet * 2,
        isDoubled: true,
        isActive: false
      };

      const newRunningCount = updateRunningCount(prev.runningCount, [card]);
      const newBankroll = prev.bankroll - hand.bet;

      if (isBust(newHand.cards)) {
        newHand.resolved = true;
        newHand.result = Outcome.BUST;
      }

      newHands[prev.activeHandIndex] = newHand;

      const nextHandIndex = findNextActiveHand(newHands, prev.activeHandIndex);
      if (nextHandIndex === -1) {
        return runDealerTurn({ ...prev, bankroll: newBankroll }, newHands, newRunningCount);
      }

      newHands[nextHandIndex] = { ...newHands[nextHandIndex], isActive: true };
      const { total } = calculateHandTotal(newHand.cards);
      return {
        ...prev,
        playerHands: newHands,
        bankroll: newBankroll,
        runningCount: newRunningCount,
        activeHandIndex: nextHandIndex,
        message: `Doubled! ${isBust(newHand.cards) ? 'Bust!' : `Got ${total}`}`
      };
    });
  }, [gameState.phase, trackAction]);

  // Split action
  const split = useCallback(() => {
    if (gameState.phase !== GamePhase.PLAYER_TURN) return;
    
    // Track the action
    trackAction('SPLIT');
    
    const shoe = shoeRef.current;

    setGameState(prev => {
      const hand = prev.playerHands[prev.activeHandIndex];
      if (hand.bet > prev.bankroll) {
        return { ...prev, message: 'Insufficient bankroll to split' };
      }

      const card1 = shoe.draw();
      const card2 = shoe.draw();
      const newRunningCount = updateRunningCount(prev.runningCount, [card1, card2]);

      const firstHand = {
        ...hand,
        cards: [hand.cards[0], card1],
        isSplitChild: true
      };

      const secondHand = {
        id: prev.playerHands.length,
        cards: [hand.cards[1], card2],
        bet: hand.bet,
        isActive: false,
        isDoubled: false,
        isSplitChild: true,
        resolved: false,
        result: null
      };

      const newHands = [...prev.playerHands];
      newHands[prev.activeHandIndex] = firstHand;
      newHands.splice(prev.activeHandIndex + 1, 0, secondHand);

      // Check for split aces rule
      const isSplitAces = hand.cards[0].rank === Rank.ACE;
      if (isSplitAces && config.splitAcesOneCardOnly) {
        firstHand.isActive = false;
        secondHand.isActive = false;
        return runDealerTurn(
          { ...prev, bankroll: prev.bankroll - hand.bet, splitCount: prev.splitCount + 1 },
          newHands,
          newRunningCount
        );
      }

      return {
        ...prev,
        playerHands: newHands,
        bankroll: prev.bankroll - hand.bet,
        runningCount: newRunningCount,
        splitCount: prev.splitCount + 1,
        message: 'Split! Playing first hand',
        lastAction: null,
        lastActionCorrect: null
      };
    });
  }, [gameState.phase, config, trackAction]);

  // Surrender action
  const surrender = useCallback(() => {
    if (gameState.phase !== GamePhase.PLAYER_TURN) return;
    if (!config.allowSurrender) return;
    
    // Track the action
    trackAction('SURRENDER');

    setGameState(prev => {
      const hand = prev.playerHands[prev.activeHandIndex];
      
      // Surrender only allowed on initial 2 cards, not after split
      if (hand.cards.length !== 2 || hand.isSplitChild) {
        return { ...prev, message: 'Cannot surrender this hand' };
      }

      const newHands = [...prev.playerHands];
      newHands[prev.activeHandIndex] = {
        ...hand,
        resolved: true,
        result: Outcome.SURRENDER,
        isActive: false
      };

      // Return half the bet
      const halfBet = Math.floor(hand.bet / 2);
      const newBankroll = prev.bankroll + halfBet;

      // Check for next hand or finish
      const nextHandIndex = findNextActiveHand(newHands, prev.activeHandIndex);
      if (nextHandIndex === -1) {
        // Update stats for surrender
        setStats(s => ({
          ...s,
          handsPlayed: s.handsPlayed + 1,
          surrenders: (s.surrenders || 0) + 1
        }));

        return {
          ...prev,
          playerHands: newHands,
          bankroll: newBankroll,
          phase: GamePhase.ROUND_OVER,
          message: `Surrendered. Half bet ($${halfBet}) returned.`,
          lastAction: null,
          lastActionCorrect: null
        };
      }

      newHands[nextHandIndex] = { ...newHands[nextHandIndex], isActive: true };
      return {
        ...prev,
        playerHands: newHands,
        bankroll: newBankroll,
        activeHandIndex: nextHandIndex,
        message: `Surrendered hand ${prev.activeHandIndex + 1}. Playing hand ${nextHandIndex + 1}`,
        lastAction: null,
        lastActionCorrect: null
      };
    });
  }, [gameState.phase, config, trackAction]);

  // Helper: Find next active hand
  const findNextActiveHand = (hands, currentIndex) => {
    for (let i = currentIndex + 1; i < hands.length; i++) {
      if (!hands[i].resolved && !isBust(hands[i].cards)) {
        return i;
      }
    }
    return -1;
  };

  // Helper: Run dealer turn
  const runDealerTurn = (prevState, hands, runningCount) => {
    const shoe = shoeRef.current;
    let dealerCards = [...prevState.dealerCards];
    let newRunningCount = runningCount;

    // Check if all player hands busted
    const allBusted = hands.every(h => h.resolved && h.result === Outcome.BUST);
    
    if (!allBusted) {
      while (dealerShouldHit(dealerCards, config)) {
        const card = shoe.draw();
        dealerCards.push(card);
        newRunningCount = updateRunningCount(newRunningCount, [card]);
      }
    }

    // Resolve all hands
    let newBankroll = prevState.bankroll;
    const resolvedHands = hands.map(hand => {
      if (hand.resolved) return hand;
      
      const outcome = compareHands(hand.cards, dealerCards);
      const payout = calculatePayout(outcome, hand.bet, config);
      
      if (outcome === Outcome.WIN || outcome === Outcome.BLACKJACK || outcome === Outcome.PUSH) {
        newBankroll += hand.bet + payout;
      }

      return { ...hand, resolved: true, result: outcome };
    });

    // Update stats
    const outcomes = resolvedHands.map(h => h.result);
    const wins = outcomes.filter(o => o === Outcome.WIN || o === Outcome.BLACKJACK).length;
    const losses = outcomes.filter(o => o === Outcome.LOSE || o === Outcome.BUST).length;
    const bjs = outcomes.filter(o => o === Outcome.BLACKJACK).length;
    const pushes = outcomes.filter(o => o === Outcome.PUSH).length;

    setStats(prev => ({
      handsPlayed: prev.handsPlayed + resolvedHands.length,
      handsWon: prev.handsWon + wins,
      handsLost: prev.handsLost + losses,
      blackjacks: prev.blackjacks + bjs,
      pushes: prev.pushes + pushes
    }));

    const dealerTotal = calculateHandTotal(dealerCards).total;
    const dealerBust = isBust(dealerCards);
    const resultSummary = resolvedHands.length > 1
      ? resolvedHands.map((h, i) => `Hand ${i+1}: ${h.result}`).join(', ')
      : resolvedHands[0]?.result || '';

    return {
      ...prevState,
      playerHands: resolvedHands,
      dealerCards,
      bankroll: newBankroll,
      runningCount: newRunningCount,
      phase: GamePhase.ROUND_OVER,
      message: `Dealer: ${dealerTotal}${dealerBust ? ' (Bust!)' : ''}. ${resultSummary}`
    };
  };

  // Next round
  const nextRound = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      playerHands: [],
      dealerCards: [],
      currentBet: 0,
      insuranceBet: 0,
      activeHandIndex: 0,
      splitCount: 0,
      phase: GamePhase.BETTING,
      message: 'Place your bet'
    }));
  }, []);

  // Update config
  const updateConfig = useCallback((newConfig) => {
    setConfig(newConfig);
    shoeRef.current = new Shoe(newConfig.numDecks, newConfig.penetration);
    setGameState(prev => ({
      ...prev,
      bankroll: newConfig.startingBankroll,
      runningCount: 0,
      phase: GamePhase.BETTING,
      message: 'Settings updated. Place your bet.'
    }));
  }, []);

  return {
    gameState,
    stats,
    config,
    actions: {
      startRound,
      dealInitial,
      takeInsurance,
      hit,
      stand,
      double,
      split,
      nextRound,
      resetGame,
      updateConfig
    },
    getAvailableActions,
    decksRemaining: shoeRef.current.decksRemaining()
  };
}

// Counting trainer hook
export function useCountingTrainer() {
  const [config, setConfig] = useState({
    numDecks: 6,
    drillType: 'single_card',
    cardsPerRound: 1,
    askTrueCount: false
  });

  const shoeRef = useRef(null);
  
  const [state, setState] = useState({
    isRunning: false,
    currentCards: [],
    runningCount: 0,
    expectedRC: 0,
    feedback: null,
    showingCards: false
  });

  const [stats, setStats] = useState({
    attempts: 0,
    correctRC: 0,
    correctTC: 0,
    streak: 0,
    bestStreak: 0
  });

  const start = useCallback((newConfig) => {
    setConfig(newConfig);
    shoeRef.current = new Shoe(newConfig.numDecks, 0.9);
    setState({
      isRunning: true,
      currentCards: [],
      runningCount: 0,
      expectedRC: 0,
      feedback: null,
      showingCards: false
    });
    setStats({
      attempts: 0,
      correctRC: 0,
      correctTC: 0,
      streak: 0,
      bestStreak: 0
    });
  }, []);

  const dealRound = useCallback(() => {
    setState(prev => {
      if (!prev.isRunning || !shoeRef.current) return prev;

      const shoe = shoeRef.current;
      let currentRC = prev.runningCount;
      
      if (shoe.needsReshuffle()) {
        shoe.buildAndShuffle();
        currentRC = 0;
      }

      let numCards;
      switch (config.drillType) {
        case 'hand': numCards = 2; break;
        case 'round': numCards = 4; break;
        default: numCards = config.cardsPerRound;
      }

      const cards = [];
      for (let i = 0; i < numCards && shoe.cardsRemaining() > 0; i++) {
        cards.push(shoe.draw());
      }

      const expectedRC = updateRunningCount(currentRC, cards);

      return {
        ...prev,
        currentCards: cards,
        expectedRC,
        runningCount: currentRC,
        feedback: null,
        showingCards: true
      };
    });
  }, [config]);

  const submitGuess = useCallback((rcGuess, tcGuess = null) => {
    const isCorrectRC = rcGuess === state.expectedRC;
    const decksRemaining = shoeRef.current?.decksRemaining() || 1;
    const expectedTC = Math.round((state.expectedRC / decksRemaining) * 10) / 10;
    const isCorrectTC = tcGuess !== null ? Math.abs(tcGuess - expectedTC) <= 0.5 : null;

    const feedback = {
      isCorrectRC,
      expectedRC: state.expectedRC,
      userRC: rcGuess,
      isCorrectTC,
      expectedTC,
      userTC: tcGuess,
      decksRemaining: Math.round(decksRemaining * 100) / 100,
      cardValues: state.currentCards.map(c => ({
        card: c.toString(),
        value: c.rank.symbol >= '2' && c.rank.symbol <= '6' ? '+1' :
               c.rank.symbol >= '7' && c.rank.symbol <= '9' ? '0' : '-1'
      }))
    };

    setState(prev => ({
      ...prev,
      runningCount: state.expectedRC,
      feedback,
      showingCards: false
    }));

    setStats(prev => {
      const newStreak = isCorrectRC ? prev.streak + 1 : 0;
      return {
        attempts: prev.attempts + 1,
        correctRC: prev.correctRC + (isCorrectRC ? 1 : 0),
        correctTC: prev.correctTC + (isCorrectTC ? 1 : 0),
        streak: newStreak,
        bestStreak: Math.max(prev.bestStreak, newStreak)
      };
    });

    return feedback;
  }, [state.expectedRC, state.currentCards]);

  const stop = useCallback(() => {
    setState(prev => ({ ...prev, isRunning: false }));
    return stats;
  }, [stats]);

  return {
    config,
    state,
    stats,
    actions: { start, dealRound, submitGuess, stop },
    decksRemaining: shoeRef.current?.decksRemaining() || 0
  };
}
