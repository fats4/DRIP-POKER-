import { useState } from 'react';

export default function ActionBar({ gameState, playerId, onAction, onNextHand, isHost }) {
  const [raiseAmount, setRaiseAmount] = useState(40);
  const mySeat = gameState?.seats?.find((s) => s.playerId === playerId);
  const isMyTurn = mySeat && gameState.activeIndex === mySeat.index;
  const callAmount = mySeat ? gameState.currentBet - mySeat.currentBet : 0;
  const canAct = isMyTurn && !mySeat?.hasFolded && !mySeat?.isAllIn && gameState.phase !== 'showdown' && gameState.phase !== 'waiting';

  if (gameState.phase === 'showdown') {
    return (
      <div className="flex flex-col items-center gap-3 p-4">
        <p className="text-gold-light text-lg font-display">{gameState.winMessage}</p>
        {isHost && (
          <button
            onClick={onNextHand}
            className="px-8 py-3 bg-gold hover:bg-gold-light text-gray-900 font-bold rounded-xl transition shadow-lg"
          >
            Next Hand
          </button>
        )}
        {!isHost && <p className="text-white/50 text-sm">Waiting for host to start the next hand...</p>}
      </div>
    );
  }

  if (gameState.phase === 'waiting') return null;

  if (!canAct) {
    return (
      <div className="text-center text-white/50 py-4">
        {mySeat?.hasFolded ? 'You folded' : 'Waiting for other players...'}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center justify-center gap-3 p-4 bg-gray-900/80 rounded-2xl border border-white/10">
      <button
        onClick={() => onAction('fold')}
        className="px-6 py-2.5 bg-red-700 hover:bg-red-600 rounded-xl font-semibold transition"
      >
        Fold
      </button>

      {callAmount === 0 ? (
        <button
          onClick={() => onAction('check')}
          className="px-6 py-2.5 bg-gray-600 hover:bg-gray-500 rounded-xl font-semibold transition"
        >
          Check
        </button>
      ) : (
        <button
          onClick={() => onAction('call')}
          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 rounded-xl font-semibold transition"
        >
          Call {callAmount}
        </button>
      )}

      <div className="flex items-center gap-2">
        <input
          type="number"
          value={raiseAmount}
          onChange={(e) => setRaiseAmount(Math.max(gameState.minRaise, parseInt(e.target.value) || 0))}
          min={gameState.minRaise}
          step={10}
          className="w-20 px-2 py-2 rounded-lg bg-gray-800 border border-white/20 text-center"
        />
        <button
          onClick={() => onAction('raise', raiseAmount)}
          className="px-6 py-2.5 bg-green-700 hover:bg-green-600 rounded-xl font-semibold transition"
        >
          Raise
        </button>
      </div>

      <button
        onClick={() => onAction('all-in')}
        className="px-6 py-2.5 bg-purple-700 hover:bg-purple-600 rounded-xl font-semibold transition"
      >
        All In
      </button>
    </div>
  );
}
