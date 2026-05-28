import subprocess
import json
import os
from typing import List
from app.config import get_settings
from app.utils.logger import get_logger
from app.utils.file_utils import ensure_dir

logger = get_logger(__name__)
settings = get_settings()


def extract_best_thumbnails(video_path: str, output_dir: str, count: int = 3) -> List[str]:
    """
    Extract the most visually interesting frames as thumbnail candidates.
    Uses FFmpeg's select filter to pick frames at regular intervals and
    save them as high-quality JPEGs — no OpenCV frame iteration needed.
    """
    ensure_dir(output_dir)
    basename = os.path.splitext(os.path.basename(video_path))[0]

    # Get video duration via ffprobe
    duration = _get_duration(video_path)
    if duration <= 0:
        return []

    paths = []
    # Sample frames at evenly spaced intervals through the video
    for i in range(count):
        # Position at evenly distributed points (avoid very start/end)
        position = duration * (i + 1) / (count + 1)
        output_path = os.path.join(output_dir, f"{basename}_thumb_{i}.jpg")

        cmd = [
            settings.ffmpeg_path,
            "-ss", str(position),     # Seek to position (input-level = fast)
            "-i", video_path,
            "-vframes", "1",          # Extract exactly 1 frame
            "-q:v", "2",              # High JPEG quality
            "-y",
            output_path,
        ]

        result = subprocess.run(cmd, capture_output=True, text=True)

        if result.returncode == 0 and os.path.exists(output_path):
            paths.append(output_path)
        else:
            logger.warning(f"Failed to extract thumbnail at {position:.1f}s")

    logger.info(f"Extracted {len(paths)} thumbnails from {video_path}")
    return paths


def _get_duration(video_path: str) -> float:
    """Get video duration in seconds using ffprobe."""
    cmd = [
        settings.ffprobe_path,
        "-v", "error",
        "-show_entries", "format=duration",
        "-of", "default=noprint_wrappers=1:nokey=1",
        video_path,
    ]
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        logger.error(f"ffprobe failed: {result.stderr}")
        return 0

    try:
        return float(result.stdout.strip())
    except (ValueError, AttributeError):
        return 0
