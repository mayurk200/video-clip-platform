from groq import Groq
from app.config import get_settings
from app.utils.logger import get_logger

logger = get_logger(__name__)
_client = None


def get_client() -> Groq:
    """Get or create the Groq API client."""
    global _client
    if _client is None:
        settings = get_settings()
        _client = Groq(api_key=settings.groq_api_key)
        logger.info("Groq client initialized")
    return _client


def chat_completion(system_prompt: str, user_prompt: str, json_mode: bool = True) -> str:
    """
    Send a chat completion request to Groq.
    Returns the raw response text.
    """
    settings = get_settings()
    client = get_client()

    kwargs = {
        "model": settings.groq_model,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        "temperature": 0.7,
        "max_tokens": 4096,
    }

    if json_mode:
        kwargs["response_format"] = {"type": "json_object"}

    response = client.chat.completions.create(**kwargs)
    return response.choices[0].message.content
