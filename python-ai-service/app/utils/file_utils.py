import os
import shutil
from pathlib import Path


def ensure_dir(path: str) -> None:
    """Create directory if it doesn't exist."""
    Path(path).mkdir(parents=True, exist_ok=True)


def safe_delete(path: str) -> None:
    """Delete a file, ignoring if it doesn't exist."""
    try:
        os.remove(path)
    except FileNotFoundError:
        pass


def get_file_size_mb(path: str) -> float:
    """Get file size in MB."""
    return os.path.getsize(path) / (1024 * 1024)
