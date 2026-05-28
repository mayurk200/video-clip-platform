import cv2
import numpy as np
from typing import List, Tuple
from app.utils.logger import get_logger

logger = get_logger(__name__)


def detect_scenes(video_path: str, threshold: float = 30.0) -> List[Tuple[float, float]]:
    """
    Detect scene changes in a video using frame differencing.
    Returns list of (start_time, end_time) tuples for each scene.
    """
    cap = cv2.VideoCapture(video_path)
    fps = cap.get(cv2.CAP_PROP_FPS) or 30

    prev_frame = None
    scene_starts = [0.0]
    frame_idx = 0

    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break

        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        gray = cv2.GaussianBlur(gray, (21, 21), 0)

        if prev_frame is not None:
            diff = cv2.absdiff(prev_frame, gray)
            mean_diff = np.mean(diff)

            if mean_diff > threshold:
                time = frame_idx / fps
                scene_starts.append(time)

        prev_frame = gray
        frame_idx += 1

    total_duration = frame_idx / fps
    cap.release()

    # Build scene ranges
    scenes = []
    for i in range(len(scene_starts)):
        start = scene_starts[i]
        end = scene_starts[i + 1] if i + 1 < len(scene_starts) else total_duration
        scenes.append((round(start, 3), round(end, 3)))

    logger.info(f"Detected {len(scenes)} scenes in {video_path}")
    return scenes
