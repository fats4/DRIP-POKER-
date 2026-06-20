import { v4 as uuidv4 } from 'uuid';
import { PokerGame, STARTING_CHIPS } from './PokerGame.js';

export class Room {
  constructor(id, name, maxSeats, hostId) {
    this.id = id;
    this.name = name;
    this.maxSeats = Math.min(Math.max(maxSeats, 1), 10);
    this.hostId = hostId;
    this.seats = Array.from({ length: this.maxSeats }, () => ({
      player: null,
      holeCards: [],
      currentBet: 0,
      totalBetThisHand: 0,
      hasFolded: false,
      isAllIn: false,
      lastAction: null,
      handResult: null,
    }));
    this.game = new PokerGame(this);
    this.createdAt = Date.now();
  }

  addPlayer(playerId, playerName, preferredSeat = null) {
    if (this.getPlayerSeat(playerId) >= 0) {
      return { ok: false, error: 'Already seated at the table' };
    }

    let seatIndex = preferredSeat;
    if (seatIndex !== null && (seatIndex < 0 || seatIndex >= this.maxSeats || this.seats[seatIndex].player)) {
      seatIndex = null;
    }
    if (seatIndex === null) {
      seatIndex = this.seats.findIndex((s) => !s.player);
    }
    if (seatIndex < 0) return { ok: false, error: 'Table is full' };

    this.seats[seatIndex].player = {
      id: playerId,
      name: playerName,
      chips: STARTING_CHIPS,
    };

    return { ok: true, seatIndex };
  }

  removePlayer(playerId) {
    const idx = this.getPlayerSeat(playerId);
    if (idx < 0) return { ok: false, error: 'Not seated at the table' };

    if (this.game.phase !== 'waiting' && this.game.phase !== 'showdown') {
      this.game.processAction(playerId, 'fold');
    }

    this.seats[idx].player = null;
    this.seats[idx].holeCards = [];

    if (this.hostId === playerId) {
      const remaining = this.seats.find((s) => s.player);
      this.hostId = remaining?.player?.id || null;
    }

    return { ok: true };
  }

  getPlayerSeat(playerId) {
    return this.seats.findIndex((s) => s.player?.id === playerId);
  }

  getPlayerCount() {
    return this.seats.filter((s) => s.player).length;
  }

  toPublicInfo() {
    return {
      id: this.id,
      name: this.name,
      maxSeats: this.maxSeats,
      playerCount: this.getPlayerCount(),
      hostId: this.hostId,
      phase: this.game.phase,
    };
  }
}

export class RoomManager {
  constructor() {
    this.rooms = new Map();
    this.playerRooms = new Map();
  }

  createRoom(hostId, hostName, roomName, maxSeats = 6) {
    const id = uuidv4().slice(0, 8).toUpperCase();
    const room = new Room(id, roomName || `Table ${id}`, maxSeats, hostId);
    this.rooms.set(id, room);
    room.addPlayer(hostId, hostName, 0);
    this.playerRooms.set(hostId, id);
    return room;
  }

  getRoom(roomId) {
    return this.rooms.get(roomId.toUpperCase()) || null;
  }

  joinRoom(roomId, playerId, playerName, seatIndex = null) {
    const room = this.getRoom(roomId);
    if (!room) return { ok: false, error: 'Room not found' };

    const existing = this.playerRooms.get(playerId);
    if (existing && existing !== room.id) {
      this.leaveRoom(playerId);
    }

    const result = room.addPlayer(playerId, playerName, seatIndex);
    if (result.ok) {
      this.playerRooms.set(playerId, room.id);
    }
    return result;
  }

  leaveRoom(playerId) {
    const roomId = this.playerRooms.get(playerId);
    if (!roomId) return { ok: false, error: 'Not in any room' };

    const room = this.rooms.get(roomId);
    if (!room) {
      this.playerRooms.delete(playerId);
      return { ok: true };
    }

    room.removePlayer(playerId);
    this.playerRooms.delete(playerId);

    if (room.getPlayerCount() === 0) {
      this.rooms.delete(roomId);
    }

    return { ok: true, roomId: room.id };
  }

  getRoomForPlayer(playerId) {
    const roomId = this.playerRooms.get(playerId);
    return roomId ? this.rooms.get(roomId) : null;
  }

  listRooms() {
    return Array.from(this.rooms.values()).map((r) => r.toPublicInfo());
  }
}
