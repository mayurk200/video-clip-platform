import subprocess
import os
import json
from app.config import get_settings
from app.utils.logger import get_logger
from app.utils.file_utils import ensure_dir

logger = get_logger(__name__)
settings = get_settings()

def _get_video_dimensions(input_path: str) -> tuple:
    cmd = [
        settings.ffprobe_path,
        "-v", "error",
        "-select_streams", "v:0",
        "-show_entries", "stream=width,height",
        "-of", "json",
        input_path,
    ]
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        raise RuntimeError(f"ffprobe failed: {result.stderr}")

    data = json.loads(result.stdout)
    stream = data["streams"][0]
    return int(stream["width"]), int(stream["height"])

def render_smart_crop(
    input_path: str,
    output_path: str,
    face_coords: list = None,
    target_width: int = 1080,
    target_height: int = 1920
) -> str:
    """
    Renders video by tracking a speaker's face.
    If face_coords are provided, crops around the primary face.
    Otherwise defaults to center crop.
    """
    ensure_dir(os.path.dirname(output_path))
    
    src_width, src_height = _get_video_dimensions(input_path)

    # Calculate crop dimensions (take full height, crop width for 9:16)
    crop_height = src_height
    crop_width = int(crop_height * target_width / target_height)

    if crop_width > src_width:
        crop_width = src_width
        crop_height = int(crop_width * target_height / target_width)

    # Default to center crop
    crop_x = (src_width - crop_width) // 2
    crop_y = (src_height - crop_height) // 2

    if face_coords and len(face_coords) > 0:
        # face_coords is expected to be a list of [x, y, w, h] from OpenCV
        # Grab the largest face
        largest_face = max(face_coords, key=lambda f: f[2] * f[3])
        fx, fy, fw, fh = largest_face
        
        # Center the crop on the face center X
        face_center_x = fx + (fw // 2)
        crop_x = face_center_x - (crop_width // 2)
        
        # Clamp to bounds
        crop_x = max(0, min(crop_x, src_width - crop_width))

    vf_filter = f"crop={crop_width}:{crop_height}:{crop_x}:{crop_y},scale={target_width}:{target_height}"

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

    logger.info(f"Reframing with Smart Crop (Face Center X: {crop_x}): {input_path}")
    result = subprocess.run(cmd, capture_output=True, text=True)

    if result.returncode != 0:
        raise RuntimeError(f"Smart crop reframing failed: {result.stderr}")

    logger.info(f"Smart crop clip saved: {output_path}")
    return output_path
