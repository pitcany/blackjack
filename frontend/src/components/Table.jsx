import React from 'react';
import HUD from './HUD';
import Controls from './Controls';
import Card from './Card';
import { useStore } from '../lib/store';

export default function Table() {
  const { gameState, user, logout } = useStore();

  return (
    <div className="flex flex-col h-screen overflow-hidden md:flex-row">
      {/* Left Panel: Stats/Menu (Hidden on mobile usually or drawer) */}
      <div className="hidden md:flex flex-col w-64 bg-neutral-900 border-r border-neutral-800 p-4 space-y-4">
        <h1 className="text-xl font-bold text-emerald-500">Blackjack Trainer</h1>
        <div className="space-y-2">
            <div className="text-sm text-neutral-400">Bankroll</div>
            <div className="text-2xl font-mono text-emerald-400">${gameState?.bankroll || user?.bankroll || 0}</div>
        </div>
        <button onClick={logout} className="px-4 py-2 text-sm text-neutral-400 hover:text-white border border-neutral-700 rounded">
            Sign Out
        </button>
      </div>

      {/* Main Game Area */}
      <div className="relative flex-1 flex flex-col felt-bg shadow-inner">
        
        {/* Dealer Area */}
        <div className="flex-1 flex flex-col items-center justify-center p-4">
            <div className="mb-8">
                <div className="text-xs text-center text-emerald-200/50 mb-2 uppercase tracking-wider">Dealer</div>
                <div className="flex -space-x-12">
                    {gameState?.dealerHand?.cards.map((card, i) => (
                        <Card key={i} card={card} index={i} />
                    ))}
                    {/* Placeholder for empty hand */}
                    {(!gameState?.dealerHand?.cards.length) && <div className="w-24 h-36 border-2 border-dashed border-emerald-800/50 rounded-lg"></div>}
                </div>
                {gameState?.dealerHand?.cards.length > 0 && (
                     <div className="mt-2 text-center text-emerald-100 font-mono text-sm bg-black/20 rounded px-2 py-1 inline-block">
                        {gameState.dealerHand.value}
                     </div>
                )}
            </div>

            {/* Player Area */}
            <div>
                 <div className="text-xs text-center text-emerald-200/50 mb-2 uppercase tracking-wider">Player</div>
                 <div className="flex gap-8">
                    {gameState?.playerHands?.map((hand, hIndex) => (
                        <div key={hIndex} className={`flex flex-col items-center ${gameState.currentHandIndex === hIndex ? 'ring-2 ring-yellow-400/50 rounded-xl p-2' : ''}`}>
                             <div className="flex -space-x-12">
                                {hand.cards.map((card, cIndex) => (
                                    <Card key={cIndex} card={card} index={cIndex} />
                                ))}
                             </div>
                             <div className="mt-2 flex items-center gap-2">
                                <div className="text-center text-emerald-100 font-mono text-sm bg-black/20 rounded px-2 py-1">
                                    {hand.value}
                                </div>
                                <div className="text-xs text-yellow-500 font-bold">
                                    ${hand.bet}
                                </div>
                             </div>
                             {hand.status !== 'playing' && (
                                 <div className="mt-1 text-xs font-bold text-red-300 uppercase">{hand.status}</div>
                             )}
                        </div>
                    ))}
                    {(!gameState?.playerHands?.length) && <div className="w-24 h-36 border-2 border-dashed border-emerald-800/50 rounded-lg opacity-50"></div>}
                 </div>
            </div>
            
            {gameState?.message && (
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/60 backdrop-blur text-white px-6 py-3 rounded-xl shadow-xl border border-white/10 animate-in fade-in zoom-in duration-300">
                    {gameState.message}
                </div>
            )}
        </div>

        {/* Controls */}
        <div className="bg-neutral-900/90 backdrop-blur border-t border-neutral-800 p-4">
            <Controls />
        </div>
      </div>

      {/* Right Panel: HUD */}
      <div className="hidden lg:block w-80 bg-neutral-900 border-l border-neutral-800 p-4">
        <HUD />
      </div>
    </div>
  );
}
