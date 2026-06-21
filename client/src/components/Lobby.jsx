import { useState } from 'react';
import LobbyCardBg from './LobbyCardBg';
import DripLabLogo from './DripLabLogo';
import ThemeToggle from './ThemeToggle';

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

  const pickRoom = (id) => {
    setMode('join');
    setJoinRoomId(id);
  };

  return (
    <div className="relative h-dvh lobby-bg text-gray-900 dark:text-white overflow-hidden transition-colors duration-200">
      <LobbyCardBg />

      <div className="absolute top-0 right-0 z-20 p-3 sm:p-4 safe-top">
        <ThemeToggle />
      </div>

      <div className="relative z-10 h-full flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-5xl max-h-[calc(100dvh-2rem)] overflow-y-auto rounded-2xl border border-black/10 dark:border-white/10 bg-white/90 dark:bg-[#0a0a0a]/90 backdrop-blur-md shadow-2xl shadow-black/10 dark:shadow-black/50">
          <div className="grid lg:grid-cols-2 min-h-0">
            <section className="lobby-text px-7 sm:px-9 py-8 lg:py-10 border-b lg:border-b-0 lg:border-r border-black/10 dark:border-white/10 flex flex-col justify-between gap-8">
              <div>
                <div className="flex items-center justify-between gap-3 mb-6">
                  <p className="text-xs font-semibold tracking-[0.18em] uppercase text-emerald-600 dark:text-emerald-400">
                    Texas Hold&apos;em
                  </p>
                  <StatusDot connected={connected} />
                </div>
                <DripLabLogo size="xl" className="mb-4" />
                <p className="text-sm text-gray-600 dark:text-white/65 mt-2 leading-relaxed">
                  Create a private table or join with a room code. Play instantly in your browser.
                </p>
                <div className="flex flex-wrap gap-2 mt-6">
                  <Chip>Blinds 10 / 20</Chip>
                  <Chip>1,000 chips</Chip>
                  <Chip>Up to 10 seats</Chip>
                </div>
              </div>
              <p className="text-xs text-gray-400 dark:text-white/40 hidden lg:block">
                DRIPSTER deck · No download required
              </p>
            </section>

            <section className="lobby-text px-7 sm:px-9 py-8 lg:py-10">
              <div className="flex p-1 rounded-xl bg-black/[0.04] dark:bg-white/[0.05] border border-black/[0.08] dark:border-white/[0.08] mb-6">
                <SegBtn active={mode === 'create'} onClick={() => setMode('create')}>Create table</SegBtn>
                <SegBtn active={mode === 'join'} onClick={() => setMode('join')}>Join table</SegBtn>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <Field label="Display name">
                  <input
                    type="text"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    placeholder="How others see you"
                    maxLength={20}
                    className={INPUT}
                    autoFocus
                    required
                  />
                </Field>

                {mode === 'create' ? (
                  <>
                    <Field label="Table name" optional>
                      <input
                        type="text"
                        value={roomName}
                        onChange={(e) => setRoomName(e.target.value)}
                        placeholder="Friday Night"
                        maxLength={30}
                        className={INPUT}
                      />
                    </Field>
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <label className="text-sm font-semibold text-gray-800 dark:text-white/85">Max seats</label>
                        <span className="text-sm font-bold tabular-nums text-emerald-600 dark:text-emerald-400">{maxSeats}</span>
                      </div>
                      <input
                        type="range"
                        min={1}
                        max={10}
                        value={maxSeats}
                        onChange={(e) => setMaxSeats(parseInt(e.target.value))}
                        className="w-full h-1.5 rounded-full appearance-none bg-black/10 dark:bg-white/10 accent-emerald-500 cursor-pointer"
                      />
                      <div className="flex justify-between text-xs text-gray-500 dark:text-white/50 mt-2 font-medium">
                        <span>1 player</span>
                        <span>10 players</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <Field label="Room code">
                    <input
                      type="text"
                      value={joinRoomId}
                      onChange={(e) => setJoinRoomId(e.target.value.toUpperCase())}
                      placeholder="e.g. A1B2C3D4"
                      maxLength={8}
                      className={`${INPUT} font-mono text-base tracking-[0.25em] uppercase text-center`}
                      required
                    />
                  </Field>
                )}

                {error && (
                  <div className="px-3.5 py-3 rounded-xl bg-red-500/10 border border-red-500/20">
                    <span className="text-red-400 text-sm leading-snug">{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={!connected}
                  className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-[0.99] disabled:opacity-35 disabled:cursor-not-allowed text-[#0a0a0a] text-sm font-semibold transition shadow-lg shadow-emerald-500/20"
                >
                  {!connected ? 'Connecting…' : mode === 'create' ? 'Create & sit down' : 'Join table'}
                </button>
              </form>

              {rooms.length > 0 && (
                <section className="mt-7 pt-6 border-t border-black/10 dark:border-white/10">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-white/65">Live tables</h2>
                    <span className="text-xs text-gray-400 dark:text-white/45 font-medium">{rooms.length} open</span>
                  </div>
                  <ul className="space-y-2 max-h-36 overflow-y-auto">
                    {rooms.map((room) => (
                      <li key={room.id}>
                        <button
                          type="button"
                          onClick={() => pickRoom(room.id)}
                          className="group w-full flex items-center gap-3 px-4 py-2.5 rounded-xl bg-black/[0.03] dark:bg-white/[0.04] hover:bg-black/[0.06] dark:hover:bg-white/[0.08] border border-black/[0.08] dark:border-white/[0.08] hover:border-emerald-500/30 transition text-left"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{room.name}</p>
                            <p className="text-xs font-mono text-gray-400 dark:text-white/45 mt-0.5">{room.id}</p>
                          </div>
                          <div className="shrink-0 text-right">
                            <p className="text-sm font-bold tabular-nums text-gray-800 dark:text-white/85">
                              {room.playerCount}/{room.maxSeats}
                            </p>
                            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-0.5 capitalize">{room.phase || 'waiting'}</p>
                          </div>
                        </button>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

const INPUT =
  'w-full px-4 py-3 rounded-xl bg-white dark:bg-black/50 border border-black/15 dark:border-white/15 text-gray-900 dark:text-white text-[15px] font-medium placeholder:text-gray-400 dark:placeholder:text-white/35 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/25 transition';

function SegBtn({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition ${
        active
          ? 'bg-black/8 dark:bg-white/12 text-gray-900 dark:text-white'
          : 'text-gray-500 dark:text-white/55 hover:text-gray-800 dark:hover:text-white/85'
      }`}
    >
      {children}
    </button>
  );
}

function Field({ label, optional, children }) {
  return (
    <div>
      <label className="flex items-center gap-2 text-sm font-semibold text-gray-800 dark:text-white/85 mb-2">
        {label}
        {optional && <span className="text-gray-400 dark:text-white/40 font-normal text-xs">optional</span>}
      </label>
      {children}
    </div>
  );
}

function Chip({ children }) {
  return (
    <span className="px-2.5 py-1 rounded-full text-xs font-medium text-gray-700 dark:text-white/80 bg-black/[0.05] dark:bg-white/[0.08] border border-black/10 dark:border-white/10">
      {children}
    </span>
  );
}

function StatusDot({ connected }) {
  return (
    <span className={`flex items-center gap-1.5 text-xs font-medium ${connected ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-emerald-500 dark:bg-emerald-400' : 'bg-red-500 dark:bg-red-400'}`} />
      {connected ? 'Online' : 'Connecting…'}
    </span>
  );
}
