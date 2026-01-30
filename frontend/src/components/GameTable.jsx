// Blackjack Game Table Component
import React, { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { PlayingCard, HandDisplay } from './PlayingCard';
import { GamePhase, calculateHandTotal, trueCount } from '@/lib/gameLogic';
import { Lightbulb, CheckCircle2, XCircle, Keyboard } from 'lucide-react';

export function GameTable({
  gameState,
  actions,
  getAvailableActions,
  getHint,
  decksRemaining,
  config 
}) {
  const [betAmount, setBetAmount] = useState(config?.minBet || 25);
  const [showHint, setShowHint] = useState(false);
  const [bankrollChange, setBankrollChange] = useState(null);
  const [prevBankroll, setPrevBankroll] = useState(gameState.bankroll);
  
  const { 
    phase, playerHands, dealerCards, bankroll, message, runningCount,
    lastAction, lastActionCorrect, optimalAction
  } = gameState;

  // Calculate penetration percentage
  const totalCards = config.numDecks * 52;
  const cardsDealt = totalCards - (decksRemaining * 52);
  const penetrationPercent = (cardsDealt / totalCards) * 100;
  const penetrationThreshold = config.penetration * 100;

  // Calculate true count
  const tc = decksRemaining > 0 ? trueCount(runningCount, decksRemaining) : 0;

  // Auto-deal after starting round
  useEffect(() => {
    if (phase === GamePhase.DEALING) {
      const timer = setTimeout(() => {
        actions.dealInitial();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [phase, actions]);

  // Track bankroll changes for animation
  useEffect(() => {
    if (bankroll !== prevBankroll) {
      const change = bankroll - prevBankroll;
      setBankrollChange(change);
      setPrevBankroll(bankroll);
      
      // Clear after animation
      const timer = setTimeout(() => setBankrollChange(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [bankroll, prevBankroll]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      // Ignore if typing in input
      if (e.target.tagName === 'INPUT') return;
      
      const key = e.key.toLowerCase();
      const availableActions = getAvailableActions();
      
      if (phase === GamePhase.PLAYER_TURN) {
        if (key === 'h' && availableActions.includes('hit')) {
          actions.hit();
        } else if (key === 's' && availableActions.includes('stand')) {
          actions.stand();
        } else if (key === 'd' && availableActions.includes('double')) {
          actions.double();
        } else if (key === 'p' && availableActions.includes('split')) {
          actions.split();
        } else if (key === 'r' && availableActions.includes('surrender')) {
          actions.surrender();
        }
      } else if (phase === GamePhase.BETTING && key === 'enter') {
        handleDeal();
      } else if (phase === GamePhase.ROUND_OVER && key === 'enter') {
        actions.nextRound();
      } else if (phase === GamePhase.INSURANCE_OFFER) {
        if (key === 'y') actions.takeInsurance(true);
        if (key === 'n') actions.takeInsurance(false);
      }
      
      // Quick bet shortcuts
      if (phase === GamePhase.BETTING) {
        if (key === '1') setBetAmount(10);
        if (key === '2') setBetAmount(25);
        if (key === '3') setBetAmount(50);
        if (key === '4') setBetAmount(100);
        if (key === '5') setBetAmount(250);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [phase, getAvailableActions, actions]);

  const handleDeal = () => {
    if (actions.startRound(betAmount)) {
      setShowHint(false);
    }
  };

  const handleQuickBet = (amount) => {
    setBetAmount(amount);
  };

  const hint = getHint ? getHint() : null;
  const availableActions = getAvailableActions();
  const dealerTotal = calculateHandTotal(dealerCards);
  const showDealerHole = phase === GamePhase.DEALER_TURN || phase === GamePhase.ROUND_OVER;

  // Show hints automatically if enabled
  const shouldShowHint = config.alwaysShowHints || showHint;

  return (
    <div className="flex flex-col min-h-[600px]">
      {/* Table Header - Stats */}
      <div className="flex items-center justify-between px-6 py-3 bg-card/30 rounded-t-2xl border-b border-border/50">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 relative">
            <span className="text-muted-foreground text-sm">Bankroll</span>
            <span className="text-xl font-bold text-primary">${bankroll}</span>
            {/* Bankroll change animation */}
            {bankrollChange !== null && (
              <span 
                className={cn(
                  "absolute -top-4 right-0 text-sm font-bold animate-fade-in",
                  bankrollChange > 0 ? "text-success" : "text-destructive"
                )}
                style={{ animation: 'float 1.5s ease-out forwards, fade-in 0.3s ease-out' }}
              >
                {bankrollChange > 0 ? '+' : ''}{bankrollChange}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground text-sm">Decks</span>
            <span className="text-sm font-medium">{decksRemaining.toFixed(1)}</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="text-primary border-primary/30">
            RC: {runningCount}
          </Badge>
          <Badge variant="outline" className="text-success border-success/30">
            TC: {tc.toFixed(1)}
          </Badge>
          <Badge 
            variant={phase === GamePhase.PLAYER_TURN ? 'default' : 'secondary'}
            className={cn(
              phase === GamePhase.PLAYER_TURN && 'bg-primary text-primary-foreground'
            )}
          >
            {phase.replaceAll('_', ' ')}
          </Badge>
        </div>
      </div>

      {/* Penetration Bar */}
      <div className="px-6 py-2 bg-card/20">
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground w-20">Penetration</span>
          <div className="flex-1 relative">
            <Progress 
              value={penetrationPercent} 
              className={cn(
                "h-2",
                penetrationPercent > penetrationThreshold ? "[&>div]:bg-destructive" :
                penetrationPercent > penetrationThreshold * 0.75 ? "[&>div]:bg-warning" :
                "[&>div]:bg-success"
              )}
            />
            {/* Threshold marker */}
            <div 
              className="absolute top-0 h-2 w-0.5 bg-foreground/50"
              style={{ left: `${penetrationThreshold}%` }}
            />
          </div>
          <span className="text-xs text-muted-foreground w-12 text-right">
            {penetrationPercent.toFixed(0)}%
          </span>
        </div>
      </div>

      {/* Game Area */}
      <div className="flex-1 bg-gradient-table felt-texture rounded-b-2xl p-6 relative">
        {/* Message Banner */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
          <div className="px-6 py-2 bg-card/80 backdrop-blur-sm rounded-full border border-border flex items-center gap-3">
            <p className="text-sm font-medium text-foreground">{message}</p>
            {/* Strategy feedback */}
            {lastAction && lastActionCorrect !== null && (
              <div className={cn(
                "flex items-center gap-1 text-sm",
                lastActionCorrect ? "text-success" : "text-destructive"
              )}>
                {lastActionCorrect ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <>
                    <XCircle className="w-4 h-4" />
                    <span className="text-xs">({optimalAction})</span>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Dealer Area */}
        <div className="flex flex-col items-center mb-8 pt-8">
          <span className="text-primary/80 text-sm font-medium mb-2 tracking-widest uppercase">
            Dealer
          </span>
          {dealerCards.length > 0 ? (
            <HandDisplay
              cards={dealerCards}
              total={dealerTotal.total}
              isSoft={dealerTotal.isSoft}
              isDealer
              hideHoleCard={!showDealerHole}
              result={showDealerHole && dealerTotal.total > 21 ? 'BUST' : null}
            />
          ) : (
            <div className="h-32 flex items-center justify-center text-muted-foreground text-sm">
              Waiting for deal...
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="flex items-center justify-center mb-8">
          <div className="w-24 h-px bg-border/50" />
          <span className="px-4 text-muted-foreground text-xs">VS</span>
          <div className="w-24 h-px bg-border/50" />
        </div>

        {/* Player Area */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          {playerHands.length > 0 ? (
            playerHands.map((hand, index) => {
              const handTotal = calculateHandTotal(hand.cards);
              return (
                <HandDisplay
                  key={hand.id}
                  cards={hand.cards}
                  total={handTotal.total}
                  isSoft={handTotal.isSoft}
                  isActive={hand.isActive && phase === GamePhase.PLAYER_TURN}
                  bet={hand.bet}
                  result={hand.result}
                  label={playerHands.length > 1 ? `Hand ${index + 1}` : 'Your Hand'}
                />
              );
            })
          ) : (
            <div className="h-32 flex items-center justify-center text-muted-foreground text-sm">
              Place your bet to start
            </div>
          )}
        </div>

        {/* Hint Display */}
        {shouldShowHint && hint && phase === GamePhase.PLAYER_TURN && (
          <div className={cn(
            "mx-auto max-w-md mb-4 p-3 rounded-lg animate-fade-in",
            hint.isDeviation 
              ? "bg-warning/20 border border-warning/30"
              : "bg-primary/20 border border-primary/30"
          )}>
            <div className="flex items-center gap-2">
              <Lightbulb className={cn(
                "w-5 h-5",
                hint.isDeviation ? "text-warning" : "text-primary"
              )} />
              <span className="font-medium">
                Optimal: <span className={hint.isDeviation ? "text-warning" : "text-primary"}>
                  {hint.action}
                </span>
              </span>
              {hint.isDeviation && (
                <Badge variant="outline" className="text-warning border-warning/30 text-xs">
                  Deviation
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-1">{hint.reason}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-center gap-3 mb-6 flex-wrap">
          {phase === GamePhase.PLAYER_TURN && (
            <>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={actions.hit}
                      disabled={!availableActions.includes('hit')}
                      className="bg-success hover:bg-success/80 text-success-foreground min-w-20"
                    >
                      Hit <span className="ml-1 text-xs opacity-70">(H)</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Press H to hit</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={actions.stand}
                      disabled={!availableActions.includes('stand')}
                      className="bg-destructive hover:bg-destructive/80 text-destructive-foreground min-w-20"
                    >
                      Stand <span className="ml-1 text-xs opacity-70">(S)</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Press S to stand</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={actions.double}
                      disabled={!availableActions.includes('double')}
                      variant="outline"
                      className="border-primary text-primary hover:bg-primary hover:text-primary-foreground min-w-20"
                    >
                      Double <span className="ml-1 text-xs opacity-70">(D)</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Press D to double</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={actions.split}
                      disabled={!availableActions.includes('split')}
                      variant="outline"
                      className="border-warning text-warning hover:bg-warning hover:text-warning-foreground min-w-20"
                    >
                      Split <span className="ml-1 text-xs opacity-70">(P)</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Press P to split</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {config.allowSurrender && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        onClick={actions.surrender}
                        disabled={!availableActions.includes('surrender')}
                        variant="outline"
                        className="border-muted-foreground text-muted-foreground hover:bg-muted min-w-20"
                      >
                        Surrender <span className="ml-1 text-xs opacity-70">(R)</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Press R to surrender (lose half bet)</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}

              {/* Hint toggle button */}
              {!config.alwaysShowHints && (
                <Button
                  onClick={() => setShowHint(!showHint)}
                  variant="ghost"
                  className="text-muted-foreground hover:text-primary"
                >
                  <Lightbulb className={cn("w-5 h-5", showHint && "text-primary")} />
                </Button>
              )}
            </>
          )}

          {phase === GamePhase.INSURANCE_OFFER && (
            <>
              <Button
                onClick={() => actions.takeInsurance(true)}
                className="bg-success hover:bg-success/80 text-success-foreground"
              >
                Take Insurance (Y)
              </Button>
              <Button
                onClick={() => actions.takeInsurance(false)}
                variant="destructive"
              >
                No Insurance (N)
              </Button>
            </>
          )}

          {phase === GamePhase.ROUND_OVER && (
            <Button
              onClick={actions.nextRound}
              className="bg-primary hover:bg-primary/80 text-primary-foreground min-w-32"
            >
              New Round (Enter)
            </Button>
          )}
        </div>

        {/* Betting Area */}
        {phase === GamePhase.BETTING && (
          <Card className="max-w-md mx-auto bg-card/50 backdrop-blur border-border/50">
            <CardContent className="p-6">
              {bankroll < (config?.minBet || 10) ? (
                <div className="flex flex-col items-center gap-4">
                  <span className="text-lg font-display text-destructive">Out of chips!</span>
                  <p className="text-sm text-muted-foreground text-center">
                    Your bankroll (${bankroll}) is below the minimum bet (${config?.minBet || 10}).
                  </p>
                  <Button
                    onClick={actions.resetGame}
                    className="w-full bg-primary hover:bg-primary/80 text-primary-foreground font-bold py-6 text-lg"
                  >
                    Start New Session
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-4">
                  <span className="text-lg font-display text-foreground">Place Your Bet</span>

                  {/* Quick bet chips */}
                  <div className="flex gap-2">
                    {[10, 25, 50, 100, 250].map(amount => (
                      <button
                        key={amount}
                        onClick={() => handleQuickBet(amount)}
                        disabled={amount > bankroll}
                        className={cn(
                          'w-12 h-12 rounded-full flex items-center justify-center text-xs font-bold',
                          'transition-all duration-200 hover:scale-110',
                          betAmount === amount ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : '',
                          amount <= bankroll
                            ? 'bg-gradient-to-b from-primary to-primary/80 text-primary-foreground shadow-gold cursor-pointer'
                            : 'bg-muted text-muted-foreground cursor-not-allowed'
                        )}
                      >
                        ${amount}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-3 w-full max-w-xs">
                    <span className="text-muted-foreground">$</span>
                    <Input
                      type="number"
                      value={betAmount}
                      onChange={(e) => setBetAmount(Math.max(config?.minBet || 10, parseInt(e.target.value) || config?.minBet || 10))}
                      min={config?.minBet || 10}
                      max={bankroll}
                      className="text-center text-lg font-bold"
                    />
                  </div>

                  <Button
                    onClick={handleDeal}
                    disabled={!betAmount || isNaN(betAmount) || betAmount > bankroll || betAmount < (config?.minBet || 10)}
                    className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground font-bold py-6 text-lg shadow-gold"
                  >
                    Deal Cards (Enter)
                  </Button>

                  {/* Keyboard shortcut hint */}
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Keyboard className="w-3 h-3" />
                    <span>Press 1-5 for quick bets, Enter to deal</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export default GameTable;
