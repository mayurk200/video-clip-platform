from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List
from concurrent.futures import ThreadPoolExecutor, as_completed
from app.ffmpeg.clipper import cut_clip_fast
from app.config import get_settings
from app.utils.logger import get_logger
from app.utils.file_utils import ensure_dir
import os

router = APIRouter()
settings = get_settings()
logger = get_logger(__name__)


class ClipSpec(BaseModel):
    id: str
    start: float
    end: float


class GenerateClipsRequest(BaseModel):
    video_path: str
    clips: List[ClipSpec]
    output_dir: str = None


def _cut_one_clip(clip: ClipSpec, video_path: str, output_dir: str) -> dict:
    """Cut a single clip — runs in a thread pool."""
    output_path = os.path.join(output_dir, f"{clip.id}.mp4")
    cut_clip_fast(video_path, output_path, clip.start, clip.end)
    return {"id": clip.id, "path": output_path}


@router.post("/clips/generate")
def generate_clips(request: GenerateClipsRequest):
    """Cut clips from source video concurrently using stream copy (no re-encoding)."""
    try:
        output_dir = request.output_dir if request.output_dir else os.path.join(settings.storage_path, "clips")
        ensure_dir(output_dir)

        results = []
        max_workers = min(4, len(request.clips)) if request.clips else 1

        logger.info(f"Generating {len(request.clips)} clips concurrently (max {max_workers} workers)")

        with ThreadPoolExecutor(max_workers=max_workers) as pool:
            futures = {
                pool.submit(_cut_one_clip, clip, request.video_path, output_dir): clip
                for clip in request.clips
            }
            for future in as_completed(futures):
                try:
                    result = future.result()
                    results.append(result)
                except Exception as e:
                    clip = futures[future]
                    logger.error(f"Failed to cut clip {clip.id}: {e}")

        logger.info(f"Generated {len(results)}/{len(request.clips)} clips")
        return {"clips": results, "total": len(results)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
