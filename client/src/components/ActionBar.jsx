import { useState, useEffect } from 'react';

const BTN = 'px-5 py-2 text-sm rounded font-bold uppercase tracking-wide transition';

export default function ActionBar({ gameState, playerId, onAction, onNextHand, isHost }) {
  const [raiseAmount, setRaiseAmount] = useState(40);
  const [secondsLeft, setSecondsLeft] = useState(null);
  const mySeat = gameState?.seats?.find((s) => s.playerId === playerId);
  const isMyTurn = mySeat && gameState.activeIndex === mySeat.index;
  const callAmount = mySeat ? gameState.currentBet - mySeat.currentBet : 0;
  const canAct = isMyTurn && !mySeat?.hasFolded && !mySeat?.isAllIn && gameState.phase !== 'showdown' && gameState.phase !== 'waiting';

  useEffect(() => {
    if (!gameState.actionDeadline || !canAct) {
      setSecondsLeft(null);
      return;
    }
    const tick = () => {
      setSecondsLeft(Math.max(0, Math.ceil((gameState.actionDeadline - Date.now()) / 1000)));
    };
    tick();
    const id = setInterval(tick, 250);
    return () => clearInterval(id);
  }, [gameState.actionDeadline, canAct]);

  if (gameState.phase === 'waiting') return null;

  if (gameState.phase === 'showdown') {
    return (
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <p className="text-white/70 text-sm text-center">{gameState.winMessage}</p>
        {isHost && (
          <button type="button" onClick={onNextHand} className={`${BTN} bg-emerald-600 hover:bg-emerald-500 text-white shrink-0`}>
            Next Hand
          </button>
        )}
        {!isHost && <span className="text-white/30 text-sm shrink-0">Waiting for host...</span>}
      </div>
    );
  }

  if (!canAct) {
    return (
      <div className="text-center text-white/35 py-1 text-sm">
        {mySeat?.hasFolded ? 'You folded — watching the hand' : 'Waiting for other players...'}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2">
      {secondsLeft !== null && (
        <div className={`font-mono text-lg font-bold ${secondsLeft <= 5 ? 'text-red-400 animate-pulse' : 'text-white/50'}`}>
          {secondsLeft}s
        </div>
      )}
      <div className="flex flex-wrap items-center justify-center gap-2">
        <button type="button" onClick={() => onAction('fold')} className={`${BTN} bg-[#3a3a3a] hover:bg-[#4a4a4a] text-white border border-white/10`}>
          Fold
        </button>

        {callAmount === 0 ? (
          <button type="button" onClick={() => onAction('check')} className={`${BTN} bg-emerald-600 hover:bg-emerald-500 text-white`}>
            Check
          </button>
        ) : (
          <button type="button" onClick={() => onAction('call')} className={`${BTN} bg-emerald-600 hover:bg-emerald-500 text-white`}>
            Call {callAmount}
          </button>
        )}

        <div className="flex items-center gap-1">
          <input
            type="number"
            value={raiseAmount}
            onChange={(e) => setRaiseAmount(Math.max(gameState.minRaise, parseInt(e.target.value) || 0))}
            min={gameState.minRaise}
            step={10}
            className="w-16 px-2 py-2 text-sm rounded bg-[#2a2a2a] border border-white/15 text-white text-center focus:outline-none focus:border-emerald-500 font-mono"
          />
          <button type="button" onClick={() => onAction('raise', raiseAmount)} className={`${BTN} bg-emerald-600 hover:bg-emerald-500 text-white`}>
            Raise
          </button>
        </div>

        <button type="button" onClick={() => onAction('all-in')} className={`${BTN} bg-emerald-700 hover:bg-emerald-600 text-white`}>
          All In
        </button>
      </div>
    </div>
  );
}
