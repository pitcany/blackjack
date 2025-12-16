import React, { useState } from 'react';
import HUD from './HUD';
import Controls from './Controls';
import Card from './Card';
import LessonOverlay from './LessonOverlay';
import { useStore } from '../lib/store';

export default function Table() {
  const { gameState, user, sessionStats, currentSessionId, endTrackedSession } = useStore();
  const [showMobileHUD, setShowMobileHUD] = useState(false);
  const [showSessionSummary, setShowSessionSummary] = useState(false);
  const [sessionResult, setSessionResult] = useState(null);

  const handleEndSession = async () => {
    if (!currentSessionId) return;
    const result = await endTrackedSession();
    if (result) {
      setSessionResult(result);
      setShowSessionSummary(true);
    }
  };

  const closeSummary = () => {
    setShowSessionSummary(false);
    setSessionResult(null);
  };

  return (
    <div className="flex flex-col flex-1 h-[calc(100vh-64px)] overflow-hidden md:flex-row">
      {/* Session Summary Modal */}
      {showSessionSummary && sessionResult && (
        <SessionSummaryModal result={sessionResult} onClose={closeSummary} />
      )}

      {/* Left Panel: Stats (Hidden on mobile) */}
      <div className="hidden md:flex flex-col w-64 bg-neutral-900 border-r border-neutral-800 p-4 space-y-4">
        <h1 className="text-xl font-bold text-emerald-500">Session Stats</h1>
        <div className="space-y-2">
            <div className="text-sm text-neutral-400">Current Bankroll</div>
            <div className="text-2xl font-mono text-emerald-400">${gameState?.bankroll?.toFixed(0) || user?.bankroll?.toFixed(0) || 0}</div>
        </div>
        <div className="space-y-2 pt-4 border-t border-neutral-800">
             <div className="text-sm text-neutral-400">Hands Played</div>
             <div className="text-xl text-white font-mono">{sessionStats?.handsPlayed || 0}</div>
        </div>
        <div className="space-y-2 pt-4 border-t border-neutral-800">
             <div className="text-sm text-neutral-400">Accuracy</div>
             <div className="text-xl text-white font-mono">
                {sessionStats?.correctPlays + sessionStats?.mistakes > 0
                  ? `${((sessionStats.correctPlays / (sessionStats.correctPlays + sessionStats.mistakes)) * 100).toFixed(0)}%`
                  : '-'}
             </div>
        </div>

        {/* End Session Button */}
        {currentSessionId && (
          <div className="pt-4 mt-auto border-t border-neutral-800">
            <button
              onClick={handleEndSession}
              className="w-full py-2 px-4 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg border border-red-600/30 transition-colors text-sm font-medium"
            >
              End Session
            </button>
          </div>
        )}
      </div>

      {/* Main Game Area */}
      <div className="relative flex-1 flex flex-col felt-bg shadow-inner">

        {/* Mobile HUD Toggle Button */}
        <button
          onClick={() => setShowMobileHUD(!showMobileHUD)}
          className="lg:hidden absolute top-2 right-2 z-50 bg-neutral-800/90 backdrop-blur text-white px-3 py-2 rounded-lg border border-neutral-700 text-sm flex items-center gap-2"
        >
          <span className="text-emerald-400 font-mono">TC: {gameState?.trueCount?.toFixed(1) || '0.0'}</span>
          <svg className={`w-4 h-4 transition-transform ${showMobileHUD ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Mobile HUD Dropdown */}
        {showMobileHUD && (
          <div className="lg:hidden absolute top-12 right-2 left-2 z-40 bg-neutral-800/95 backdrop-blur rounded-xl border border-neutral-700 p-4 shadow-xl">
            <MobileHUD
              gameState={gameState}
              sessionStats={sessionStats}
              currentSessionId={currentSessionId}
              onEndSession={handleEndSession}
            />
          </div>
        )}

        {/* Lesson Overlay */}
        <LessonOverlay />

        {/* Dealer Area */}
        <div className="flex-1 flex flex-col items-center justify-center p-4">
            <div className="mb-8">
                <div className="text-xs text-center text-emerald-200/50 mb-2 uppercase tracking-wider">Dealer</div>
                <div className="flex -space-x-12">
                    {gameState?.dealerHand?.cards.map((card, i) => (
                        <Card key={i} card={card} index={i} />
                    ))}
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
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/60 backdrop-blur text-white px-6 py-3 rounded-xl shadow-xl border border-white/10 animate-in fade-in zoom-in duration-300 z-40">
                    {gameState.message}
                </div>
            )}
        </div>

        {/* Controls */}
        <div className="bg-neutral-900/90 backdrop-blur border-t border-neutral-800 p-4">
            <Controls />
        </div>
      </div>

      {/* Right Panel: HUD (Desktop only) */}
      <div className="hidden lg:block w-80 bg-neutral-900 border-l border-neutral-800 p-4">
        <HUD />
      </div>
    </div>
  );
}

// Compact HUD for mobile
function MobileHUD({ gameState, sessionStats, currentSessionId, onEndSession }) {
  if (!gameState) return null;

  const { runningCount, trueCount, decksRemaining, recommendation } = gameState;
  const edge = (trueCount * 0.5) - 0.5;

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-4 gap-2 text-center">
        <div className="bg-neutral-700/50 rounded-lg p-2">
          <div className="text-xs text-neutral-400">RC</div>
          <div className="text-lg font-mono font-bold text-white">{runningCount}</div>
        </div>
        <div className="bg-emerald-900/30 rounded-lg p-2 border border-emerald-500/30">
          <div className="text-xs text-neutral-400">TC</div>
          <div className="text-lg font-mono font-bold text-emerald-400">{trueCount.toFixed(1)}</div>
        </div>
        <div className="bg-neutral-700/50 rounded-lg p-2">
          <div className="text-xs text-neutral-400">Decks</div>
          <div className="text-lg font-mono font-bold text-white">{decksRemaining.toFixed(1)}</div>
        </div>
        <div className="bg-neutral-700/50 rounded-lg p-2">
          <div className="text-xs text-neutral-400">Edge</div>
          <div className={`text-lg font-mono font-bold ${edge > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {edge > 0 ? '+' : ''}{edge.toFixed(1)}%
          </div>
        </div>
      </div>

      {recommendation?.action && (
        <div className="bg-neutral-700/50 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-neutral-400">Recommended:</span>
            <span className="text-lg font-bold text-white">{recommendation.action}</span>
          </div>
          <div className="text-xs text-neutral-400 mt-1">{recommendation.reason}</div>
        </div>
      )}

      <div className="flex justify-between items-center text-xs text-neutral-400 pt-2 border-t border-neutral-700">
        <div>
          <span>Session: {sessionStats?.handsPlayed || 0} hands</span>
          <span className="mx-2">•</span>
          <span>
            Accuracy: {sessionStats?.correctPlays + sessionStats?.mistakes > 0
              ? `${((sessionStats.correctPlays / (sessionStats.correctPlays + sessionStats.mistakes)) * 100).toFixed(0)}%`
              : '-'}
          </span>
        </div>
        {currentSessionId && (
          <button
            onClick={onEndSession}
            className="px-3 py-1 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded border border-red-600/30 text-xs"
          >
            End
          </button>
        )}
      </div>
    </div>
  );
}

// Session Summary Modal
function SessionSummaryModal({ result, onClose }) {
  const profit = result.net_profit || 0;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-neutral-800 rounded-xl max-w-md w-full p-6 shadow-2xl border border-neutral-700">
        <h2 className="text-2xl font-bold text-white mb-6 text-center">Session Complete!</h2>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-neutral-700/50 rounded-lg p-4 text-center">
            <div className="text-sm text-neutral-400 mb-1">Hands Played</div>
            <div className="text-2xl font-bold text-white">{result.hands_played || 0}</div>
          </div>
          <div className="bg-neutral-700/50 rounded-lg p-4 text-center">
            <div className="text-sm text-neutral-400 mb-1">Accuracy</div>
            <div className={`text-2xl font-bold ${result.accuracy >= 90 ? 'text-green-400' : result.accuracy >= 70 ? 'text-yellow-400' : 'text-red-400'}`}>
              {result.accuracy?.toFixed(1) || 0}%
            </div>
          </div>
        </div>

        <div className={`text-center p-4 rounded-lg mb-6 ${profit >= 0 ? 'bg-green-900/30 border border-green-600/30' : 'bg-red-900/30 border border-red-600/30'}`}>
          <div className="text-sm text-neutral-400 mb-1">Net Profit/Loss</div>
          <div className={`text-3xl font-bold ${profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {profit >= 0 ? '+' : ''}${profit.toFixed(0)}
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium transition-colors"
          >
            New Session
          </button>
          <a
            href="/review"
            className="flex-1 py-3 bg-neutral-700 hover:bg-neutral-600 text-white rounded-lg font-medium transition-colors text-center"
          >
            View History
          </a>
        </div>
      </div>
    </div>
  );
}
