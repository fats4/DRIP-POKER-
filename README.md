# PokerLabs — Texas Hold'em Online

Multiplayer online poker website supporting **1 to 10 players** per table.

Built with **Vite + React** (frontend) and **Express + Socket.io** (backend).

## Features

- Full Texas Hold'em betting (fold, check, call, raise, all-in)
- Real-time multiplayer via WebSocket
- Configurable table size (1–10 seats)
- **AI bot players** — host can add/remove bots for solo or practice games
- Automatic hand evaluation (pair through royal flush)
- Modern poker table UI with cards and chips
- Blinds 10/20, starting chips 1,000

## Requirements

- Node.js 18+

## Setup & Run

```bash
# Install all dependencies
npm run install:all

# Run backend + Vite dev server together
npm run dev
```

- **Frontend (Vite):** http://localhost:5173
- **Backend:** http://localhost:3001

### Run separately

```bash
npm run dev:client   # Vite dev server only
npm run dev:server   # Game server only
```

### Production build (frontend)

```bash
cd client && npm run build
```

Output is written to `client/dist/`.

## How to Play

1. Open http://localhost:5173
2. Enter your name
3. **Create Table** — choose seat count (1–10), or **Join Table** with a room code
4. Share the room code with friends (open another browser tab)
5. Host clicks **Start Game** (minimum 2 players — add bots if playing solo)
6. Play poker!

## Multiplayer Testing

Open 2+ browser tabs at http://localhost:5173. Create a table in the first tab, then join using the room code in the other tab(s).

## Project Structure

```
pokerlabs/
├── client/          # Vite + React + Tailwind
│   ├── index.html   # Vite entry point
│   ├── vite.config.js
│   └── src/
├── server/          # Express + Socket.io
│   └── game/        # Poker game logic
└── package.json
```

## Notes

- For educational/entertainment purposes only — not real-money gambling
- Minimum 2 players required to start a hand
- Auto-timeout: checks when possible, folds when a call is required
