import subprocess
import os
from app.config import get_settings
from app.utils.logger import get_logger
from app.utils.file_utils import ensure_dir

logger = get_logger(__name__)
settings = get_settings()


def cut_clip(input_path: str, output_path: str, start: float, end: float) -> str:
    """
    Cut a clip from the source video using FFmpeg.
    Uses input-level seeking (-ss before -i) for near-instant seek.
    Uses stream copy (-c copy) for maximum speed when re-encoding isn't needed.
    """
    if not os.path.isfile(input_path):
        raise FileNotFoundError(f"Input video file not found: {input_path}")

    ensure_dir(os.path.dirname(output_path))
    duration = end - start

    # Fast mode: input-level seek + stream copy (near instant)
    cmd = [
        settings.ffmpeg_path,
        "-ss", str(start),        # Input-level seek (instant on most formats)
        "-i", input_path,
        "-t", str(duration),      # Duration-based (more reliable with input seek)
        "-c:v", "libx264",        # Re-encode video for precise cuts
        "-preset", "ultrafast",   # Fastest encoding preset
        "-crf", "23",
        "-c:a", "aac",
        "-b:a", "128k",
        "-avoid_negative_ts", "make_zero",
        "-y",
        output_path,
    ]

    logger.info(f"Cutting clip: {start:.1f}s → {end:.1f}s ({duration:.1f}s)")
    try:
        # Add timeout to prevent infinite hangs (e.g. 5 minutes max per clip)
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=300)
    except subprocess.TimeoutExpired:
        logger.error("FFmpeg clip cut timed out after 300 seconds")
        raise RuntimeError("FFmpeg processing timed out")

    if result.returncode != 0:
        logger.error(f"FFmpeg error: {result.stderr}")
        raise RuntimeError(f"FFmpeg clip cut failed: {result.stderr}")

    logger.info(f"Clip saved: {output_path}")
    return output_path


def cut_clip_fast(input_path: str, output_path: str, start: float, end: float) -> str:
    """
    Ultra-fast clip cutting using stream copy (no re-encoding).
    May have imprecise start/end points (up to nearest keyframe).
    Use for previews or when speed is critical.
    """
    ensure_dir(os.path.dirname(output_path))
    duration = end - start

    cmd = [
        settings.ffmpeg_path,
        "-ss", str(start),
        "-i", input_path,
        "-t", str(duration),
        "-c", "copy",             # Stream copy — no re-encoding
        "-avoid_negative_ts", "make_zero",
        "-y",
        output_path,
    ]

    logger.info(f"Fast-cutting clip (stream copy): {start:.1f}s → {end:.1f}s")
    result = subprocess.run(cmd, capture_output=True, text=True)

    if result.returncode != 0:
        logger.error(f"FFmpeg error: {result.stderr}")
        raise RuntimeError(f"FFmpeg fast clip cut failed: {result.stderr}")

    return output_path


def normalize_audio(input_path: str, output_path: str) -> str:
    """Normalize audio levels using FFmpeg loudnorm."""
    cmd = [
        settings.ffmpeg_path,
        "-i", input_path,
        "-af", "loudnorm=I=-16:TP=-1.5:LRA=11",
        "-c:v", "copy",
        "-c:a", "aac",
        "-b:a", "128k",
        "-y",
        output_path,
    ]

    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        raise RuntimeError(f"Audio normalization failed: {result.stderr}")

    return output_path


def extract_audio(input_path: str, output_path: str) -> str:
    """Extract audio from video as WAV."""
    ensure_dir(os.path.dirname(output_path))

    cmd = [
        settings.ffmpeg_path,
        "-i", input_path,
        "-vn",
        "-acodec", "pcm_s16le",
        "-ar", "16000",
        "-ac", "1",
        "-y",
        output_path,
    ]

    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        raise RuntimeError(f"Audio extraction failed: {result.stderr}")

    return output_path


def _get_video_dimensions(input_path: str):
    """Get video width, height, and FPS using ffprobe."""
    import json
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

    fps_parts = stream.get("r_frame_rate", "30/1").split("/")
    fps = float(fps_parts[0]) / float(fps_parts[1]) if len(fps_parts) == 2 else 30.0

    return width, height, fps


