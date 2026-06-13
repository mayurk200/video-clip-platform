import subprocess
import os
from app.config import get_settings
from app.utils.logger import get_logger
from app.utils.file_utils import ensure_dir

logger = get_logger(__name__)
settings = get_settings()

def render_blur_background(
    input_path: str,
    output_path: str,
    target_width: int = 1080,
    target_height: int = 1920
) -> str:
    """
    Renders video by fitting it into 9:16 and blurring the top/bottom background.
    Perfect for Screen Recordings, Gaming, or landscape formats with 0 faces.
    """
    ensure_dir(os.path.dirname(output_path))

    # Complex filter logic:
    # 1. Split video into two streams (bg and fg)
    # 2. bg: scale to 1080x1920 (cropping edges to fill), boxblur heavily
    # 3. fg: scale to fit 1080x1920 while maintaining aspect ratio (force_original_aspect_ratio=decrease)
    # 4. overlay fg on top of bg exactly in the center
    
    # Actually, scaling and cropping for the background to fill 1080x1920 without stretching:
    bg_filter = f"scale={target_width}:{target_height}:force_original_aspect_ratio=increase,crop={target_width}:{target_height},boxblur=40:40"
    fg_filter = f"scale={target_width}:{target_height}:force_original_aspect_ratio=decrease"
    
    vf_filter = f"[0:v]split[bg][fg];[bg]{bg_filter}[bg_blurred];[fg]{fg_filter}[fg_scaled];[bg_blurred][fg_scaled]overlay=(main_w-overlay_w)/2:(main_h-overlay_h)/2"

    cmd = [
        settings.ffmpeg_path,
        "-i", input_path,
        "-vf", vf_filter,
        "-c:v", "libx264",
        "-preset", "ultrafast",
        "-crf", "23",
        "-c:a", "aac",
        "-b:a", "128k",
        "-y",
        output_path,
    ]

    logger.info(f"Reframing with Blur Background: {input_path}")
    result = subprocess.run(cmd, capture_output=True, text=True)

    if result.returncode != 0:
        raise RuntimeError(f"Blur background reframing failed: {result.stderr}")

    logger.info(f"Blur background clip saved: {output_path}")
    return output_path
