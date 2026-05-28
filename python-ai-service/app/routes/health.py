from fastapi import APIRouter
from app.config import get_settings
import os

router = APIRouter()

@router.get("/health")
async def health_check():
    settings = get_settings()
    ffmpeg_ok = os.path.isfile(settings.ffmpeg_path)
    
    return {
        "status": "ok", 
        "service": "clipforge-ai",
        "ffmpeg_available": ffmpeg_ok,
        "groq_configured": bool(settings.groq_api_key)
    }
