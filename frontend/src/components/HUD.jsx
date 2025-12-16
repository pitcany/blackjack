import React from 'react';
import { useStore } from '../lib/store';

// Bet sizing recommendations based on True Count
const getBetRecommendation = (trueCount, minBet = 10) => {
  if (trueCount <= 0) return { units: 1, label: 'Minimum', color: 'text-neutral-400' };
  if (trueCount < 2) return { units: 1, label: '1 unit', color: 'text-neutral-300' };
  if (trueCount < 3) return { units: 2, label: '2 units', color: 'text-yellow-400' };
  if (trueCount < 4) return { units: 4, label: '4 units', color: 'text-emerald-400' };
  if (trueCount < 5) return { units: 8, label: '8 units', color: 'text-emerald-300' };
  return { units: 12, label: 'Max bet', color: 'text-emerald-200' };
};

export default function HUD() {
  const { gameState } = useStore();

  if (!gameState) return <div className="text-neutral-500 text-sm text-center mt-10">Start a game to see stats</div>;

  const { runningCount, trueCount, decksRemaining, recommendation, bankroll } = gameState;

  // Calculate Edge (Approx: ~0.5% per TC minus house edge)
  const edge = (trueCount * 0.5) - 0.5;
  const edgeColor = edge > 0 ? 'text-emerald-400' : edge < -1 ? 'text-red-400' : 'text-yellow-400';

  // Bet sizing
  const minBet = 10;
  const betRec = getBetRecommendation(trueCount, minBet);
  const suggestedBet = Math.min(betRec.units * minBet, bankroll || 10000);

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-bold text-neutral-200 border-b border-neutral-800 pb-2">Advantage HUD</h2>

      <div className="grid grid-cols-2 gap-4">
        <StatBox label="Running Count" value={runningCount} />
        <StatBox label="True Count" value={trueCount.toFixed(1)} highlight />
        <StatBox label="Decks Left" value={decksRemaining.toFixed(1)} />
        <div className="bg-neutral-800 p-3 rounded-lg border border-neutral-700">
            <div className="text-xs text-neutral-400 uppercase tracking-wider mb-1">Player Edge</div>
            <div className={`text-xl font-mono font-bold ${edgeColor}`}>
                {edge > 0 ? '+' : ''}{edge.toFixed(1)}%
            </div>
        </div>
      </div>

      {/* Bet Sizing Guidance */}
      <div className="bg-neutral-800 p-4 rounded-xl border border-amber-600/30 shadow-lg">
        <div className="text-xs text-amber-400 uppercase tracking-wider mb-2">Bet Sizing</div>
        <div className="flex items-center justify-between">
          <div>
            <div className={`text-2xl font-bold ${betRec.color}`}>
              ${suggestedBet}
            </div>
            <div className="text-xs text-neutral-400 mt-1">
              {betRec.label} ({betRec.units}x ${minBet})
            </div>
          </div>
          <div className="text-right">
            {trueCount <= 0 ? (
              <span className="text-xs text-red-400 bg-red-900/30 px-2 py-1 rounded">No Edge</span>
            ) : trueCount >= 3 ? (
              <span className="text-xs text-emerald-400 bg-emerald-900/30 px-2 py-1 rounded">Advantage!</span>
            ) : (
              <span className="text-xs text-yellow-400 bg-yellow-900/30 px-2 py-1 rounded">Marginal</span>
            )}
          </div>
        </div>
        <div className="mt-3 text-xs text-neutral-500">
          Spread: 1-{trueCount >= 4 ? '12' : trueCount >= 3 ? '8' : trueCount >= 2 ? '4' : '2'} units based on TC
        </div>
      </div>

      <div className="bg-neutral-800 p-4 rounded-xl border border-neutral-700 shadow-lg">
        <div className="text-xs text-neutral-400 uppercase tracking-wider mb-2">Strategy Advice</div>
        <div className="flex items-center justify-between mb-2">
            <span className="text-2xl font-bold text-white">{recommendation?.action || '-'}</span>
            <span className="px-2 py-1 text-xs bg-neutral-700 rounded text-neutral-300">TC: {trueCount.toFixed(1)}</span>
        </div>
        <p className="text-sm text-neutral-400 leading-relaxed">
            {recommendation?.reason || 'Waiting for deal...'}
        </p>
      </div>
    </div>
  );
}

function StatBox({ label, value, highlight }) {
    return (
        <div className={`bg-neutral-800 p-3 rounded-lg border ${highlight ? 'border-emerald-500/30 bg-emerald-900/10' : 'border-neutral-700'}`}>
            <div className="text-xs text-neutral-400 uppercase tracking-wider mb-1">{label}</div>
            <div className={`text-xl font-mono font-bold ${highlight ? 'text-emerald-400' : 'text-neutral-200'}`}>{value}</div>
        </div>
    );
}
