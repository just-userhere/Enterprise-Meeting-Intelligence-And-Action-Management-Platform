"""Central application configuration loaded from environment variables.

Secrets are NEVER hardcoded. See .env.example for the full list.
"""

from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    APP_NAME: str = "MeetingMind"
    APP_ENV: str = "development"
    SECRET_KEY: str = "change-me-in-production-use-a-long-random-value"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 12
    DATABASE_URL: str = "sqlite:///./meetingmind.db"
    CORS_ORIGINS: str = "http://localhost:5173,http://127.0.0.1:5173"
    # AI provider: "rules" (default, offline deterministic) or "openai-compatible"
    AI_PROVIDER: str = "rules"
    LLM_API_KEY: str = ""
    LLM_BASE_URL: str = "https://openrouter.ai/api/v1"
    LLM_MODEL: str = "openai/gpt-4o-mini"
    MAX_UPLOAD_BYTES: int = 512 * 1024  # 512 KB transcript uploads

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.CORS_ORIGINS.split(",") if o.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
