// Blackjack Game Table Component
import React, { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PlayingCard, HandDisplay } from './PlayingCard';
import { GamePhase, calculateHandTotal } from '@/lib/gameLogic';
import { CheckCircle2, XCircle, Lightbulb, AlertTriangle } from 'lucide-react';

export function GameTable({
  gameState,
  actions,
  getAvailableActions,
  getOptimalAction,
  getDeviationInfo,
  decksRemaining,
  trueCount,
  config,
  strategyStats,
  hintMode,
}) {
  const [betAmount, setBetAmount] = useState(config?.minBet || 25);
  const [showHint, setShowHint] = useState(false);
  const { phase, playerHands, dealerCards, bankroll, message, runningCount, lastStrategyFeedback } = gameState;

  // Auto-deal after starting round
  useEffect(() => {
    if (phase === GamePhase.DEALING) {
      const timer = setTimeout(() => {
        actions.dealInitial();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [phase, actions]);

  // Reset hint on new hand / phase change
  useEffect(() => {
    setShowHint(false);
  }, [phase, gameState.activeHandIndex]);

  const handleDeal = useCallback(() => {
    actions.startRound(betAmount);
  }, [actions, betAmount]);

  const handleQuickBet = (amount) => {
    setBetAmount(amount);
  };

  const availableActions = getAvailableActions();
  const dealerTotal = calculateHandTotal(dealerCards);
  const showDealerHole = phase === GamePhase.DEALER_TURN || phase === GamePhase.ROUND_OVER;

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e) => {
      // Don't capture if typing in an input
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      const key = e.key.toLowerCase();

      if (phase === GamePhase.PLAYER_TURN) {
        if (key === 'h' && availableActions.includes('hit')) { actions.hit(); e.preventDefault(); }
        else if (key === 's' && availableActions.includes('stand')) { actions.stand(); e.preventDefault(); }
        else if (key === 'd' && availableActions.includes('double')) { actions.double(); e.preventDefault(); }
        else if (key === 'p' && availableActions.includes('split')) { actions.split(); e.preventDefault(); }
        else if (key === 'r' && availableActions.includes('surrender')) { actions.surrender(); e.preventDefault(); }
      } else if (phase === GamePhase.ROUND_OVER) {
        if (key === 'enter') { actions.nextRound(); e.preventDefault(); }
      } else if (phase === GamePhase.BETTING) {
        if (key === 'enter' && betAmount >= (config?.minBet || 10) && betAmount <= bankroll) { handleDeal(); e.preventDefault(); }
        else if (key === '1') { handleQuickBet(10); e.preventDefault(); }
        else if (key === '2') { handleQuickBet(25); e.preventDefault(); }
        else if (key === '3') { handleQuickBet(50); e.preventDefault(); }
        else if (key === '4') { handleQuickBet(100); e.preventDefault(); }
        else if (key === '5') { handleQuickBet(250); e.preventDefault(); }
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [phase, availableActions, actions, betAmount, bankroll, config, handleDeal]);

  // Penetration bar
  const totalCards = (config?.numDecks || 6) * 52;
  const cardsDealt = totalCards - Math.round(decksRemaining * 52);
  const penetrationPct = totalCards > 0 ? (cardsDealt / totalCards) * 100 : 0;
  const reshuffleThreshold = (config?.penetration || 0.75) * 100;
  const penColor = penetrationPct < reshuffleThreshold * 0.6 ? 'bg-success' : penetrationPct < reshuffleThreshold * 0.85 ? 'bg-warning' : 'bg-destructive';

  const optimalAction = getOptimalAction ? getOptimalAction() : null;
  const deviation = getDeviationInfo ? getDeviationInfo() : null;

  const strategyAccuracy = strategyStats?.totalDecisions > 0
    ? Math.round((strategyStats.correctDecisions / strategyStats.totalDecisions) * 100)
    : null;

  return (
    <div className="flex flex-col min-h-[600px]">
      {/* Table Header - Stats */}
      <div className="flex items-center justify-between px-6 py-3 bg-card/30 rounded-t-2xl border-b border-border/50">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground text-sm">Bankroll</span>
            <span className="text-xl font-bold text-primary">${bankroll}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground text-sm">Decks</span>
            <span className="text-sm font-medium">{decksRemaining.toFixed(1)}</span>
          </div>
          {strategyAccuracy !== null && (
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground text-sm">Strategy</span>
              <span className={cn('text-sm font-medium', strategyAccuracy >= 90 ? 'text-success' : strategyAccuracy >= 70 ? 'text-warning' : 'text-destructive')}>
                {strategyAccuracy}%
              </span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="text-primary border-primary/30">
            RC: {runningCount}
          </Badge>
          <Badge variant="outline" className="border-primary/30">
            TC: {trueCount}
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

      {/* Shoe Penetration Bar */}
      <div className="px-6 py-2 bg-card/20">
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground whitespace-nowrap">Shoe</span>
          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden relative">
            <div className={cn('h-full rounded-full transition-all duration-500', penColor)} style={{ width: `${penetrationPct}%` }} />
            {/* Reshuffle threshold marker */}
            <div className="absolute top-0 h-full w-0.5 bg-foreground/50" style={{ left: `${reshuffleThreshold}%` }} />
          </div>
          <span className="text-xs text-muted-foreground whitespace-nowrap">{Math.round(penetrationPct)}%</span>
        </div>
      </div>

      {/* Game Area */}
      <div className="flex-1 bg-gradient-table felt-texture rounded-b-2xl p-6 relative">
        {/* Message Banner */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
          <div className="px-6 py-2 bg-card/80 backdrop-blur-sm rounded-full border border-border">
            <p className="text-sm font-medium text-foreground">{message}</p>
          </div>
        </div>

        {/* Strategy Feedback */}
        {lastStrategyFeedback && phase === GamePhase.PLAYER_TURN && (
          <div className="absolute top-14 left-1/2 -translate-x-1/2 z-10 animate-fade-in">
            <div className={cn(
              'px-4 py-1.5 rounded-full border flex items-center gap-2 text-sm',
              lastStrategyFeedback.correct
                ? 'bg-success/20 border-success/40 text-success'
                : 'bg-destructive/20 border-destructive/40 text-destructive'
            )}>
              {lastStrategyFeedback.correct ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : (
                <XCircle className="w-4 h-4" />
              )}
              {lastStrategyFeedback.correct
                ? 'Correct!'
                : `Optimal: ${lastStrategyFeedback.optimal}`}
            </div>
          </div>
        )}

        {/* Deviation Alert */}
        {deviation && phase === GamePhase.PLAYER_TURN && (
          <div className="absolute top-14 right-6 z-10 animate-fade-in">
            <div className="px-3 py-1.5 rounded-lg border bg-warning/20 border-warning/40 text-warning text-xs flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" />
              {deviation.description}
            </div>
          </div>
        )}

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

        {/* Action Buttons */}
        <div className="flex justify-center gap-3 mb-6">
          {phase === GamePhase.PLAYER_TURN && (
            <>
              <Button
                onClick={actions.hit}
                disabled={!availableActions.includes('hit')}
                className="bg-success hover:bg-success/80 text-success-foreground min-w-24"
              >
                Hit <span className="text-xs opacity-60 ml-1">(H)</span>
              </Button>
              <Button
                onClick={actions.stand}
                disabled={!availableActions.includes('stand')}
                className="bg-destructive hover:bg-destructive/80 text-destructive-foreground min-w-24"
              >
                Stand <span className="text-xs opacity-60 ml-1">(S)</span>
              </Button>
              <Button
                onClick={actions.double}
                disabled={!availableActions.includes('double')}
                variant="outline"
                className="border-primary text-primary hover:bg-primary hover:text-primary-foreground min-w-24"
              >
                Double <span className="text-xs opacity-60 ml-1">(D)</span>
              </Button>
              <Button
                onClick={actions.split}
                disabled={!availableActions.includes('split')}
                variant="outline"
                className="border-warning text-warning hover:bg-warning hover:text-warning-foreground min-w-24"
              >
                Split <span className="text-xs opacity-60 ml-1">(P)</span>
              </Button>
              {availableActions.includes('surrender') && (
                <Button
                  onClick={actions.surrender}
                  variant="outline"
                  className="border-muted-foreground text-muted-foreground hover:bg-muted min-w-24"
                >
                  Surrender <span className="text-xs opacity-60 ml-1">(R)</span>
                </Button>
              )}
              {/* Hint Button */}
              <Button
                onClick={() => setShowHint(!showHint)}
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-primary"
                title="Show hint"
              >
                <Lightbulb className={cn('w-5 h-5', showHint && 'text-primary fill-primary/20')} />
              </Button>
            </>
          )}

          {phase === GamePhase.INSURANCE_OFFER && (
            <>
              <Button
                onClick={() => actions.takeInsurance(true)}
                className="bg-success hover:bg-success/80 text-success-foreground"
              >
                Take Insurance
              </Button>
              <Button
                onClick={() => actions.takeInsurance(false)}
                variant="destructive"
              >
                No Insurance
              </Button>
            </>
          )}

          {phase === GamePhase.ROUND_OVER && (
            <Button
              onClick={actions.nextRound}
              className="bg-primary hover:bg-primary/80 text-primary-foreground min-w-32"
            >
              New Round <span className="text-xs opacity-60 ml-1">(Enter)</span>
            </Button>
          )}
        </div>

        {/* Hint Display */}
        {showHint && optimalAction && phase === GamePhase.PLAYER_TURN && (
          <div className="flex justify-center mb-4 animate-fade-in">
            <div className="px-4 py-2 rounded-lg bg-primary/10 border border-primary/30 text-primary text-sm flex items-center gap-2">
              <Lightbulb className="w-4 h-4" />
              Basic strategy: <span className="font-bold capitalize">{optimalAction}</span>
            </div>
          </div>
        )}

        {/* Hint always-on mode */}
        {hintMode === 'always' && optimalAction && phase === GamePhase.PLAYER_TURN && !showHint && (
          <div className="flex justify-center mb-4">
            <div className="px-3 py-1 rounded-lg bg-primary/5 border border-primary/20 text-primary/70 text-xs">
              Optimal: <span className="font-medium capitalize">{optimalAction}</span>
            </div>
          </div>
        )}

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
                    {[10, 25, 50, 100, 250].map((amount, i) => (
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
                        title={`$${amount} (${i + 1})`}
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
                    Deal Cards <span className="text-sm opacity-60 ml-1">(Enter)</span>
                  </Button>
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
