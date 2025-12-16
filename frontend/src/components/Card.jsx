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

export default function Card({ card, index }) {
  if (!card) return null;
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
