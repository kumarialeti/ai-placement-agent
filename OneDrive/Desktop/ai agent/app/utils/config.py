"""
Application configuration loaded from environment variables.
Uses Pydantic Settings for type-safe config management.
"""

from functools import lru_cache
from pydantic import field_validator
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings loaded from .env file."""

    # LLM & Embeddings Configuration
    GROQ_API_KEY: str
    GROQ_MODEL: str = "llama-3.3-70b-versatile"
    EMBEDDING_MODEL: str = "app/resources/all-MiniLM-L6-v2"

    # JWT Auth
    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 hours

    # Database
    DATABASE_URL: str = "sqlite+aiosqlite:///./data/app.db"

    @field_validator("DATABASE_URL", mode="before")
    @classmethod
    def validate_database_url(cls, v: str) -> str:
        """Ensure standard Postgres URLs use the asyncpg driver."""
        if v and v.startswith("postgres://"):
            return v.replace("postgres://", "postgresql+asyncpg://", 1)
        if v and v.startswith("postgresql://"):
            return v.replace("postgresql://", "postgresql+asyncpg://", 1)
        return v

    # ChromaDB
    CHROMA_PERSIST_DIR: str = "./vector_db/chroma"
    CHROMA_COLLECTION_NAME: str = "placement_prep"

    # RAG
    CHUNK_SIZE: int = 1000
    CHUNK_OVERLAP: int = 200
    TOP_K_RESULTS: int = 5

    # App
    APP_NAME: str = "AI Placement Preparation Agent"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True
    CORS_ORIGINS: str = "http://localhost:5173,http://localhost:3000,http://localhost:8000,https://ai-placement-agent-prjt.onrender.com,https://ai-placement-agent-bakend.onrender.com"

    # Uploads
    UPLOAD_DIR: str = "./data/uploads"
    MAX_UPLOAD_SIZE_MB: int = 10

    @property
    def cors_origins_list(self) -> list[str]:
        # Always include production URLs + any additional from env var
        required_origins = [
            "http://localhost:5173",
            "http://localhost:3000",
            "http://localhost:8000",
            "https://ai-placement-agent-prjt.onrender.com",
            "https://ai-placement-agent-bakend.onrender.com",
        ]
        env_origins = [
            origin.strip()
            for origin in self.CORS_ORIGINS.split(",")
            if origin.strip()  # filter empty strings
        ]
        # Merge both lists, deduplicate while preserving order
        all_origins = list(dict.fromkeys(env_origins + required_origins))
        return all_origins

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8", "extra": "ignore"}


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()
