from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from loguru import logger

from app.config import get_settings
from app.routes import transcription, analysis, clips, render, health

settings = get_settings()

app = FastAPI(
    title="ClipForge AI Service",
    description="AI-powered video transcription, viral moment detection, and clip generation",
    version="1.0.0",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routes
app.include_router(health.router, tags=["Health"])
app.include_router(transcription.router, prefix="/api", tags=["Transcription"])
app.include_router(analysis.router, prefix="/api", tags=["Analysis"])
app.include_router(clips.router, prefix="/api", tags=["Clips"])
app.include_router(render.router, prefix="/api", tags=["Render"])


@app.on_event("startup")
async def startup():
    logger.info(f"🚀 ClipForge AI Service starting on port {settings.ai_service_port}")
    logger.info(f"🧠 Whisper model: {settings.whisper_model_size} ({settings.whisper_device})")
    logger.info(f"🤖 Groq model: {settings.groq_model}")
