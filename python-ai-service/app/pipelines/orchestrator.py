"""
Master pipeline orchestrator — coordinates the full processing workflow.
Uses parallel processing for clip generation and batch AI calls to maximize throughput.
"""
import os
from concurrent.futures import ThreadPoolExecutor, as_completed
from app.transcription.service import transcribe_video
from app.scoring.viral_scorer import analyze_transcript_for_viral_moments
from app.scoring.clip_ranker import rank_clips
from app.ffmpeg.clipper import cut_and_reframe
from app.thumbnails.extractor import extract_best_thumbnails
from app.captions.generator import generate_caption_data
from app.hooks.generator import generate_hooks_batch
from app.config import get_settings
from app.utils.logger import get_logger
from app.utils.file_utils import ensure_dir

logger = get_logger(__name__)
settings = get_settings()


def _process_single_clip(
    i: int,
    clip,
    video_path: str,
    video_id: str,
    output_dir: str,
    thumb_dir: str,
    segments,
) -> dict:
    """Process a single clip (cut+reframe in one pass → thumbnails → captions)."""
    clip_filename = f"clip_{i:02d}.mp4"
    vertical_path = os.path.join(output_dir, clip_filename)

    try:
        # Single-pass: cut + crop + scale (no intermediate raw file)
        cut_and_reframe(video_path, vertical_path, clip.clip_start, clip.clip_end)

        # Extract thumbnails
        thumbnails = extract_best_thumbnails(vertical_path, thumb_dir, count=2)

        # Generate caption data from transcript words in time range
        clip_words = _get_words_in_range(segments, clip.clip_start, clip.clip_end)
        captions = generate_caption_data(clip_words)

        # Get clip text for later batch hook generation
        clip_text = _get_text_in_range(segments, clip.clip_start, clip.clip_end)

        result = {
            **clip.model_dump(),
            "file_path": vertical_path,
            "thumbnails": thumbnails,
            "captions": captions,
            "hooks": [],  # Filled in batch after all clips are processed
            "_clip_text": clip_text[:200] if clip_text else "",
            "index": i,
        }

        logger.info(f"Clip {i} processed: score={clip.viral_score}")
        return result

    except Exception as e:
        logger.error(f"Failed to process clip {i}: {e}")
        return None


def run_full_pipeline(video_path: str, video_id: str) -> dict:
    """
    Execute the complete processing pipeline:
    1. Transcribe (Groq Whisper API — fast)
    2. Analyze for viral moments (Groq LLM)
    3. Rank clips
    4. Process clips in parallel (single-pass cut+reframe + captions + thumbnails)
    5. Batch-generate hooks for all clips (single Groq call)
    """
    logger.info(f"Starting full pipeline for video: {video_id}")

    # 1. Transcribe
    transcription = transcribe_video(video_path)

    # 2. Analyze
    viral_clips = analyze_transcript_for_viral_moments(
        transcription.full_text,
        [s.model_dump() for s in transcription.segments],
    )

    # 3. Rank
    ranked = rank_clips(viral_clips, top_n=settings.top_clips_count)

    # 4. Process clips in parallel (cut+reframe + thumbnails + captions)
    output_dir = os.path.join(settings.storage_path, "clips", video_id)
    thumb_dir = os.path.join(settings.storage_path, "thumbnails", video_id)
    ensure_dir(output_dir)
    ensure_dir(thumb_dir)

    processed_clips = []
    max_workers = min(4, len(ranked))  # Up to 4 concurrent clip processors

    if max_workers > 0:
        logger.info(f"Processing {len(ranked)} clips in parallel (max {max_workers} workers)")

        with ThreadPoolExecutor(max_workers=max_workers) as executor:
            futures = {
                executor.submit(
                    _process_single_clip,
                    i, clip, video_path, video_id,
                    output_dir, thumb_dir, transcription.segments,
                ): i
                for i, clip in enumerate(ranked)
            }

            for future in as_completed(futures):
                clip_idx = futures[future]
                try:
                    result = future.result()
                    if result is not None:
                        processed_clips.append(result)
                except Exception as e:
                    logger.error(f"Clip {clip_idx} failed in thread: {e}")

        # Sort by index to maintain order
        processed_clips.sort(key=lambda c: c["index"])

    # 5. Batch-generate hooks (single Groq call for all clips)
    if processed_clips:
        clip_texts = [c.get("_clip_text", "") for c in processed_clips]
        non_empty_texts = [t for t in clip_texts if t]

        if non_empty_texts:
            logger.info(f"Batch-generating hooks for {len(non_empty_texts)} clips")
            all_hooks = generate_hooks_batch(non_empty_texts)

            # Map hooks back to clips
            hook_idx = 0
            for clip in processed_clips:
                if clip.get("_clip_text"):
                    clip["hooks"] = all_hooks[hook_idx] if hook_idx < len(all_hooks) else []
                    hook_idx += 1

        # Clean up temporary _clip_text field
        for clip in processed_clips:
            clip.pop("_clip_text", None)

    result = {
        "video_id": video_id,
        "transcription": transcription.model_dump(),
        "clips": processed_clips,
        "total_clips": len(processed_clips),
    }

    logger.info(f"Pipeline complete: {len(processed_clips)} clips generated")
    return result


def _get_words_in_range(segments, start: float, end: float) -> list:
    """Extract word-level data within a time range."""
    words = []
    for seg in segments:
        for w in seg.words:
            if start <= w.start <= end:
                words.append({"word": w.word, "start": w.start - start, "end": w.end - start})
    return words


def _get_text_in_range(segments, start: float, end: float) -> str:
    """Extract text within a time range."""
    parts = []
    for seg in segments:
        if seg.start >= start and seg.end <= end:
            parts.append(seg.text)
        elif seg.start < end and seg.end > start:
            parts.append(seg.text)
    return " ".join(parts)

