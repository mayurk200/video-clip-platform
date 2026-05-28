from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.transcription.service import transcribe_video

router = APIRouter()


class TranscribeRequest(BaseModel):
    video_path: str


@router.post("/transcribe")
def transcribe(request: TranscribeRequest):
    """Transcribe a video file and return word-level timestamps."""
    import os
    if not os.path.isfile(request.video_path):
        raise HTTPException(status_code=404, detail="Video file not found on disk")

    try:
        result = transcribe_video(request.video_path)
        return result.model_dump()
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Video file not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
