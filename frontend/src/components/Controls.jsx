import React from 'react';
import { useStore } from '../lib/store';
import { Action } from '../lib/engine';

export default function Controls() {
  const { gameState, dispatchAction, deal, resetShoe } = useStore();
  const engine = useStore(state => state.engine);
  
  if (!gameState) return (
      <div className="flex justify-center">
          <button onClick={() => deal(10)} className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-8 rounded-full shadow-lg transition-transform transform hover:scale-105">
              Deal Game ($10)
          </button>
      </div>
  );

  const { phase } = gameState;

  if (phase === 'betting' || phase === 'payout') {
      return (
          <div className="flex justify-center gap-4">
              <button onClick={() => deal(10)} className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-8 rounded-full shadow-lg transition-transform transform hover:scale-105">
                  Deal ($10)
              </button>
              <button onClick={() => deal(50)} className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-8 rounded-full shadow-lg transition-transform transform hover:scale-105">
                  Deal ($50)
              </button>
               {gameState.decksRemaining < 1 && (
                  <button onClick={resetShoe} className="bg-yellow-600 hover:bg-yellow-500 text-white font-bold py-3 px-6 rounded-full">
                      Shuffle
                  </button>
               )}
          </div>
      );
  }

  return (
    <div className="flex justify-center gap-4 flex-wrap">
      <ActionButton onClick={() => dispatchAction(Action.HIT)} label="Hit" color="bg-green-600" />
      <ActionButton onClick={() => dispatchAction(Action.STAND)} label="Stand" color="bg-red-600" />
      <ActionButton 
        onClick={() => dispatchAction(Action.DOUBLE)} 
        label="Double" 
        color="bg-yellow-600" 
        disabled={!engine.canDouble} 
      />
      <ActionButton 
        onClick={() => dispatchAction(Action.SPLIT)} 
        label="Split" 
        color="bg-blue-600" 
        disabled={!engine.canSplit} 
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
