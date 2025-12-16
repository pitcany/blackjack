import React from 'react';
import { useStore } from '../lib/store';

export default function HUD() {
  const { gameState } = useStore();
  
  if (!gameState) return <div className="text-neutral-500 text-sm text-center mt-10">Start a game to see stats</div>;

  const { runningCount, trueCount, decksRemaining, recommendation } = gameState;
  
  // Calculate Edge (Approx)
  const edge = (trueCount * 0.5) - 0.5;
  const edgeColor = edge > 0 ? 'text-emerald-400' : 'text-red-400';

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
