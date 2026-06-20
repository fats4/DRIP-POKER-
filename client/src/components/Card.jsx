const SUIT_SYMBOLS = { h: '♥', d: '♦', c: '♣', s: '♠' };
const SUIT_COLORS = { h: 'text-red-500', d: 'text-red-500', c: 'text-gray-900', s: 'text-gray-900' };

export default function Card({ card, small = false }) {
  if (!card) return null;

  if (card.hidden) {
    return (
      <div
        className={`${small ? 'w-10 h-14' : 'w-14 h-20'} rounded-lg bg-gradient-to-br from-blue-800 to-blue-950 border-2 border-blue-600 flex items-center justify-center card-deal shadow-lg`}
      >
        <div className="w-6 h-8 rounded border border-blue-400/30 bg-blue-700/50" />
      </div>
    );
  }

  const size = small ? 'w-10 h-14 text-xs' : 'w-14 h-20 text-sm';
  const isRed = card.suit === 'h' || card.suit === 'd';

  return (
    <div
      className={`${size} rounded-lg bg-white border border-gray-300 flex flex-col items-center justify-between py-1 px-1 card-deal shadow-lg ${isRed ? 'text-red-600' : 'text-gray-900'}`}
    >
      <span className="font-bold leading-none">{card.rank}</span>
      <span className={`text-lg leading-none ${SUIT_COLORS[card.suit]}`}>{SUIT_SYMBOLS[card.suit]}</span>
      <span className="font-bold leading-none rotate-180">{card.rank}</span>
    </div>
  );
}