def cut_and_reframe(
    input_path: str,
    output_path: str,
    start: float,
    end: float,
    title: str = "",
    overlay_title: str = "",
    words: list = None,
    target_width: int = 1080,
    target_height: int = 1920,
) -> str:
    """
    Cut + crop + scale in a SINGLE FFmpeg pass.
    Replaces the two-step cut_clip() → reframe_to_vertical() pipeline.
    This is ~2× faster since the video is only encoded once.
    """
    import json
    from app.ffmpeg.ass_generator import generate_ass_file

    if not os.path.isfile(input_path):
        raise FileNotFoundError(f"Input video file not found: {input_path}")

    ensure_dir(os.path.dirname(output_path))
    duration = end - start

    # Get source dimensions
    src_width, src_height, fps = _get_video_dimensions(input_path)

    # Calculate crop dimensions (center crop for 9:16)
    crop_height = src_height
    crop_width = int(crop_height * target_width / target_height)

    if crop_width > src_width:
        crop_width = src_width
        crop_height = int(crop_width * target_height / target_width)

    crop_x = (src_width - crop_width) // 2
    crop_y = (src_height - crop_height) // 2

    # Single FFmpeg command: seek + crop + scale + grading + subtitles
    vf_filters = [f"crop={crop_width}:{crop_height}:{crop_x}:{crop_y}", f"scale={target_width}:{target_height}"]

    ass_path = None
    has_text_to_render = (words and len(words) > 0) or overlay_title
    if has_text_to_render:
        # Save intermediate ASS file to a temp directory
        temp_dir = os.path.join(os.path.dirname(os.path.dirname(output_path)), "temp")
        ensure_dir(temp_dir)
        ass_path = os.path.join(temp_dir, f"{os.path.basename(output_path)}.ass")
        
        _, scene_category = generate_ass_file(words if words else [], ass_path, overlay_title=overlay_title)
        
        # Apply AI color grading BEFORE subtitles so text colors are preserved
        if scene_category == "Educational":
            vf_filters.append("eq=contrast=1.05:saturation=1.1:brightness=0.02")
        elif scene_category == "Motivational":
            vf_filters.append("eq=contrast=1.15:saturation=1.2:gamma=0.9")
        elif scene_category == "Tech":
            vf_filters.append("eq=contrast=1.1:saturation=0.95:gamma=0.95")
        elif scene_category == "Podcast":
            vf_filters.append("eq=contrast=1.02:saturation=1.05")
        
        # FFmpeg requires escaping for the subtitles filter path on Windows
        clean_ass_path = ass_path.replace("\\", "/").replace(":", "\\:")
        vf_filters.append(f"subtitles='{clean_ass_path}'")
    elif title:
        clean_title = title.replace("'", "").replace(":", "\\:").replace(",", "\\,")
        font_path = "C\\:/Windows/Fonts/arial.ttf"
        vf_filters.append(f"drawtext=fontfile='{font_path}':text='{clean_title}':fontcolor=white:fontsize=48:box=1:boxcolor=black@0.6:boxborderw=20:x=(w-text_w)/2:y=200")

    vf_filter_str = ",".join(vf_filters)

    cmd = [
        settings.ffmpeg_path,
        "-ss", str(start),           # Input-level seek (instant)
        "-i", input_path,
        "-t", str(duration),
        "-vf", vf_filter_str,        # Crop + scale + grade + sub in one pass
        "-c:v", "libx264",
        "-preset", "ultrafast",
        "-crf", "23",
        "-c:a", "aac",
        "-b:a", "128k",
        "-avoid_negative_ts", "make_zero",
        "-y",
        output_path,
    ]

    logger.info(f"Cut+reframe: {start:.1f}s → {end:.1f}s, crop({crop_width}x{crop_height}) → {target_width}x{target_height}")

    try:
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=300)
    except subprocess.TimeoutExpired:
        logger.error("FFmpeg cut+reframe timed out after 300 seconds")
        raise RuntimeError("FFmpeg processing timed out")
    finally:
        # Ensure temporary files are cleaned up safely
        if ass_path and os.path.exists(ass_path):
            try:
                os.remove(ass_path)
                logger.info(f"Cleaned up temp file: {ass_path}")
            except OSError as e:
                logger.warning(f"Failed to clean up temp file {ass_path}: {e}")

    if result.returncode != 0:
        logger.error(f"FFmpeg error: {result.stderr}")
        raise RuntimeError(f"FFmpeg cut+reframe failed: {result.stderr}")

    logger.info(f"Cut+reframe saved: {output_path}")
    return output_path

