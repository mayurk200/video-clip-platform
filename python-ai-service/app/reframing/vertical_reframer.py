import os
from typing import Optional
from app.utils.logger import get_logger
from app.reframing.decision_engine import analyze_video_layout
from app.reframing.renderers.blur_renderer import render_blur_background
from app.reframing.renderers.split_renderer import render_split_screen
from app.reframing.renderers.smart_renderer import render_smart_crop

logger = get_logger(__name__)

def reframe_to_vertical(
    input_path: str,
    output_path: str,
    target_width: int = 1080,
    target_height: int = 1920,
    layout_mode: str = "auto"
) -> str:
    """
    Advanced Reframing Pipeline router.
    Routes the video to the appropriate renderer based on layout_mode.
    If 'auto', uses OpenCV Decision Engine to select the best mode.
    """
    logger.info(f"Reframing Pipeline Triggered. Requested mode: {layout_mode}")
    
    analysis = {}
    if layout_mode == "auto":
        logger.info("Auto mode selected. Running Decision Engine...")
        analysis = analyze_video_layout(input_path)
        layout_mode = analysis.get("mode", "smart_crop")
        logger.info(f"Decision Engine selected: {layout_mode}")

    if layout_mode == "blur_background":
        return render_blur_background(input_path, output_path, target_width, target_height)
        
    elif layout_mode == "split_screen":
        return render_split_screen(input_path, output_path, target_width, target_height)
        
    else:
        # Default / Smart Crop
        face_coords = analysis.get("face_coords", [])
        return render_smart_crop(input_path, output_path, face_coords, target_width, target_height)

