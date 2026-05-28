import subprocess
import json
import os
from typing import Optional, Tuple
from app.config import get_settings
from app.utils.logger import get_logger
from app.utils.file_utils import ensure_dir

logger = get_logger(__name__)
settings = get_settings()


def _get_video_dimensions(input_path: str) -> Tuple[int, int, float]:
    """Get video dimensions and FPS using ffprobe (no OpenCV needed)."""
    cmd = [
        settings.ffprobe_path,
        "-v", "error",
        "-select_streams", "v:0",
        "-show_entries", "stream=width,height,r_frame_rate",
        "-of", "json",
        input_path,
    ]
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        raise RuntimeError(f"ffprobe failed: {result.stderr}")

    data = json.loads(result.stdout)
    stream = data["streams"][0]
    width = int(stream["width"])
    height = int(stream["height"])

    # Parse frame rate (e.g., "30/1" or "30000/1001")
    fps_parts = stream.get("r_frame_rate", "30/1").split("/")
    fps = float(fps_parts[0]) / float(fps_parts[1]) if len(fps_parts) == 2 else 30.0

    return width, height, fps


def reframe_to_vertical(
    input_path: str,
    output_path: str,
    target_width: int = 1080,
    target_height: int = 1920,
) -> str:
    """
    Reframe video to vertical (9:16) using a single FFmpeg command.

    Uses center-crop approach — no OpenCV or frame-by-frame processing needed.
    This is ~7x faster than the face-tracking approach and produces good results
    for most content (especially talking-head videos where subjects are centered).
    """
    ensure_dir(os.path.dirname(output_path))

    # Get source dimensions via ffprobe
    src_width, src_height, fps = _get_video_dimensions(input_path)
    logger.info(f"Source: {src_width}x{src_height} @ {fps:.1f}fps")

    # Calculate crop dimensions (take full height, crop width for 9:16)
    crop_height = src_height
    crop_width = int(crop_height * target_width / target_height)

    if crop_width > src_width:
        # Source is narrower than 9:16 — crop height instead
        crop_width = src_width
        crop_height = int(crop_width * target_height / target_width)

    # Center crop offset
    crop_x = (src_width - crop_width) // 2
    crop_y = (src_height - crop_height) // 2

    # Build FFmpeg filter: crop → scale to target
    vf_filter = f"crop={crop_width}:{crop_height}:{crop_x}:{crop_y},scale={target_width}:{target_height}"

    cmd = [
        settings.ffmpeg_path,
        "-i", input_path,
        "-vf", vf_filter,
        "-c:v", "libx264",
        "-preset", "ultrafast",   # Fastest encoding
        "-crf", "23",
        "-c:a", "aac",
        "-b:a", "128k",
        "-y",
        output_path,
    ]

    logger.info(f"Reframing to vertical: crop({crop_width}x{crop_height} at {crop_x},{crop_y}) → {target_width}x{target_height}")
    result = subprocess.run(cmd, capture_output=True, text=True)

    if result.returncode != 0:
        raise RuntimeError(f"Vertical reframing failed: {result.stderr}")

    logger.info(f"Vertical clip saved: {output_path}")
    return output_path
