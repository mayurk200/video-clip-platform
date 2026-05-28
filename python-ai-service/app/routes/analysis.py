from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from app.scoring.viral_scorer import analyze_transcript_for_viral_moments
from app.scoring.clip_ranker import rank_clips
from app.config import get_settings

router = APIRouter()
settings = get_settings()


class AnalyzeRequest(BaseModel):
    transcript: dict  # TranscriptionResult as dict
    video_id: Optional[str] = None


@router.post("/analyze")
def analyze(request: AnalyzeRequest):
    """Analyze transcript for viral moments and return ranked clips."""
    try:
        full_text = request.transcript.get("full_text", "")
        segments = request.transcript.get("segments", [])

        viral_clips = analyze_transcript_for_viral_moments(full_text, segments)
        ranked = rank_clips(viral_clips, top_n=settings.top_clips_count)

        return {
            "clips": [c.model_dump() for c in ranked],
            "total": len(ranked),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
