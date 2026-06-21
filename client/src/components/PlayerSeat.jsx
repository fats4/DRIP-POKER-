import Card from './Card';
import { getSeatCardSize, getSeatStructure } from '../utils/seatLayout';

function HoleCards({ cards, size, hidden, folded, horizontal }) {
  return (
    <div className={`flex items-center justify-center ${folded ? 'opacity-30 grayscale' : ''}`}>
      <div className={horizontal ? 'rotate-[-6deg]' : 'rotate-[-8deg]'}>
        <Card card={hidden ? { hidden: true } : cards[0]} size={size} />
      </div>
      <div className={`${horizontal ? 'rotate-[6deg] -ml-2' : 'rotate-[8deg] -ml-2'}`}>
        <Card card={hidden ? { hidden: true } : cards[1]} size={size} />
      </div>
    </div>
  );
}

export default function PlayerSeat({
  seat,
  seatNumber,
  style,
  gamePhase = 'waiting',
  isHero = false,
  isActive = false,
}) {
  const { name, chips, hasFolded, isAllIn, lastAction, holeCards, isDealer, handResult, occupied, isBot } = seat;
  const isWaiting = gamePhase === 'waiting';
  const cardSize = getSeatCardSize(isHero);
  const structure = getSeatStructure(style, isHero);
  const showCards = holeCards?.length > 0 && !isWaiting;

  if (!occupied) {
    return (
      <div className="absolute z-[5]" style={style}>
        <div className="w-[80px] h-[48px] rounded border border-white/15 bg-black/20 flex items-center justify-center">
          <span className="absolute top-1 left-1.5 text-[9px] text-white/25 font-mono">{seatNumber}</span>
          <span className="text-[9px] text-white/20 uppercase tracking-widest">Open</span>
        </div>
      </div>
    );
  }

  const statusText = isWaiting
    ? 'Waiting'
    : hasFolded
      ? 'Folded'
      : isAllIn
        ? 'All-In'
        : isActive
          ? isHero
            ? 'Your turn'
            : 'Acting'
          : lastAction || (isDealer ? 'Dealer' : '');

  const plateClass = isHero
    ? 'bg-[#252525] border-emerald-500/60 ring-1 ring-emerald-500/30'
    : isActive
      ? 'bg-[#2f2f2f] border-amber-400/70 ring-1 ring-amber-400/40'
      : 'bg-[#282828] border-white/12';

  return (
    <div className="absolute z-20 pointer-events-none" style={style}>
      <div className="relative w-0 h-0">
        {/* Nameplate — outward from table */}
        <div
          className={`absolute z-20 w-[88px] sm:w-[92px] rounded border px-2 py-1 shadow-md pointer-events-auto ${plateClass} ${hasFolded ? 'opacity-45' : ''}`}
          style={structure.badge}
        >
          <span className="absolute top-0.5 left-1 text-[8px] text-white/20 font-mono">{seatNumber}</span>
          {isDealer && (
            <span className="absolute top-0.5 right-1 text-[7px] bg-amber-500/20 text-amber-300 px-1 rounded font-mono">D</span>
          )}
          <div className="pt-1.5 text-center leading-none">
            <div className="text-[11px] sm:text-[10px] font-semibold text-white truncate">
              {name}{isHero && <span className="text-emerald-400"> ★</span>}
            </div>
            {isBot && <div className="text-[7px] text-white/30 uppercase mt-0.5">Bot</div>}
            <div className="text-[13px] sm:text-[12px] font-bold text-white font-mono mt-0.5">{chips?.toLocaleString()}</div>
            {statusText && (
              <div className={`text-[9px] sm:text-[8px] mt-0.5 uppercase tracking-wide truncate ${isActive ? 'text-amber-300' : 'text-white/35'}`}>
                {statusText}
              </div>
            )}
            {handResult && (
              <div className="text-[7px] text-emerald-400 truncate mt-0.5">{handResult}</div>
            )}
          </div>
        </div>

        {/* Hole cards — inward toward center, never overlapping plate */}
        {(isWaiting || showCards) && (
          <div className="absolute z-[8]" style={structure.cards}>
            <HoleCards
              cards={holeCards}
              size={cardSize}
              hidden={isWaiting || (holeCards[0]?.hidden && !isHero)}
              folded={hasFolded}
              horizontal={structure.horizontalCards}
            />
          </div>
        )}
      </div>
    </div>
  );
}
