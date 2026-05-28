import cv2
import numpy as np
from typing import Optional, Tuple
from app.utils.logger import get_logger

logger = get_logger(__name__)


def detect_motion_center(prev_frame: np.ndarray, curr_frame: np.ndarray) -> Optional[Tuple[int, int]]:
    """
    Detect the center of motion between two frames using optical flow.
    Falls back to frame center if no significant motion is detected.
    """
    prev_gray = cv2.cvtColor(prev_frame, cv2.COLOR_BGR2GRAY)
    curr_gray = cv2.cvtColor(curr_frame, cv2.COLOR_BGR2GRAY)

    # Compute dense optical flow
    flow = cv2.calcOpticalFlowFarneback(
        prev_gray, curr_gray, None,
        pyr_scale=0.5, levels=3, winsize=15,
        iterations=3, poly_n=5, poly_sigma=1.2, flags=0,
    )

    # Magnitude of flow
    magnitude = np.sqrt(flow[..., 0] ** 2 + flow[..., 1] ** 2)

    # Threshold for significant motion
    threshold = np.mean(magnitude) + np.std(magnitude)
    mask = magnitude > threshold

    if np.sum(mask) < 100:
        return None  # No significant motion

    # Find centroid of motion
    coords = np.argwhere(mask)
    center_y = int(np.mean(coords[:, 0]))
    center_x = int(np.mean(coords[:, 1]))

    return (center_x, center_y)
