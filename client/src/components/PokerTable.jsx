import { useMemo, useRef } from 'react';
import Card from './Card';
import PlayerSeat from './PlayerSeat';
import ActionBar from './ActionBar';
import TableChipLayer from './TableChipLayer';
import { buildSeatLayout, seatPosToStyle } from '../utils/seatLayout';

const PHASE_LABELS = {
  waiting: 'Waiting',
  preflop: 'Pre-Flop',
  flop: 'Flop',
  turn: 'Turn',
  river: 'River',
  showdown: 'Showdown',
};

export default function PokerTable({
  gameState,
  room,
  playerId,
  isHost,
  onAction,
  onStart,
  onNextHand,
  onLeave,
  onAddBot,
  onRemoveBot,
}) {
  const totalSeats = room?.maxSeats || gameState.seats.length;
  const heroSeatIndex = gameState.seats.findIndex((s) => s.playerId === playerId);
  const hostSeat = gameState.seats.find((s) => s.playerId === room?.hostId);
  const isWaiting = gameState.phase === 'waiting';
  const canStart = (room?.playerCount ?? 0) >= 2;
  const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}?room=${room?.id}` : '';
  const tableRef = useRef(null);

  const { positionMap, displayOrder } = useMemo(
    () => buildSeatLayout(gameState.seats, heroSeatIndex),
    [gameState.seats, heroSeatIndex],
  );

  const openSeats = totalSeats - (room?.playerCount ?? 0);

  const copyLink = () => {
    if (shareUrl) navigator.clipboard?.writeText(shareUrl);
  };

  return (
    <div className="h-dvh bg-[#141414] text-white relative overflow-hidden select-none">
      <div className="absolute top-0 left-0 right-0 z-40 flex items-start justify-between px-4 py-3 pointer-events-none">
        <div className="pointer-events-auto">
          <div className="text-lg font-bold tracking-tight text-white/90">
            DRIPSTER<span className="text-white/40 font-normal"> POKER</span>
          </div>
        </div>
        <div className="text-right text-[11px] text-white/50 space-y-0.5 pointer-events-auto">
          <div>
            OWNER: <span className="text-white/80 uppercase">{hostSeat?.name || 'Host'}</span>
          </div>
          <div className="font-mono">
            NLH ~ 10 / 20 · {room?.name || 'Table'} · {PHASE_LABELS[gameState.phase]}
          </div>
          <div className="text-white/30 font-mono">
            {room?.id} · {room?.playerCount}/{totalSeats}
            {room?.botCount > 0 && ` · ${room.botCount} bots`}
          </div>
        </div>
      </div>

      <div className="absolute left-3 top-20 z-40 flex flex-col gap-3 pointer-events-auto">
        <SidebarBtn label="Leave" onClick={onLeave} />
        {isWaiting && isHost && (
          <>
            <SidebarBtn label="+ Bot" onClick={onAddBot} />
            {(room?.botCount ?? 0) > 0 && <SidebarBtn label="− Bot" onClick={onRemoveBot} />}
          </>
        )}
      </div>

      <div className="absolute inset-0 flex items-center justify-center p-6 pt-14 pb-28">
        <div ref={tableRef} className="relative w-full h-full max-w-4xl max-h-[min(100%,720px)] aspect-[16/10]">
          <div className="absolute inset-[2%] rounded-[50%] bg-[#0d0d0d] shadow-[0_8px_40px_rgba(0,0,0,0.6)]" />

          <div className="absolute inset-[6%] rounded-[50%] pn-felt border-[6px] border-[#0a0a0a] z-10">
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-[8%]">
              {!isWaiting && gameState.pot > 0 && (
                <div className="px-4 py-1 rounded-full bg-black/55 border border-white/15 shadow-lg">
                  <span className="text-white text-base font-mono font-bold tracking-wide">
                    {gameState.pot.toLocaleString()}
                  </span>
                </div>
              )}
              {!isWaiting && gameState.communityCards?.length > 0 && (
                <div className="flex gap-1 sm:gap-1.5 items-end justify-center flex-nowrap w-full max-w-[92%]">
                  {gameState.communityCards.map((card, i) => (
                    <div key={i} className="board-card-deal shrink-0" style={{ animationDelay: `${i * 80}ms` }}>
                      <Card card={card} size="board" />
                    </div>
                  ))}
                </div>
              )}
              {gameState.handNumber > 0 && !isWaiting && (
                <span className="text-white/35 text-xs font-mono tracking-wide">Hand #{gameState.handNumber}</span>
              )}
            </div>
          </div>

          {isWaiting && (
            <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none">
              <div className="pointer-events-auto bg-white text-gray-800 rounded-lg shadow-2xl w-[min(92%,420px)] overflow-hidden">
                <div className="px-6 py-5 text-center border-b border-gray-100">
                  <h2 className="text-xl font-semibold text-gray-700">Waiting for others</h2>
                  <p className="text-sm text-gray-400 mt-1">
                    {canStart
                      ? `${room.playerCount} players at the table${openSeats > 0 ? ` · ${openSeats} seats open` : ''}`
                      : 'Need at least 2 players'}
                  </p>
                </div>
                <div className="grid sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-gray-100">
                  <div className="p-5 flex flex-col items-stretch text-center">
                    <p className="text-sm text-gray-500 h-10 flex items-center justify-center px-1">
                      Share this link with your friends!
                    </p>
                    <button
                      type="button"
                      onClick={copyLink}
                      className="w-full py-2.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold uppercase tracking-wide transition"
                    >
                      Copy Link
                    </button>
                    <p className="text-[10px] text-gray-400 mt-2 font-mono truncate h-4">{room?.id}</p>
                  </div>
                  <div className="p-5 flex flex-col items-stretch text-center">
                    <p className="text-sm text-gray-500 h-10 flex items-center justify-center">
                      Ready to play?
                    </p>
                    <div className="min-h-[42px] flex items-stretch">
                      {isHost ? (
                        <button
                          type="button"
                          onClick={onStart}
                          disabled={!canStart}
                          className="w-full py-2.5 rounded bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-bold uppercase tracking-wide transition"
                        >
                          Start Game
                        </button>
                      ) : (
                        <p className="w-full py-2.5 text-sm text-gray-400 flex items-center justify-center">
                          Waiting for host to start...
                        </p>
                      )}
                    </div>
                    <p className="text-[10px] mt-2 h-4 invisible" aria-hidden="true">
                      spacer
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {gameState.seats.map((seat, i) => {
            if (!seat.occupied) return null;
            const style = seatPosToStyle(positionMap.get(i));
            if (!style) return null;

            return (
              <PlayerSeat
                key={i}
                seat={seat}
                seatNumber={displayOrder.get(i) ?? i + 1}
                style={style}
                gamePhase={gameState.phase}
                isHero={seat.playerId === playerId}
                isActive={gameState.activeIndex === i && !isWaiting}
              />
            );
          })}

          <TableChipLayer
            gameState={gameState}
            layoutMap={positionMap}
            tableRef={tableRef}
          />
        </div>
      </div>

      {!isWaiting && (
        <div className="absolute bottom-0 left-0 right-0 z-40 px-4 pb-4 pt-2 bg-gradient-to-t from-black/80 to-transparent">
          <ActionBar
            gameState={gameState}
            playerId={playerId}
            onAction={onAction}
            onNextHand={onNextHand}
            isHost={isHost}
          />
        </div>
      )}

      <div className="absolute bottom-4 left-4 z-30 max-w-xs pointer-events-none">
        <div className="bg-black/40 rounded px-3 py-2 text-[11px] text-white/35 font-mono">
          {isWaiting ? 'DRIPSTER deck · Blinds 10/20' : gameState.winMessage || `Phase: ${PHASE_LABELS[gameState.phase]}`}
        </div>
      </div>
    </div>
  );
}

function SidebarBtn({ label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col items-center gap-1 text-[9px] text-white/40 hover:text-white/70 transition uppercase tracking-wider"
    >
      <span className="w-9 h-9 rounded-full bg-[#2a2a2a] border border-white/10 flex items-center justify-center text-xs text-white/60">
        {label.charAt(0)}
      </span>
      {label}
    </button>
  );
}
