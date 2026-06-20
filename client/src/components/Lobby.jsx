import { useState } from 'react';

export default function Lobby({ connected, rooms, onCreateRoom, onJoinRoom, error }) {
  const [playerName, setPlayerName] = useState('');
  const [roomName, setRoomName] = useState('');
  const [maxSeats, setMaxSeats] = useState(6);
  const [joinRoomId, setJoinRoomId] = useState('');
  const [mode, setMode] = useState('create');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!playerName.trim()) return;
    if (mode === 'create') {
      onCreateRoom(playerName.trim(), roomName.trim() || undefined, maxSeats);
    } else {
      onJoinRoom(joinRoomId.trim(), playerName.trim());
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-gray-950 via-felt-dark to-gray-950">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <span className="text-5xl">♠</span>
            <h1 className="text-4xl font-display font-bold text-gold">PokerLabs</h1>
            <span className="text-5xl text-red-500">♥</span>
          </div>
          <p className="text-white/60">Texas Hold&apos;em Online — 1 to 10 Players</p>
          <div className={`mt-2 inline-flex items-center gap-2 text-sm ${connected ? 'text-green-400' : 'text-red-400'}`}>
            <span className={`w-2 h-2 rounded-full ${connected ? 'bg-green-400' : 'bg-red-400'}`} />
            {connected ? 'Connected to server' : 'Connecting...'}
          </div>
        </div>

        <div className="bg-gray-900/80 rounded-2xl border border-white/10 p-6 shadow-2xl backdrop-blur">
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setMode('create')}
              className={`flex-1 py-2 rounded-xl font-medium transition ${mode === 'create' ? 'bg-gold text-gray-900' : 'bg-white/5 text-white/60 hover:bg-white/10'}`}
            >
              Create Table
            </button>
            <button
              onClick={() => setMode('join')}
              className={`flex-1 py-2 rounded-xl font-medium transition ${mode === 'join' ? 'bg-gold text-gray-900' : 'bg-white/5 text-white/60 hover:bg-white/10'}`}
            >
              Join Table
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-white/60 mb-1">Your Name</label>
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Enter your name..."
                maxLength={20}
                className="w-full px-4 py-3 rounded-xl bg-gray-800 border border-white/10 focus:border-gold focus:outline-none transition"
                required
              />
            </div>

            {mode === 'create' ? (
              <>
                <div>
                  <label className="block text-sm text-white/60 mb-1">Table Name (optional)</label>
                  <input
                    type="text"
                    value={roomName}
                    onChange={(e) => setRoomName(e.target.value)}
                    placeholder="VIP Table"
                    maxLength={30}
                    className="w-full px-4 py-3 rounded-xl bg-gray-800 border border-white/10 focus:border-gold focus:outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-sm text-white/60 mb-1">
                    Seat Count: <span className="text-gold font-bold">{maxSeats}</span>
                  </label>
                  <input
                    type="range"
                    min={1}
                    max={10}
                    value={maxSeats}
                    onChange={(e) => setMaxSeats(parseInt(e.target.value))}
                    className="w-full accent-gold"
                  />
                  <div className="flex justify-between text-xs text-white/40 mt-1">
                    <span>1</span>
                    <span>10</span>
                  </div>
                </div>
              </>
            ) : (
              <div>
                <label className="block text-sm text-white/60 mb-1">Room Code</label>
                <input
                  type="text"
                  value={joinRoomId}
                  onChange={(e) => setJoinRoomId(e.target.value.toUpperCase())}
                  placeholder="ABC12345"
                  maxLength={8}
                  className="w-full px-4 py-3 rounded-xl bg-gray-800 border border-white/10 focus:border-gold focus:outline-none transition font-mono tracking-widest uppercase"
                  required
                />
              </div>
            )}

            {error && (
              <div className="px-4 py-3 rounded-xl bg-red-900/30 border border-red-500/30 text-red-300 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={!connected}
              className="w-full py-3.5 bg-gold hover:bg-gold-light disabled:opacity-50 disabled:cursor-not-allowed text-gray-900 font-bold rounded-xl transition shadow-lg"
            >
              {mode === 'create' ? 'Create & Join Table' : 'Join Table'}
            </button>
          </form>
        </div>

        {rooms.length > 0 && (
          <div className="mt-6 bg-gray-900/60 rounded-2xl border border-white/10 p-4">
            <h3 className="text-sm font-medium text-white/60 mb-3">Active Tables</h3>
            <div className="space-y-2">
              {rooms.map((room) => (
                <button
                  key={room.id}
                  onClick={() => {
                    setMode('join');
                    setJoinRoomId(room.id);
                  }}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 transition text-left"
                >
                  <div>
                    <span className="font-medium">{room.name}</span>
                    <span className="text-white/40 text-sm ml-2 font-mono">{room.id}</span>
                  </div>
                  <span className="text-gold text-sm">
                    {room.playerCount}/{room.maxSeats}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6 text-center text-white/30 text-xs">
          <p>Blinds: 10/20 · Starting chips: 1,000 · Texas Hold&apos;em</p>
          <p className="mt-1">Minimum 2 players required to start a hand</p>
        </div>
      </div>
    </div>
  );
}
