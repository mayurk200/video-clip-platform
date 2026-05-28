from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """Application configuration loaded from environment variables."""

    # Service
    ai_service_port: int = 8000

    # Groq
    groq_api_key: str = ""
    groq_model: str = "llama-3.3-70b-versatile"

    # Whisper
    whisper_mode: str = "groq"  # 'groq' (cloud, fast) or 'local' (Faster-Whisper on CPU)
    whisper_model_size: str = "base"
    whisper_device: str = "cpu"
    whisper_compute_type: str = "int8"

    # FFmpeg
    ffmpeg_path: str = "ffmpeg"
    ffprobe_path: str = "ffprobe"

    # Storage
    storage_path: str = "../storage"

    # Processing
    clip_min_duration: int = 15
    clip_max_duration: int = 90
    top_clips_count: int = 10

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache()
def get_settings() -> Settings:
    return Settings()
