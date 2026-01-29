// Blackjack Game Table Component
import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PlayingCard, HandDisplay } from './PlayingCard';
import { GamePhase, calculateHandTotal } from '@/lib/gameLogic';

export function GameTable({
  gameState,
  actions,
  getAvailableActions,
  decksRemaining,
  config
}) {
  const [betAmount, setBetAmount] = useState(config?.minBet || 25);
  const { phase, playerHands, dealerCards, bankroll, message, runningCount } = gameState;

  // Auto-deal after starting round
  useEffect(() => {
    if (phase === GamePhase.DEALING) {
      const timer = setTimeout(() => {
        actions.dealInitial();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [phase, actions]);

  const handleDeal = () => {
    if (actions.startRound(betAmount)) {
      // Deal will happen in useEffect
    }
  };

  const handleQuickBet = (amount) => {
    setBetAmount(amount);
  };

  const availableActions = getAvailableActions();
  const activeHand = playerHands[gameState.activeHandIndex];
  const dealerTotal = calculateHandTotal(dealerCards);
  const showDealerHole = phase === GamePhase.DEALER_TURN || phase === GamePhase.ROUND_OVER;

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
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="text-primary border-primary/30">
            RC: {runningCount}
          </Badge>
          <Badge 
            variant={phase === GamePhase.PLAYER_TURN ? 'default' : 'secondary'}
            className={cn(
              phase === GamePhase.PLAYER_TURN && 'bg-primary text-primary-foreground'
            )}
          >
            {phase.replace('_', ' ')}
          </Badge>
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
                Hit
              </Button>
              <Button
                onClick={actions.stand}
                disabled={!availableActions.includes('stand')}
                className="bg-destructive hover:bg-destructive/80 text-destructive-foreground min-w-24"
              >
                Stand
              </Button>
              <Button
                onClick={actions.double}
                disabled={!availableActions.includes('double')}
                variant="outline"
                className="border-primary text-primary hover:bg-primary hover:text-primary-foreground min-w-24"
              >
                Double
              </Button>
              <Button
                onClick={actions.split}
                disabled={!availableActions.includes('split')}
                variant="outline"
                className="border-warning text-warning hover:bg-warning hover:text-warning-foreground min-w-24"
              >
                Split
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
              New Round
            </Button>
          )}
        </div>

        {/* Betting Area */}
        {phase === GamePhase.BETTING && (
          <Card className="max-w-md mx-auto bg-card/50 backdrop-blur border-border/50">
            <CardContent className="p-6">
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
                  disabled={betAmount > bankroll || betAmount < (config?.minBet || 10)}
                  className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground font-bold py-6 text-lg shadow-gold"
                >
                  Deal Cards
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export default GameTable;
