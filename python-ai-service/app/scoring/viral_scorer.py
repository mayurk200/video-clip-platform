import json
from typing import List
from app.groq.client import chat_completion
from app.groq.prompts import VIRAL_ANALYSIS_SYSTEM, VIRAL_ANALYSIS_USER
from app.scoring.models import ViralClip
from app.config import get_settings
from app.utils.logger import get_logger

logger = get_logger(__name__)


def analyze_transcript_for_viral_moments(
    transcript_text: str,
    segments: list,
) -> List[ViralClip]:
    """
    Send transcript to Groq for viral moment analysis.
    Returns ranked list of ViralClip objects.
    """
    settings = get_settings()

    # Build the user prompt
    user_prompt = VIRAL_ANALYSIS_USER.format(
        transcript=transcript_text[:12000],  # Limit context window
        top_n=settings.top_clips_count,
        min_duration=settings.clip_min_duration,
        max_duration=settings.clip_max_duration,
    )

    logger.info("Sending transcript to Groq for viral analysis")
    response = chat_completion(VIRAL_ANALYSIS_SYSTEM, user_prompt, json_mode=True)

    try:
        data = json.loads(response)
        clips_data = data.get("clips", [])
        clips = [ViralClip(**c) for c in clips_data]
        logger.info(f"Groq returned {len(clips)} viral clip candidates")
        return clips
    except (json.JSONDecodeError, Exception) as e:
        logger.error(f"Failed to parse Groq response: {e}")
        return []
