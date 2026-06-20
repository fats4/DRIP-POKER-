import Card from './Card';

export default function PlayerSeat({ seat, isMe, position }) {
  const { name, chips, currentBet, hasFolded, isAllIn, lastAction, holeCards, isDealer, isActive, handResult, occupied } = seat;

  if (!occupied) {
    return (
      <div className={`absolute ${position} transform -translate-x-1/2 -translate-y-1/2`}>
        <div className="w-24 h-24 rounded-full border-2 border-dashed border-white/20 flex items-center justify-center">
          <span className="text-white/30 text-xs">Empty</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`absolute ${position} transform -translate-x-1/2 -translate-y-1/2`}>
      <div className={`relative flex flex-col items-center gap-1 ${isActive ? 'active-player rounded-2xl' : ''}`}>
        {isDealer && (
          <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-white text-gray-900 text-xs font-bold flex items-center justify-center shadow z-10">
            D
          </div>
        )}

        <div className={`flex gap-1 ${hasFolded ? 'opacity-40' : ''}`}>
          {holeCards?.map((card, i) => (
            <Card key={i} card={card} small />
          ))}
        </div>

        <div
          className={`px-3 py-2 rounded-xl min-w-[100px] text-center shadow-lg border ${
            isMe
              ? 'bg-gold/20 border-gold'
              : 'bg-gray-900/80 border-white/10'
          } ${hasFolded ? 'opacity-50' : ''}`}
        >
          <div className="font-semibold text-sm truncate max-w-[90px]">
            {name}{isMe && ' (You)'}
          </div>
          <div className="text-gold-light text-xs font-mono">{chips?.toLocaleString()} chips</div>
          {isAllIn && <div className="text-red-400 text-xs font-bold">ALL IN</div>}
          {handResult && <div className="text-green-400 text-xs">{handResult}</div>}
        </div>

        {currentBet > 0 && (
          <div className="bg-yellow-600/90 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow">
            {currentBet}
          </div>
        )}

        {lastAction && (
          <div className="text-white/60 text-xs capitalize">{lastAction}</div>
        )}
      </div>
    </div>
  );
}
