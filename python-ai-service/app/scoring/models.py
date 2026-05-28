from pydantic import BaseModel
from typing import List, Dict, Optional


class ClipScores(BaseModel):
    emotion: int = 0
    curiosity: int = 0
    hook: int = 0
    engagement: int = 0
    storytelling: int = 0
    controversy: int = 0


class ViralClip(BaseModel):
    clip_start: float
    clip_end: float
    viral_score: int
    hook_score: int = 0
    emotion_score: int = 0
    scores: ClipScores = ClipScores()
    reason: str = ""
    suggested_title: str = ""
    hashtags: List[str] = []
    seo_keywords: List[str] = []
