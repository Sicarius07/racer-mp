from __future__ import annotations

from dataclasses import dataclass, field
from enum import Enum
from typing import Dict, List, Optional


class CarClass(str, Enum):
    STREET = "street"
    MUSCLE = "muscle"
    SUPER = "super"
    EXOTIC = "exotic"


@dataclass
class CarSpec:
    id: str
    name: str
    car_class: CarClass
    acceleration: float
    top_speed: float
    handling: float
    nitro: float


@dataclass
class PlayerState:
    player_id: str
    display_name: str
    car_id: str
    ready: bool = False
    position: float = 0.0
    speed: float = 0.0
    nitro: float = 1.0
    checkpoints_cleared: int = 0
    in_race: bool = False


@dataclass
class Lobby:
    lobby_id: str
    host_id: str
    track_id: str
    name: str
    max_players: int
    players: Dict[str, PlayerState] = field(default_factory=dict)
    countdown: Optional[int] = None
    race_active: bool = False

    def add_player(self, player: PlayerState) -> None:
        self.players[player.player_id] = player

    def remove_player(self, player_id: str) -> None:
        if player_id in self.players:
            del self.players[player_id]

    def list_players(self) -> List[PlayerState]:
        return list(self.players.values())


@dataclass
class Track:
    id: str
    name: str
    laps: int
    environment: str
    distance: float


@dataclass
class RaceSnapshot:
    lobby_id: str
    tick: int
    players: List[PlayerState]
    countdown: Optional[int]
    race_active: bool
