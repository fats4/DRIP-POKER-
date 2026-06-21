import { useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';

function getServerUrl() {
  if (import.meta.env.VITE_SERVER_URL) return import.meta.env.VITE_SERVER_URL;
  // Production: frontend and API share the same host
  if (import.meta.env.PROD) return window.location.origin;
  // Dev: Vite on :5173, game server on :3001
  const { protocol, hostname } = window.location;
  return `${protocol}//${hostname}:3001`;
}

export function useSocket() {
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const [playerId, setPlayerId] = useState(null);

  useEffect(() => {
    const socket = io(getServerUrl(), { transports: ['websocket', 'polling'] });
    socketRef.current = socket;

    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));
    socket.on('connected', ({ playerId: id }) => setPlayerId(id));

    return () => socket.disconnect();
  }, []);

  const emit = useCallback((event, data) => {
    return new Promise((resolve) => {
      socketRef.current?.emit(event, data, resolve);
    });
  }, []);

  const on = useCallback((event, handler) => {
    socketRef.current?.on(event, handler);
    return () => socketRef.current?.off(event, handler);
  }, []);

  return { connected, playerId, emit, on, socket: socketRef };
}
