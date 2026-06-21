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

## Deploy Online (Public Access)

Your app needs a **hosting server** with WebSocket support (Socket.io). Local Wi‑Fi only works on the same network.

### Option A — Render.com (recommended, free tier)

1. Push code to GitHub: [fats4/DRIP-POKER-](https://github.com/fats4/DRIP-POKER-.git)
2. Go to [render.com](https://render.com) → **New** → **Web Service**
3. Connect your GitHub repo `DRIP-POKER-`
4. Use these settings:
   - **Build Command:** `npm run install:all && npm run build`
   - **Start Command:** `npm start`
   - **Environment:** add `NODE_ENV` = `production`
5. Click **Deploy**

After deploy you get a public URL like:

`https://drip-poker.onrender.com`

Share that link — anyone in the world can play.

> **Note:** Free tier sleeps after ~15 min idle. First visit may take 30–60 seconds to wake up.

### Option B — Railway / Fly.io / VPS

Same idea: build frontend, run `npm start`, set `NODE_ENV=production`.  
The server serves both the website and WebSocket on one port.

### Option C — Quick test (temporary URL)

Use [ngrok](https://ngrok.com) while developing locally:

```bash
npm run dev
# In another terminal:
ngrok http 5173
```

Share the ngrok URL temporarily. Not ideal for production.

### Separate frontend + backend (advanced)

| Service | Host | Example |
|---------|------|---------|
| Frontend | Vercel / Netlify | `https://drip-poker.vercel.app` |
| Backend | Render / Railway | `https://drip-poker-api.onrender.com` |

Set env var when building frontend:

`VITE_SERVER_URL=https://drip-poker-api.onrender.com`

## Notes

- For educational/entertainment purposes only — not real-money gambling
- Minimum 2 players required to start a hand
- Auto-timeout: checks when possible, folds when a call is required
