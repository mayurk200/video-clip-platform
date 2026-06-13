from typing import List
from app.scoring.models import ViralClip
from app.utils.logger import get_logger

logger = get_logger(__name__)

# Weighted scoring formula using the new flat fields
WEIGHTS = {
    "hook_strength": 0.25,
    "emotion_score": 0.20,
    "curiosity_score": 0.20,
    "shareability_score": 0.15,
    "retention_score": 0.20,
}


def rank_clips(clips: List[ViralClip], top_n: int = 10) -> List[ViralClip]:
    """
    Re-rank clips using the weighted scoring formula.
    Returns top N clips sorted by computed score.
    """
    for clip in clips:
        weighted = (
            clip.hook_strength * WEIGHTS["hook_strength"]
            + clip.emotion_score * WEIGHTS["emotion_score"]
            + clip.curiosity_score * WEIGHTS["curiosity_score"]
            + clip.shareability_score * WEIGHTS["shareability_score"]
            + clip.retention_score * WEIGHTS["retention_score"]
        )
        clip.viral_score = round(weighted)

    ranked = sorted(clips, key=lambda c: c.viral_score, reverse=True)[:top_n]
    logger.info(f"Ranked {len(ranked)} clips. Top score: {ranked[0].viral_score if ranked else 'N/A'}")
    return ranked
