from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

from .api.routes import router as api_router
from .core.config import get_settings
from .websocket.lobby import connection_manager

settings = get_settings()

app = FastAPI(title=settings.app_name, debug=settings.debug)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix=settings.api_prefix)


@app.websocket(settings.websocket_url)
async def lobby_feed(websocket: WebSocket):
    query_params = websocket.query_params
    lobby_id = query_params.get("lobbyId")
    player_id = query_params.get("playerId")
    if not lobby_id or not player_id:
        await websocket.close(code=1008)
        return
    await connection_manager.connect(lobby_id, player_id, websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        connection_manager.disconnect(lobby_id, player_id)
