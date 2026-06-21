import { useMemo, useRef } from 'react';
import Card from './Card';
import PlayerSeat from './PlayerSeat';
import ActionBar from './ActionBar';
import TableChipLayer from './TableChipLayer';
import DripLabLogo from './DripLabLogo';
import ThemeToggle from './ThemeToggle';
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
    <div className="h-dvh bg-zinc-100 dark:bg-black text-gray-900 dark:text-white relative overflow-hidden select-none transition-colors duration-200">
      <div className="absolute top-0 left-0 right-0 z-40 flex items-center justify-between gap-2 px-3 py-2.5 sm:px-4 sm:py-3 pointer-events-none safe-top">
        <div className="pointer-events-auto flex items-center gap-3 min-w-0">
          <DripLabLogo size="sm" className="sm:hidden" />
          <DripLabLogo size="md" className="hidden sm:block" />
        </div>

        <div className="pointer-events-auto flex items-center gap-2 shrink-0">
          <ThemeToggle />
          <div className="hidden sm:block text-right text-[11px] text-gray-500 dark:text-white/50 space-y-0.5">
            <div>
              OWNER: <span className="text-gray-800 dark:text-white/80 uppercase">{hostSeat?.name || 'Host'}</span>
            </div>
            <div className="font-mono">
              NLH ~ 10 / 20 · {room?.name || 'Table'} · {PHASE_LABELS[gameState.phase]}
            </div>
            <div className="text-gray-400 dark:text-white/30 font-mono">
              {room?.id} · {room?.playerCount}/{totalSeats}
              {room?.botCount > 0 && ` · ${room.botCount} bots`}
            </div>
          </div>
          <div className="sm:hidden flex flex-col items-end gap-1 text-[10px] text-gray-500 dark:text-white/45 font-mono leading-tight">
            <span className="px-2 py-0.5 rounded-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10">
              {PHASE_LABELS[gameState.phase]} · {room?.playerCount}/{totalSeats}
            </span>
            <span className="text-gray-400 dark:text-white/30 truncate max-w-[9rem]">{room?.id}</span>
          </div>
          <button
            type="button"
            onClick={onLeave}
            className="sm:hidden px-3 py-1.5 rounded-lg bg-black/5 dark:bg-[#2a2a2a] border border-black/10 dark:border-white/10 text-[10px] font-semibold uppercase tracking-wide text-gray-700 dark:text-white/70"
          >
            Leave
          </button>
        </div>
      </div>

      <div className="absolute left-3 top-16 z-40 hidden sm:flex flex-col gap-3 pointer-events-auto">
        <SidebarBtn label="Leave" onClick={onLeave} />
        {isWaiting && isHost && (
          <>
            <SidebarBtn label="+ Bot" onClick={onAddBot} />
            {(room?.botCount ?? 0) > 0 && <SidebarBtn label="− Bot" onClick={onRemoveBot} />}
          </>
        )}
      </div>

      {isWaiting && isHost && (
        <div className="absolute right-3 top-16 z-40 flex sm:hidden gap-2 pointer-events-auto">
          <MobileIconBtn label="+ Bot" onClick={onAddBot} />
          {(room?.botCount ?? 0) > 0 && <MobileIconBtn label="− Bot" onClick={onRemoveBot} />}
        </div>
      )}

      <div className="absolute inset-0 flex items-center justify-center px-2 pt-12 pb-[10.5rem] sm:p-6 sm:pt-14 sm:pb-28">
        <div
          ref={tableRef}
          className="relative w-full max-w-[min(100%,34rem)] sm:max-w-4xl aspect-[2405/1772]"
        >
          <img
            src="/poker-table.png"
            alt=""
            className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none drop-shadow-[0_12px_40px_rgba(0,0,0,0.55)]"
            draggable={false}
          />

          <div className="absolute inset-[22%_18%_28%_18%] z-10 flex flex-col items-center justify-center gap-1.5 sm:gap-2">
            {!isWaiting && gameState.pot > 0 && (
              <div className="px-3 sm:px-4 py-0.5 sm:py-1 rounded-full bg-black/60 border border-white/15 shadow-lg">
                <span className="text-white text-sm sm:text-base font-mono font-bold tracking-wide">
                  {gameState.pot.toLocaleString()}
                </span>
              </div>
            )}
            {!isWaiting && gameState.communityCards?.length > 0 && (
              <div className="flex gap-1 sm:gap-1.5 items-end justify-center flex-nowrap w-full max-w-full">
                {gameState.communityCards.map((card, i) => (
                  <div key={i} className="board-card-deal shrink-0" style={{ animationDelay: `${i * 80}ms` }}>
                    <Card card={card} size="board" />
                  </div>
                ))}
              </div>
            )}
            {gameState.handNumber > 0 && !isWaiting && (
              <span className="text-white/50 text-[10px] sm:text-xs font-mono tracking-wide drop-shadow-md">
                Hand #{gameState.handNumber}
              </span>
            )}
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
        <div className="absolute bottom-0 left-0 right-0 z-40 px-2 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 sm:px-4 sm:pb-4 bg-gradient-to-t from-zinc-200/95 via-zinc-100/80 to-transparent dark:from-black/90 dark:via-black/70 dark:to-transparent">
          <ActionBar
            gameState={gameState}
            playerId={playerId}
            onAction={onAction}
            onNextHand={onNextHand}
            isHost={isHost}
          />
        </div>
      )}

      <div className="absolute bottom-4 left-4 z-30 max-w-xs pointer-events-none hidden sm:block">
        <div className="bg-black/5 dark:bg-black/40 rounded px-3 py-2 text-[11px] text-gray-500 dark:text-white/35 font-mono">
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
      className="flex flex-col items-center gap-1 text-[9px] text-gray-500 dark:text-white/40 hover:text-gray-800 dark:hover:text-white/70 transition uppercase tracking-wider"
    >
      <span className="w-9 h-9 rounded-full bg-black/5 dark:bg-[#2a2a2a] border border-black/10 dark:border-white/10 flex items-center justify-center text-xs text-gray-700 dark:text-white/60">
        {label.charAt(0)}
      </span>
      {label}
    </button>
  );
}

function MobileIconBtn({ label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="px-3 py-1.5 rounded-lg bg-black/5 dark:bg-[#2a2a2a] border border-black/10 dark:border-white/10 text-[10px] font-semibold uppercase tracking-wide text-gray-700 dark:text-white/70"
    >
      {label}
    </button>
  );
}
