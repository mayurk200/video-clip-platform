import cv2
import os
import subprocess
import json
from app.utils.logger import get_logger
from typing import Tuple, Dict, Any

logger = get_logger(__name__)

def detect_faces(video_path: str, sample_duration: int = 5) -> Tuple[int, list]:
    """
    Samples the first `sample_duration` seconds of the video to detect faces.
    Returns the maximum number of distinct faces found concurrently and their approximate coordinates.
    """
    if not os.path.exists(video_path):
        return 0, []

    # Initialize Face Classifier
    cascade_path = os.path.join(cv2.data.haarcascades, 'haarcascade_frontalface_default.xml')
    face_cascade = cv2.CascadeClassifier(cascade_path)

    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        logger.error(f"Failed to open video: {video_path}")
        return 0, []

    fps = cap.get(cv2.CAP_PROP_FPS)
    if fps <= 0:
        fps = 30.0

    frame_interval = int(fps) # Sample 1 frame per second
    max_frames = int(fps * sample_duration)
    
    max_faces = 0
    best_faces_coords = []
    
    frame_count = 0
    while frame_count < max_frames:
        ret, frame = cap.read()
        if not ret:
            break
            
        if frame_count % frame_interval == 0:
            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            # Detect faces
            faces = face_cascade.detectMultiScale(
                gray,
                scaleFactor=1.1,
                minNeighbors=5,
                minSize=(60, 60)
            )
            
            num_faces = len(faces)
            if num_faces > max_faces:
                max_faces = num_faces
                best_faces_coords = faces.tolist() if num_faces > 0 else []

        frame_count += 1

    cap.release()
    logger.info(f"Detected max {max_faces} faces in {video_path}")
    return max_faces, best_faces_coords


def analyze_video_layout(video_path: str) -> Dict[str, Any]:
    """
    Analyzes the video and determines the best rendering mode.
    Modes: "blur_background", "smart_crop", "split_screen"
    """
    num_faces, face_coords = detect_faces(video_path)
    
    mode = "blur_background"
    if num_faces == 1:
        mode = "smart_crop"
    elif num_faces >= 2:
        mode = "split_screen"
        
    logger.info(f"Decision Engine selected mode: {mode} for {video_path}")
    
    return {
        "mode": mode,
        "num_faces": num_faces,
        "face_coords": face_coords
    }
