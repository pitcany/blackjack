import React, { useState, useCallback } from 'react';
import { useStore } from '../lib/store';
import { Action } from '../lib/engine';

export default function Controls() {
  const { gameState, dispatchAction, deal, resetShoe } = useStore();
  const engine = useStore(state => state.engine);
  const [isProcessing, setIsProcessing] = useState(false);
  const [customBet, setCustomBet] = useState('');

  // Debounced action handler
  const handleAction = useCallback((action) => {
    if (isProcessing) return;
    setIsProcessing(true);
    dispatchAction(action);
    setTimeout(() => setIsProcessing(false), 300);
  }, [isProcessing, dispatchAction]);

  // Debounced deal handler
  const handleDeal = useCallback((bet) => {
    if (isProcessing) return;
    setIsProcessing(true);
    deal(bet);
    setTimeout(() => setIsProcessing(false), 300);
  }, [isProcessing, deal]);
  
  if (!gameState) return (
      <div className="flex justify-center">
          <button onClick={() => handleDeal(10)} disabled={isProcessing} className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-8 rounded-full shadow-lg transition-transform transform hover:scale-105 disabled:opacity-50">
              Deal Game ($10)
          </button>
      </div>
  );

  const { phase } = gameState;

  const handleCustomBet = () => {
    const bet = parseInt(customBet);
    if (bet && bet > 0 && bet <= (gameState?.bankroll || engine.bankroll)) {
      handleDeal(bet);
      setCustomBet('');
    }
  };

  if (phase === 'betting' || phase === 'payout') {
      return (
          <div className="flex flex-col items-center gap-4">
              <div className="flex justify-center gap-3">
                  <button onClick={() => handleDeal(10)} disabled={isProcessing} className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 px-6 rounded-full shadow-lg transition-transform transform hover:scale-105 disabled:opacity-50">
                      $10
                  </button>
                  <button onClick={() => handleDeal(25)} disabled={isProcessing} className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 px-6 rounded-full shadow-lg transition-transform transform hover:scale-105 disabled:opacity-50">
                      $25
                  </button>
                  <button onClick={() => handleDeal(50)} disabled={isProcessing} className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 px-6 rounded-full shadow-lg transition-transform transform hover:scale-105 disabled:opacity-50">
                      $50
                  </button>
                  <button onClick={() => handleDeal(100)} disabled={isProcessing} className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 px-6 rounded-full shadow-lg transition-transform transform hover:scale-105 disabled:opacity-50">
                      $100
                  </button>
              </div>
              <div className="flex gap-2 items-center">
                  <input
                    type="number"
                    value={customBet}
                    onChange={(e) => setCustomBet(e.target.value)}
                    placeholder="Custom bet"
                    min="1"
                    max={gameState?.bankroll || engine.bankroll}
                    className="w-28 px-3 py-2 bg-neutral-800 border border-neutral-600 rounded-lg text-white text-center text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                  <button
                    onClick={handleCustomBet}
                    disabled={isProcessing || !customBet}
                    className="bg-emerald-700 hover:bg-emerald-600 text-white font-bold py-2 px-4 rounded-lg disabled:opacity-50"
                  >
                    Deal
                  </button>
              </div>
               {gameState.decksRemaining < 1 && (
                  <button onClick={resetShoe} className="bg-yellow-600 hover:bg-yellow-500 text-white font-bold py-2 px-6 rounded-full">
                      Shuffle
                  </button>
               )}
          </div>
      );
  }

  return (
    <div className="flex justify-center gap-4 flex-wrap">
      <ActionButton onClick={() => handleAction(Action.HIT)} label="Hit" color="bg-green-600" disabled={isProcessing} />
      <ActionButton onClick={() => handleAction(Action.STAND)} label="Stand" color="bg-red-600" disabled={isProcessing} />
      <ActionButton
        onClick={() => handleAction(Action.DOUBLE)}
        label="Double"
        color="bg-yellow-600"
        disabled={isProcessing || !engine.canDouble}
      />
      <ActionButton
        onClick={() => handleAction(Action.SPLIT)}
        label="Split"
        color="bg-blue-600"
        disabled={isProcessing || !engine.canSplit}
      />
    </div>
  );
}

function ActionButton({ onClick, label, color, disabled }) {
    return (
        <button 
            onClick={onClick} 
            disabled={disabled}
            className={`${color} ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:brightness-110'} text-white font-bold py-3 px-8 rounded-xl shadow-lg transition-all min-w-[100px]`}
        >
            {label}
        </button>
    );
}
