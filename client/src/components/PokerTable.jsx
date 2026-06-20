import Card from './Card';
import PlayerSeat from './PlayerSeat';
import ActionBar from './ActionBar';

// Seat positions around an oval table (percentage-based)
const SEAT_POSITIONS = {
  1: ['bottom-[8%] left-1/2'],
  2: ['bottom-[8%] left-1/2', 'top-[12%] left-1/2'],
  3: ['bottom-[8%] left-1/2', 'top-[8%] left-[25%]', 'top-[8%] left-[75%]'],
  4: ['bottom-[8%] left-1/2', 'top-[50%] left-[4%]', 'top-[12%] left-1/2', 'top-[50%] left-[96%]'],
  5: ['bottom-[8%] left-1/2', 'bottom-[30%] left-[8%]', 'top-[12%] left-[20%]', 'top-[12%] left-[80%]', 'bottom-[30%] left-[92%]'],
  6: ['bottom-[8%] left-1/2', 'bottom-[25%] left-[6%]', 'top-[15%] left-[15%]', 'top-[15%] left-[85%]', 'bottom-[25%] left-[94%]', 'top-[50%] left-[96%]'],
  7: ['bottom-[8%] left-1/2', 'bottom-[22%] left-[5%]', 'top-[10%] left-[12%]', 'top-[5%] left-1/2', 'top-[10%] left-[88%]', 'bottom-[22%] left-[95%]', 'top-[50%] left-[97%]'],
  8: ['bottom-[8%] left-1/2', 'bottom-[20%] left-[4%]', 'top-[50%] left-[2%]', 'top-[8%] left-[18%]', 'top-[8%] left-[82%]', 'top-[50%] left-[98%]', 'bottom-[20%] left-[96%]', 'bottom-[35%] left-[98%]'],
  9: ['bottom-[8%] left-1/2', 'bottom-[18%] left-[3%]', 'top-[45%] left-[1%]', 'top-[8%] left-[15%]', 'top-[3%] left-1/2', 'top-[8%] left-[85%]', 'top-[45%] left-[99%]', 'bottom-[18%] left-[97%]', 'bottom-[35%] left-[99%]'],
  10: ['bottom-[8%] left-1/2', 'bottom-[16%] left-[2%]', 'bottom-[40%] left-[1%]', 'top-[12%] left-[10%]', 'top-[3%] left-[30%]', 'top-[3%] left-[70%]', 'top-[12%] left-[90%]', 'bottom-[40%] left-[99%]', 'bottom-[16%] left-[98%]', 'top-[50%] left-[99%]'],
};

const PHASE_LABELS = {
  waiting: 'Waiting for Players',
  preflop: 'Pre-Flop',
  flop: 'Flop',
  turn: 'Turn',
  river: 'River',
  showdown: 'Showdown',
};

export default function PokerTable({ gameState, room, playerId, isHost, onAction, onStart, onNextHand, onLeave }) {
  const maxSeats = room?.maxSeats || gameState.seats.length;
  const positions = SEAT_POSITIONS[maxSeats] || SEAT_POSITIONS[6];

  return (
    <div className="min-h-screen flex flex-col">
      <header className="flex items-center justify-between px-6 py-4 bg-gray-900/90 border-b border-white/10">
        <div>
          <h1 className="text-xl font-display text-gold">{room?.name || 'PokerLabs'}</h1>
          <p className="text-white/50 text-sm">
            Room: {room?.id} · {room?.playerCount}/{room?.maxSeats} players
          </p>
        </div>
        <div className="flex items-center gap-4">
          <span className="px-3 py-1 rounded-full bg-felt text-sm font-medium">
            {PHASE_LABELS[gameState.phase] || gameState.phase}
          </span>
          {gameState.phase === 'waiting' && isHost && (
            <button
              onClick={onStart}
              className="px-5 py-2 bg-gold hover:bg-gold-light text-gray-900 font-bold rounded-xl transition"
            >
              Start Game
            </button>
          )}
          <button
            onClick={onLeave}
            className="px-4 py-2 bg-red-900/50 hover:bg-red-800/50 rounded-xl text-sm transition"
          >
            Leave
          </button>
        </div>
      </header>

      <div className="flex-1 relative flex items-center justify-center p-4">
        <div className="relative w-full max-w-4xl aspect-[16/10]">
          {/* Table felt */}
          <div className="absolute inset-[8%] rounded-[50%] bg-gradient-to-br from-felt-light via-felt to-felt-dark border-8 border-amber-900/60 shadow-2xl shadow-black/50">
            <div className="absolute inset-4 rounded-[50%] border border-white/10" />

            {/* Pot & community cards */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-3">
              {gameState.pot > 0 && (
                <div className="bg-black/40 px-4 py-1.5 rounded-full border border-gold/30">
                  <span className="text-gold-light font-bold">Pot: {gameState.pot.toLocaleString()}</span>
                </div>
              )}
              <div className="flex gap-2">
                {gameState.communityCards?.map((card, i) => (
                  <Card key={i} card={card} />
                ))}
                {gameState.phase !== 'waiting' && gameState.communityCards?.length === 0 && (
                  <div className="text-white/30 text-sm mt-4">Community cards</div>
                )}
              </div>
              {gameState.handNumber > 0 && (
                <span className="text-white/40 text-xs">Hand #{gameState.handNumber}</span>
              )}
            </div>
          </div>

          {/* Player seats */}
          {gameState.seats.map((seat, i) => (
            <PlayerSeat
              key={i}
              seat={seat}
              isMe={seat.playerId === playerId}
              position={positions[i] || 'bottom-[8%] left-1/2'}
            />
          ))}
        </div>
      </div>

      <div className="px-4 pb-6 max-w-2xl mx-auto w-full">
        <ActionBar
          gameState={gameState}
          playerId={playerId}
          onAction={onAction}
          onNextHand={onNextHand}
          isHost={isHost}
        />
      </div>
    </div>
  );
}
