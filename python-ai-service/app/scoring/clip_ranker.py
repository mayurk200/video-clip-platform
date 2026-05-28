from typing import List
from app.scoring.models import ViralClip
from app.utils.logger import get_logger

logger = get_logger(__name__)

# Weighted scoring formula
WEIGHTS = {
    "emotion": 0.25,
    "curiosity": 0.20,
    "hook": 0.20,
    "engagement": 0.15,
    "storytelling": 0.10,
    "controversy": 0.10,
}


def rank_clips(clips: List[ViralClip], top_n: int = 10) -> List[ViralClip]:
    """
    Re-rank clips using the weighted scoring formula.
    Returns top N clips sorted by computed score.
    """
    for clip in clips:
        scores = clip.scores
        weighted = (
            scores.emotion * WEIGHTS["emotion"]
            + scores.curiosity * WEIGHTS["curiosity"]
            + scores.hook * WEIGHTS["hook"]
            + scores.engagement * WEIGHTS["engagement"]
            + scores.storytelling * WEIGHTS["storytelling"]
            + scores.controversy * WEIGHTS["controversy"]
        )
        clip.viral_score = round(weighted)

    ranked = sorted(clips, key=lambda c: c.viral_score, reverse=True)[:top_n]
    logger.info(f"Ranked {len(ranked)} clips. Top score: {ranked[0].viral_score if ranked else 'N/A'}")
    return ranked
