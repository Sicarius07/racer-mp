from __future__ import annotations

import asyncio
import random
import string
from typing import Dict, Iterable, Optional

from ..models.game import CarSpec, Lobby, PlayerState, RaceSnapshot, Track


class LobbyManager:
    def __init__(self) -> None:
        self._lobbies: Dict[str, Lobby] = {}
        self._cars: Dict[str, CarSpec] = {car.id: car for car in self._default_cars()}
        self._tracks: Dict[str, Track] = {track.id: track for track in self._default_tracks()}
        self._tick_counter: Dict[str, int] = {}
        self._locks: Dict[str, asyncio.Lock] = {}

    def _default_cars(self) -> Iterable[CarSpec]:
        return (
            CarSpec("blacklist-01", "BMW M3 GTR", "super", 0.95, 0.92, 0.90, 0.85),
            CarSpec("blacklist-02", "Lamborghini Gallardo", "exotic", 0.93, 0.94, 0.88, 0.90),
            CarSpec("blacklist-03", "Ford Mustang GT", "muscle", 0.82, 0.86, 0.75, 0.80),
            CarSpec("blacklist-04", "Porsche Cayman S", "super", 0.88, 0.89, 0.87, 0.82),
            CarSpec("blacklist-05", "Mazda RX-8", "street", 0.80, 0.83, 0.85, 0.78),
        )

    def _default_tracks(self) -> Iterable[Track]:
        return (
            Track("heatwave", "Heatwave Heights", laps=3, environment="sunset", distance=5.2),
            Track("downtown", "Downtown Sprint", laps=2, environment="neon", distance=3.6),
            Track("harbor", "Harbor Run", laps=4, environment="industrial", distance=6.1),
        )

    def list_cars(self) -> Iterable[CarSpec]:
        return self._cars.values()

    def list_tracks(self) -> Iterable[Track]:
        return self._tracks.values()

    def _generate_lobby_id(self) -> str:
        while True:
            lobby_id = "lobby-" + "".join(random.choices(string.ascii_lowercase + string.digits, k=5))
        
            if lobby_id not in self._lobbies:
                return lobby_id

    async def create_lobby(self, host_id: str, host_name: str, car_id: str, track_id: str, *, name: Optional[str] = None, max_players: int = 6) -> Lobby:
        lobby_id = self._generate_lobby_id()
        lobby = Lobby(
            lobby_id=lobby_id,
            host_id=host_id,
            track_id=track_id,
            name=name or f"Heat Seeker #{len(self._lobbies) + 1}",
            max_players=max_players,
        )
        lobby.add_player(
            PlayerState(
                player_id=host_id,
                display_name=host_name,
                car_id=car_id,
                ready=False,
            )
        )
        self._lobbies[lobby_id] = lobby
        self._tick_counter[lobby_id] = 0
        self._locks[lobby_id] = asyncio.Lock()
        return lobby

    async def join_lobby(self, lobby_id: str, player: PlayerState) -> Lobby:
        lobby = self._lobbies[lobby_id]
        async with self._locks[lobby_id]:
            lobby.add_player(player)
            return lobby

    async def leave_lobby(self, lobby_id: str, player_id: str) -> None:
        lobby = self._lobbies.get(lobby_id)
        if not lobby:
            return
        async with self._locks[lobby_id]:
            lobby.remove_player(player_id)
            if not lobby.players:
                self._lobbies.pop(lobby_id, None)
                self._tick_counter.pop(lobby_id, None)
                self._locks.pop(lobby_id, None)

    async def set_ready(self, lobby_id: str, player_id: str, ready: bool) -> Lobby:
        lobby = self._lobbies[lobby_id]
        async with self._locks[lobby_id]:
            lobby.players[player_id].ready = ready
            if all(p.ready for p in lobby.players.values()) and len(lobby.players) > 1:
                lobby.countdown = 5
            return lobby

    async def tick(self, lobby_id: str) -> RaceSnapshot:
        lobby = self._lobbies[lobby_id]
        async with self._locks[lobby_id]:
            tick = self._tick_counter[lobby_id] = self._tick_counter[lobby_id] + 1
            if lobby.countdown is not None:
                lobby.countdown -= 1
                if lobby.countdown <= 0:
                    lobby.race_active = True
                    lobby.countdown = None
                    for player in lobby.players.values():
                        player.in_race = True
                        player.speed = random.uniform(0.6, 0.9)
            if lobby.race_active:
                for player in lobby.players.values():
                    boost = 1.15 if player.nitro > 0.1 else 1.0
                    delta = player.speed * boost * 0.1
                    player.position += delta
                    player.nitro = max(0.0, player.nitro - 0.01)
                    player.speed = min(1.0, player.speed + random.uniform(-0.02, 0.02))
                    if player.position >= 1.0:
                        lobby.race_active = False
                        player.in_race = False
            return RaceSnapshot(
                lobby_id=lobby_id,
                tick=tick,
                players=list(lobby.players.values()),
                countdown=lobby.countdown,
                race_active=lobby.race_active,
            )

    def get_lobby(self, lobby_id: str) -> Optional[Lobby]:
        return self._lobbies.get(lobby_id)

    def get_car(self, car_id: str) -> Optional[CarSpec]:
        return self._cars.get(car_id)

    def get_track(self, track_id: str) -> Optional[Track]:
        return self._tracks.get(track_id)


lobby_manager = LobbyManager()
