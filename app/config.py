from typing import Annotated

from pydantic import field_validator
from pydantic_settings import BaseSettings, NoDecode, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")
    secret_key: str
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    refresh_token_expire_days: int = 7
    db_path: str = "./freezino.db"
    environment: str = "development"
    log_level: str = "INFO"
    # NoDecode disables pydantic-settings' default JSON decode for this field;
    # otherwise CORS_ORIGINS=https://freezino.online crashes Settings() at
    # import time with SettingsError (json.JSONDecodeError).
    cors_origins: Annotated[list[str], NoDecode] = ["http://localhost:5173"]

    @field_validator("cors_origins", mode="before")
    @classmethod
    def _split_cors_origins(cls, v):
        if isinstance(v, str):
            return [item.strip() for item in v.split(",") if item.strip()]
        return v


settings = Settings()  # type: ignore[call-arg]
