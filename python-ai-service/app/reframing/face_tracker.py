import cv2
import numpy as np
from typing import List, Tuple, Optional
from app.utils.logger import get_logger

logger = get_logger(__name__)

try:
    import mediapipe as mp
    mp_face = mp.solutions.face_detection
    MEDIAPIPE_AVAILABLE = True
except (ImportError, AttributeError):
    MEDIAPIPE_AVAILABLE = False
    logger.warning("MediaPipe not available, falling back to OpenCV face detection")


def detect_faces_mediapipe(frame: np.ndarray) -> List[Tuple[int, int, int, int]]:
    """Detect faces using MediaPipe. Returns list of (x, y, w, h) bounding boxes."""
    if not MEDIAPIPE_AVAILABLE:
        return detect_faces_opencv(frame)

    with mp_face.FaceDetection(min_detection_confidence=0.5) as detector:
        rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = detector.process(rgb)

        if not results.detections:
            return []

        h, w = frame.shape[:2]
        boxes = []
        for det in results.detections:
            bb = det.location_data.relative_bounding_box
            x = int(bb.xmin * w)
            y = int(bb.ymin * h)
            bw = int(bb.width * w)
            bh = int(bb.height * h)
            boxes.append((x, y, bw, bh))

        return boxes


def detect_faces_opencv(frame: np.ndarray) -> List[Tuple[int, int, int, int]]:
    """Fallback face detection using OpenCV Haar cascades."""
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    cascade = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_default.xml")
    faces = cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5, minSize=(60, 60))
    return [(x, y, w, h) for (x, y, w, h) in faces]


def get_face_center(frame: np.ndarray) -> Optional[Tuple[int, int]]:
    """Get the center point of the primary (largest) face."""
    faces = detect_faces_mediapipe(frame)
    if not faces:
        return None

    # Pick largest face
    largest = max(faces, key=lambda f: f[2] * f[3])
    x, y, w, h = largest
    return (x + w // 2, y + h // 2)
