from pydantic import BaseModel
from typing import List, Optional


class Word(BaseModel):
    """Single word with timing."""
    word: str
    start: float
    end: float


class Segment(BaseModel):
    """Transcript segment with words."""
    text: str
    start: float
    end: float
    words: List[Word] = []


class TranscriptionResult(BaseModel):
    """Full transcription output."""
    full_text: str
    segments: List[Segment]
    language: Optional[str] = None
    language_probability: Optional[float] = None
    duration: Optional[float] = None
