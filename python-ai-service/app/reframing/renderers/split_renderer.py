import subprocess
import os
from app.config import get_settings
from app.utils.logger import get_logger
from app.utils.file_utils import ensure_dir

logger = get_logger(__name__)
settings = get_settings()

def render_split_screen(
    input_path: str,
    output_path: str,
    target_width: int = 1080,
    target_height: int = 1920
) -> str:
    """
    Renders video by splitting the landscape frame in half and stacking them vertically.
    Perfect for 2-speaker Podcasts and Interviews.
    """
    ensure_dir(os.path.dirname(output_path))

    # Complex filter logic:
    # We assume a 16:9 input where Speaker A is on the left and Speaker B is on the right.
    # 1. Split video
    # 2. Left crop: w/2, h, 0, 0
    # 3. Right crop: w/2, h, w/2, 0
    # 4. Scale both to target_width x (target_height / 2) -> 1080x960
    # 5. vstack them
    
    half_h = target_height // 2
    
    vf_filter = (
        "[0:v]split[left_orig][right_orig];"
        f"[left_orig]crop=iw/2:ih:0:0,scale={target_width}:{half_h}:force_original_aspect_ratio=increase,crop={target_width}:{half_h}[top];"
        f"[right_orig]crop=iw/2:ih:iw/2:0,scale={target_width}:{half_h}:force_original_aspect_ratio=increase,crop={target_width}:{half_h}[bottom];"
        "[top][bottom]vstack"
    )

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

    logger.info(f"Reframing with Split Screen: {input_path}")
    result = subprocess.run(cmd, capture_output=True, text=True)

    if result.returncode != 0:
        raise RuntimeError(f"Split screen reframing failed: {result.stderr}")

    logger.info(f"Split screen clip saved: {output_path}")
    return output_path
