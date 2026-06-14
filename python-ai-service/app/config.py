import json
import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    """Application configuration loaded from environment variables and settings.json."""

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

def get_settings() -> Settings:
    """Reads settings.json dynamically so config changes don't require restart."""
    # storage/settings.json is two levels up from app/ (python-ai-service/app -> python-ai-service -> root)
    settings_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "storage", "settings.json")
    
    data = {}
    if os.path.exists(settings_path):
        try:
            with open(settings_path, "r", encoding="utf-8") as f:
                raw_data = json.load(f)
                
                # Map JSON Settings Dashboard categories to Python variables
                if "ai" in raw_data:
                    if raw_data["ai"].get("groqApiKey"):
                        data["groq_api_key"] = raw_data["ai"]["groqApiKey"]
                    if raw_data["ai"].get("groqModel"):
                        data["groq_model"] = raw_data["ai"]["groqModel"]
                    if raw_data["ai"].get("whisperMode"):
                        data["whisper_mode"] = raw_data["ai"]["whisperMode"]
        except Exception:
            pass

    return Settings(**data)
