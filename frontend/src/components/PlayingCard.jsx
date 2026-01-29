// Playing Card Component
import React from 'react';
import { cn } from '@/lib/utils';

export function PlayingCard({ 
  card, 
  faceDown = false, 
  size = 'md',
  className,
  animate = false,
  delay = 0 
}) {
  const sizeClasses = {
    sm: 'w-12 h-16 text-lg',
    md: 'w-16 h-22 text-xl',
    lg: 'w-20 h-28 text-2xl',
    xl: 'w-24 h-32 text-3xl'
  };

  if (faceDown) {
    return (
      <div 
        className={cn(
          sizeClasses[size],
          'rounded-lg shadow-card flex items-center justify-center relative overflow-hidden',
          'bg-gradient-to-br from-blue-900 to-blue-950 border-2 border-primary/30',
          animate && 'card-deal',
          className
        )}
        style={animate ? { animationDelay: `${delay}ms` } : {}}
      >
        <div className="absolute inset-2 border border-primary/20 rounded">
          <div className="w-full h-full flex items-center justify-center text-primary/40 text-sm font-bold">
            ♠♥♣♦
          </div>
        </div>
        <div className="absolute inset-0 shimmer" />
      </div>
    );
  }

  const isRed = card.isRed;
  const colorClass = isRed ? 'text-card-red' : 'text-card-black';

  return (
    <div 
      className={cn(
        sizeClasses[size],
        'rounded-lg shadow-card relative overflow-hidden',
        'bg-gradient-to-br from-white to-gray-100',
        'hover:scale-105 hover:shadow-lg transition-all duration-200',
        animate && 'card-deal',
        className
      )}
      style={animate ? { animationDelay: `${delay}ms` } : {}}
    >
      {/* Card shine effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-transparent pointer-events-none" />
      
      {/* Top left corner */}
      <div className={cn('absolute top-1 left-1.5 flex flex-col items-center leading-none', colorClass)}>
        <span className="font-bold">{card.symbol}</span>
        <span className="text-sm">{card.suit}</span>
      </div>

      {/* Center suit */}
      <div className={cn('absolute inset-0 flex items-center justify-center text-4xl', colorClass)}>
        {card.suit}
      </div>

      {/* Bottom right corner (rotated) */}
      <div className={cn('absolute bottom-1 right-1.5 flex flex-col items-center leading-none rotate-180', colorClass)}>
        <span className="font-bold">{card.symbol}</span>
        <span className="text-sm">{card.suit}</span>
      </div>
    </div>
  );
}

// Hand display component
export function HandDisplay({ 
  cards, 
  total, 
  isSoft, 
  isActive, 
  bet, 
  result,
  isDealer = false,
  hideHoleCard = false,
  label,
  animate = true
}) {
  return (
    <div 
      className={cn(
        'flex flex-col items-center p-4 rounded-xl transition-all duration-300',
        isActive && 'ring-2 ring-primary shadow-glow bg-card/50',
        !isActive && 'bg-card/20'
      )}
    >
      {label && (
        <span className={cn(
          'text-sm font-medium mb-2',
          isDealer ? 'text-muted-foreground' : 'text-primary'
        )}>
          {label}
        </span>
      )}

      {/* Cards */}
      <div className="flex gap-2 mb-3">
        {cards.map((card, index) => (
          <PlayingCard
            key={index}
            card={card}
            faceDown={hideHoleCard && index === 1}
            size="lg"
            animate={animate}
            delay={index * 100}
          />
        ))}
      </div>

      {/* Total display */}
      <div className="flex items-center gap-2 text-lg font-semibold">
        {(!hideHoleCard || cards.length === 0) && (
          <>
            <span className={cn(
              result === 'BUST' && 'text-destructive',
              result === 'BLACKJACK' && 'text-primary',
              result === 'WIN' && 'text-success',
              !result && 'text-foreground'
            )}>
              {total}
            </span>
            {isSoft && <span className="text-sm text-muted-foreground">(soft)</span>}
          </>
        )}
        {hideHoleCard && cards.length > 0 && (
          <span className="text-muted-foreground">
            {cards[0].value}
          </span>
        )}
      </div>

      {/* Result badge */}
      {result && (
        <div className={cn(
          'mt-2 px-3 py-1 rounded-full text-sm font-medium animate-bounce-in',
          result === 'WIN' && 'bg-success/20 text-success',
          result === 'BLACKJACK' && 'bg-primary/20 text-primary',
          result === 'LOSE' && 'bg-destructive/20 text-destructive',
          result === 'BUST' && 'bg-destructive/20 text-destructive',
          result === 'PUSH' && 'bg-muted text-muted-foreground'
        )}>
          {result}
        </div>
      )}

      {/* Bet display */}
      {bet > 0 && (
        <div className="mt-2 flex items-center gap-1 text-sm">
          <span className="text-muted-foreground">Bet:</span>
          <span className="text-primary font-medium">${bet}</span>
        </div>
      )}
    </div>
  );
}

export default PlayingCard;
