from typing import List, Dict
from app.utils.logger import get_logger

logger = get_logger(__name__)


def generate_caption_data(words: List[Dict], style: str = "hormozi") -> List[Dict]:
    """
    Generate word-by-word caption timing data from transcription words.
    Groups words into display lines (3-5 words per line).
    """
    if not words:
        return []

    captions = []
    line_words = []
    max_words_per_line = 4

    for word_data in words:
        line_words.append(word_data)

        if len(line_words) >= max_words_per_line:
            caption = {
                "text": " ".join(w.get("word", w.get("text", "")) for w in line_words),
                "start": line_words[0]["start"],
                "end": line_words[-1]["end"],
                "words": [
                    {
                        "word": w.get("word", w.get("text", "")),
                        "start": w["start"],
                        "end": w["end"],
                    }
                    for w in line_words
                ],
                "style": style,
            }
            captions.append(caption)
            line_words = []

    # Remaining words
    if line_words:
        caption = {
            "text": " ".join(w.get("word", w.get("text", "")) for w in line_words),
            "start": line_words[0]["start"],
            "end": line_words[-1]["end"],
            "words": [
                {
                    "word": w.get("word", w.get("text", "")),
                    "start": w["start"],
                    "end": w["end"],
                }
                for w in line_words
            ],
            "style": style,
        }
        captions.append(caption)

    logger.info(f"Generated {len(captions)} caption lines from {len(words)} words")
    return captions
