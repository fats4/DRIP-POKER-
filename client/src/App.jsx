import { useEffect, useState, useCallback } from 'react';
import { useSocket } from './hooks/useSocket';
import Lobby from './components/Lobby';
import PokerTable from './components/PokerTable';

const EMPTY_STATE = {
  phase: 'waiting',
  communityCards: [],
  pot: 0,
  seats: [],
  handNumber: 0,
};

export default function App() {
  const { connected, playerId, emit, on } = useSocket();
  const [view, setView] = useState('lobby');
  const [rooms, setRooms] = useState([]);
  const [room, setRoom] = useState(null);
  const [gameState, setGameState] = useState(EMPTY_STATE);
  const [error, setError] = useState('');

  useEffect(() => {
    const unsubList = on('roomList', setRooms);
    const unsubState = on('gameState', setGameState);
    return () => {
      unsubList?.();
      unsubState?.();
    };
  }, [on]);

  const handleCreateRoom = useCallback(async (playerName, roomName, maxSeats) => {
    setError('');
    const result = await emit('createRoom', { playerName, roomName, maxSeats });
    if (result?.ok) {
      setRoom(result.room);
      setView('table');
    } else {
      setError(result?.error || 'Failed to create table');
    }
  }, [emit]);

  const handleJoinRoom = useCallback(async (roomId, playerName) => {
    setError('');
    const result = await emit('joinRoom', { roomId, playerName });
    if (result?.ok) {
      setRoom(result.room);
      setView('table');
    } else {
      setError(result?.error || 'Failed to join table');
    }
  }, [emit]);

  const handleLeave = useCallback(async () => {
    await emit('leaveRoom', {});
    setRoom(null);
    setGameState(EMPTY_STATE);
    setView('lobby');
  }, [emit]);

  const handleStart = useCallback(async () => {
    const result = await emit('startGame', {});
    if (!result?.ok) setError(result?.error || 'Failed to start game');
  }, [emit]);

  const handleAction = useCallback(async (action, amount) => {
    await emit('action', { action, amount });
  }, [emit]);

  const handleNextHand = useCallback(async () => {
    await emit('nextHand', {});
  }, [emit]);

  const handleAddBot = useCallback(async () => {
    const result = await emit('addBot', {});
    if (result?.ok && result.room) setRoom(result.room);
    else if (!result?.ok) setError(result?.error || 'Failed to add bot');
  }, [emit]);

  const handleRemoveBot = useCallback(async () => {
    const result = await emit('removeBot', {});
    if (result?.ok && result.room) setRoom(result.room);
    else if (!result?.ok) setError(result?.error || 'Failed to remove bot');
  }, [emit]);

  if (view === 'table' && room) {
    return (
      <PokerTable
        gameState={gameState}
        room={room}
        playerId={playerId}
        isHost={room.hostId === playerId}
        onAction={handleAction}
        onStart={handleStart}
        onNextHand={handleNextHand}
        onLeave={handleLeave}
        onAddBot={handleAddBot}
        onRemoveBot={handleRemoveBot}
      />
    );
  }

  return (
    <Lobby
      connected={connected}
      rooms={rooms}
      onCreateRoom={handleCreateRoom}
      onJoinRoom={handleJoinRoom}
      error={error}
    />
  );
}
