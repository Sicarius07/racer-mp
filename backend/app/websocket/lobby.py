from __future__ import annotations

import asyncio
import json
from typing import Dict

from fastapi import WebSocket, WebSocketDisconnect

from ..services.lobby_manager import lobby_manager
from ..core.config import get_settings


class ConnectionManager:
    def __init__(self) -> None:
        self._connections: Dict[str, Dict[str, WebSocket]] = {}
        self._poll_tasks: Dict[str, asyncio.Task] = {}
        self._settings = get_settings()

    async def connect(self, lobby_id: str, player_id: str, websocket: WebSocket) -> None:
        await websocket.accept()
        self._connections.setdefault(lobby_id, {})[player_id] = websocket
        if lobby_id not in self._poll_tasks:
            self._poll_tasks[lobby_id] = asyncio.create_task(self._poll_lobby(lobby_id))

    def disconnect(self, lobby_id: str, player_id: str) -> None:
        lobby_connections = self._connections.get(lobby_id, {})
        if player_id in lobby_connections:
            del lobby_connections[player_id]
        if not lobby_connections:
            self._connections.pop(lobby_id, None)
            poll_task = self._poll_tasks.pop(lobby_id, None)
            if poll_task:
                poll_task.cancel()

    async def _broadcast(self, lobby_id: str, message: dict) -> None:
        lobby_connections = self._connections.get(lobby_id, {})
        if not lobby_connections:
            return
        encoded = json.dumps(message)
        for websocket in lobby_connections.values():
            await websocket.send_text(encoded)

    async def _poll_lobby(self, lobby_id: str) -> None:
        interval = 1 / self._settings.tick_rate
        try:
            while True:
                await asyncio.sleep(interval)
                lobby = lobby_manager.get_lobby(lobby_id)
                if not lobby:
                    return
                snapshot = await lobby_manager.tick(lobby_id)
                await self._broadcast(
                    lobby_id,
                    {
                        "type": "snapshot",
                        "payload": {
                            "tick": snapshot.tick,
                            "countdown": snapshot.countdown,
                            "raceActive": snapshot.race_active,
                            "players": [
                                {
                                    "playerId": player.player_id,
                                    "displayName": player.display_name,
                                    "carId": player.car_id,
                                    "position": player.position,
                                    "speed": player.speed,
                                    "nitro": player.nitro,
                                    "inRace": player.in_race,
                                }
                                for player in snapshot.players
                            ],
                        },
                    },
                )
        except asyncio.CancelledError:
            return


connection_manager = ConnectionManager()
