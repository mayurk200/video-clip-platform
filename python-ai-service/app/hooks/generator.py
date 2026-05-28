import json
from typing import List
from app.groq.client import chat_completion
from app.groq.prompts import HOOK_GENERATION_SYSTEM, HOOK_GENERATION_USER, HOOK_BATCH_SYSTEM, HOOK_BATCH_USER
from app.utils.logger import get_logger

logger = get_logger(__name__)


def generate_hooks(text: str) -> list:
    """
    Generate 5 viral hooks from an opening text using Groq.
    """
    user_prompt = HOOK_GENERATION_USER.format(text=text[:500])
    response = chat_completion(HOOK_GENERATION_SYSTEM, user_prompt, json_mode=True)

    try:
        data = json.loads(response)
        hooks = data.get("hooks", [])
        logger.info(f"Generated {len(hooks)} hooks")
        return hooks
    except (json.JSONDecodeError, Exception) as e:
        logger.error(f"Failed to parse hook response: {e}")
        return []


def generate_hooks_batch(texts: List[str]) -> List[list]:
    """
    Generate hooks for multiple clips in a SINGLE Groq API call.
    Returns a list of hook arrays, one per input text.
    Falls back to per-clip generation if batch parsing fails.
    """
    if not texts:
        return []

    # For a single clip, just use the regular function
    if len(texts) == 1:
        return [generate_hooks(texts[0])]

    # Build numbered clip list for the batch prompt
    clips_text = "\n".join(f"CLIP {i+1}: \"{t[:300]}\"" for i, t in enumerate(texts))
    user_prompt = HOOK_BATCH_USER.format(clips=clips_text, count=len(texts))

    logger.info(f"Batch-generating hooks for {len(texts)} clips in one API call")

    try:
        response = chat_completion(HOOK_BATCH_SYSTEM, user_prompt, json_mode=True)
        data = json.loads(response)

        # Expected format: { "clips": [ { "hooks": [...] }, ... ] }
        clips_hooks = data.get("clips", [])

        if len(clips_hooks) >= len(texts):
            result = [c.get("hooks", []) for c in clips_hooks[:len(texts)]]
            logger.info(f"Batch hooks generated: {sum(len(h) for h in result)} total hooks for {len(texts)} clips")
            return result
        else:
            logger.warning(f"Batch returned {len(clips_hooks)} clips but expected {len(texts)}, falling back to per-clip")

    except (json.JSONDecodeError, Exception) as e:
        logger.warning(f"Batch hook generation failed ({e}), falling back to per-clip")

    # Fallback: generate hooks one at a time
    return [generate_hooks(t) for t in texts]

