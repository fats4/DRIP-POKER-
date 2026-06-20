import express from 'express';
import { createServer } from 'http';
import { networkInterfaces } from 'os';
import { Server } from 'socket.io';
import cors from 'cors';
import { RoomManager } from './game/RoomManager.js';

function getLocalAddresses() {
  const addresses = [];
  for (const iface of Object.values(networkInterfaces())) {
    for (const addr of iface ?? []) {
      if (addr.family === 'IPv4' && !addr.internal) {
        addresses.push(addr.address);
      }
    }
  }
  return addresses;
}

const PORT = process.env.PORT || 3001;
const app = express();
app.use(cors());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', game: 'Texas Hold\'em', maxPlayers: 10 });
});

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
});

const roomManager = new RoomManager();
const players = new Map();

function broadcastRoom(room) {
  for (const seat of room.seats) {
    if (seat.player) {
      const socket = players.get(seat.player.id);
      if (socket) {
        socket.emit('gameState', room.game.getPublicState(seat.player.id));
      }
    }
  }
  io.emit('roomList', roomManager.listRooms());
}

function broadcastRoomList() {
  io.emit('roomList', roomManager.listRooms());
}

setInterval(() => {
  for (const room of roomManager.rooms.values()) {
    if (room.game.phase !== 'waiting' && room.game.phase !== 'showdown') {
      const before = room.game.activeIndex;
      room.game.handleTimeout();
      if (room.game.activeIndex !== before || room.game.phase === 'showdown') {
        broadcastRoom(room);
      }
    }
  }
}, 1000);

io.on('connection', (socket) => {
  const playerId = socket.id;
  players.set(playerId, socket);

  socket.emit('connected', { playerId });
  socket.emit('roomList', roomManager.listRooms());

  socket.on('createRoom', ({ playerName, roomName, maxSeats }, cb) => {
    const name = (playerName || 'Player').slice(0, 20);
    const seats = Math.min(Math.max(parseInt(maxSeats) || 6, 1), 10);
    const room = roomManager.createRoom(playerId, name, roomName, seats);
    socket.join(room.id);
    cb?.({ ok: true, room: room.toPublicInfo() });
    broadcastRoom(room);
  });

  socket.on('joinRoom', ({ roomId, playerName, seatIndex }, cb) => {
    const name = (playerName || 'Player').slice(0, 20);
    const result = roomManager.joinRoom(roomId, playerId, name, seatIndex ?? null);
    if (!result.ok) {
      cb?.(result);
      return;
    }
    const room = roomManager.getRoom(roomId);
    socket.join(room.id);
    cb?.({ ok: true, room: room.toPublicInfo(), seatIndex: result.seatIndex });
    broadcastRoom(room);
  });

  socket.on('leaveRoom', (_data, cb) => {
    const room = roomManager.getRoomForPlayer(playerId);
    const result = roomManager.leaveRoom(playerId);
    if (room) socket.leave(room.id);
    cb?.(result);
    if (room) broadcastRoom(room);
    broadcastRoomList();
  });

  socket.on('startGame', (_data, cb) => {
    const room = roomManager.getRoomForPlayer(playerId);
    if (!room) return cb?.({ ok: false, error: 'Not in a room' });
    if (room.hostId !== playerId) return cb?.({ ok: false, error: 'Only the host can start the game' });

    const result = room.game.startHand();
    cb?.(result);
    if (result.ok) broadcastRoom(room);
  });

  socket.on('nextHand', (_data, cb) => {
    const room = roomManager.getRoomForPlayer(playerId);
    if (!room) return cb?.({ ok: false, error: 'Not in a room' });
    if (room.game.phase !== 'showdown') return cb?.({ ok: false, error: 'Hand is not finished yet' });

    room.game.resetForNewHand();
    cb?.({ ok: true });
    broadcastRoom(room);
  });

  socket.on('action', ({ action, amount }, cb) => {
    const room = roomManager.getRoomForPlayer(playerId);
    if (!room) return cb?.({ ok: false, error: 'Not in a room' });

    const result = room.game.processAction(playerId, action, amount || 0);
    cb?.(result);
    if (result.ok) broadcastRoom(room);
  });

  socket.on('getState', (_data, cb) => {
    const room = roomManager.getRoomForPlayer(playerId);
    if (!room) return cb?.({ ok: false });
    cb?.({ ok: true, state: room.game.getPublicState(playerId), room: room.toPublicInfo() });
  });

  socket.on('disconnect', () => {
    const room = roomManager.getRoomForPlayer(playerId);
    if (room) {
      roomManager.leaveRoom(playerId);
      broadcastRoom(room);
      broadcastRoomList();
    }
    players.delete(playerId);
  });
});

const HOST = process.env.HOST || '0.0.0.0';

httpServer.listen(PORT, HOST, () => {
  console.log(`PokerLabs server running on http://localhost:${PORT}`);
  for (const ip of getLocalAddresses()) {
    console.log(`  Network: http://${ip}:${PORT}`);
  }
});
