from fastapi import APIRouter, HTTPException

from ..models.game import PlayerState
from ..services.lobby_manager import lobby_manager

router = APIRouter()


@router.get("/cars")
def list_cars():
    return list(lobby_manager.list_cars())


@router.get("/tracks")
def list_tracks():
    return list(lobby_manager.list_tracks())


@router.post("/lobbies")
async def create_lobby(payload: dict):
    host_id = payload.get("host_id")
    host_name = payload.get("host_name")
    car_id = payload.get("car_id")
    track_id = payload.get("track_id")
    name = payload.get("name")
    max_players = payload.get("max_players", 6)
    if not host_id or not host_name or not car_id or not track_id:
        raise HTTPException(status_code=422, detail="Missing required fields")
    lobby = await lobby_manager.create_lobby(host_id, host_name, car_id, track_id, name=name, max_players=max_players)
    return lobby


@router.post("/lobbies/{lobby_id}/join")
async def join_lobby(lobby_id: str, payload: dict):
    if lobby_manager.get_lobby(lobby_id) is None:
        raise HTTPException(status_code=404, detail="Lobby not found")
    player = PlayerState(
        player_id=payload["player_id"],
        display_name=payload["display_name"],
        car_id=payload["car_id"],
    )
    lobby = await lobby_manager.join_lobby(lobby_id, player)
    return lobby


@router.post("/lobbies/{lobby_id}/ready")
async def set_ready(lobby_id: str, payload: dict):
    lobby = lobby_manager.get_lobby(lobby_id)
    if lobby is None:
        raise HTTPException(status_code=404, detail="Lobby not found")
    lobby = await lobby_manager.set_ready(lobby_id, payload["player_id"], payload["ready"])
    return lobby


@router.get("/lobbies/{lobby_id}")
async def get_lobby(lobby_id: str):
    lobby = lobby_manager.get_lobby(lobby_id)
    if lobby is None:
        raise HTTPException(status_code=404, detail="Lobby not found")
    return lobby
