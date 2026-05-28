from loguru import logger
import os
import sys

# Configure loguru
logger.remove()
logger.add(
    sys.stderr,
    format="<green>{time:YYYY-MM-DD HH:mm:ss}</green> | <level>{level: <8}</level> | <cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> - <level>{message}</level>",
    level="DEBUG" if os.getenv("NODE_ENV") == "development" else "INFO",
)


def get_logger(name: str):
    """Get a named logger instance."""
    return logger.bind(module=name)
