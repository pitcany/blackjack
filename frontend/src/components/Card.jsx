import React from 'react';

const SuitIcon = ({ suit }) => {
    switch(suit) {
        case 'H': return <span className="text-red-500">♥</span>;
        case 'D': return <span className="text-red-500">♦</span>;
        case 'C': return <span className="text-neutral-900">♣</span>;
        case 'S': return <span className="text-neutral-900">♠</span>;
        default: return null;
    }
};

export default function Card({ card, index, faceDown = false }) {
  if (!card && !faceDown) return null;

  // Face-down card (hole card)
  if (faceDown) {
    return (
      <div
        className="relative w-24 h-36 bg-gradient-to-br from-red-800 to-red-900 rounded-lg shadow-xl border-2 border-red-700 transform transition-transform select-none"
        style={{ zIndex: index }}
      >
        {/* Pattern overlay */}
        <div className="absolute inset-2 rounded border border-red-600/30">
          <div className="w-full h-full" style={{
            backgroundImage: `repeating-linear-gradient(
              45deg,
              transparent,
              transparent 4px,
              rgba(255,255,255,0.05) 4px,
              rgba(255,255,255,0.05) 8px
            )`
          }}></div>
        </div>
        {/* Center diamond */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-12 bg-red-700/50 rotate-45 rounded-sm border border-red-600/40"></div>
        </div>
      </div>
    );
  }

  const { rank, suit } = card;

  return (
    <div
        className="relative w-24 h-36 bg-white rounded-lg shadow-xl border border-neutral-200 transform transition-transform hover:-translate-y-2 select-none flex flex-col justify-between p-2"
        style={{
            zIndex: index,
             // Simple fanning effect if needed, but flex -space-x-12 handles overlap
        }}
    >
      <div className="text-lg font-bold leading-none flex flex-col items-center">
        <span>{rank}</span>
        <SuitIcon suit={suit} />
      </div>

      <div className="absolute inset-0 flex items-center justify-center opacity-10">
        <div className="text-6xl"><SuitIcon suit={suit} /></div>
      </div>

      <div className="text-lg font-bold leading-none flex flex-col items-center rotate-180">
        <span>{rank}</span>
        <SuitIcon suit={suit} />
      </div>
    </div>
  );
}
