# Racer MP - Most Pursued

Racer MP is a multiplayer street racing experience inspired by the iconic *Need For Speed: Most Wanted*. The project pairs a Python (FastAPI) backend with a TypeScript + React (Vite) client to deliver lobby management, car selection, and a real-time race HUD powered by WebSockets.

## Project Structure

```
.
├── backend
│   ├── app
│   │   ├── api
│   │   │   └── routes.py
│   │   ├── core
│   │   │   └── config.py
│   │   ├── models
│   │   │   └── game.py
│   │   ├── services
│   │   │   └── lobby_manager.py
│   │   ├── websocket
│   │   │   └── lobby.py
│   │   └── main.py
│   └── requirements.txt
├── frontend
│   ├── index.html
│   ├── package.json
│   ├── src
│   │   ├── App.tsx
│   │   ├── components
│   │   │   ├── Garage.tsx
│   │   │   ├── Landing.tsx
│   │   │   ├── Lobby.tsx
│   │   │   └── RaceHud.tsx
│   │   ├── context
│   │   │   ├── LobbyContext.tsx
│   │   │   └── ThemeContext.tsx
│   │   ├── hooks
│   │   │   └── useWebsocket.ts
│   │   ├── main.tsx
│   │   ├── styles
│   │   │   └── index.scss
│   │   └── assets
│   │       └── neon-city.svg
│   └── vite.config.ts
├── LICENSE
└── README.md
```

## Getting Started

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

The backend exposes:

- REST catalog endpoints under `/api` for cars, tracks, lobby creation and readiness.
- A WebSocket feed at `/ws/lobby` streaming lobby snapshots at 20 ticks per second.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The Vite development server proxies API and WebSocket traffic to the FastAPI backend.

### Gameplay Loop

1. Launch the landing page and create a lobby using your alias.
2. Share the lobby identifier with friends to join via the lobby endpoint.
3. Ready up to trigger the race countdown. When every driver is ready, the backend starts streaming race updates.
4. During the race, the HUD highlights player progress, nitro usage, and finishing order.

While the physics system is abstracted, the UI and state model mirror the high-stakes atmosphere of *Most Wanted*—complete with blacklist-inspired car roster, neon-lit city backdrops, and heat-level lobby theming.

## Testing

- Python unit tests can be added with `pytest` against services.
- Frontend linting is provided via `npm run lint`.

## License

This project is licensed under the terms of the MIT license.
