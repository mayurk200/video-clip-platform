from pydantic import BaseModel
from typing import List


class ViralClip(BaseModel):
    clip_start: float
    clip_end: float
    viral_score: int
    hook_strength: int = 0
    emotion_score: int = 0
    curiosity_score: int = 0
    shareability_score: int = 0
    retention_score: int = 0
    reason: str = ""
    audience: str = ""
    platform: str = ""
    generated_hook: str = ""
    generated_title: str = ""
    thumbnail_text: str = ""
    hashtags: List[str] = []
