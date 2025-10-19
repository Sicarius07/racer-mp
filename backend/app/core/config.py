from pydantic import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    app_name: str = "Racer MP Backend"
    debug: bool = True
    api_prefix: str = "/api"
    websocket_url: str = "/ws/lobby"
    tick_rate: int = 20
    max_players_per_lobby: int = 8

    class Config:
        env_file = ".env"


@lru_cache
def get_settings() -> Settings:
    return Settings()
