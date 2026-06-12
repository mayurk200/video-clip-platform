import os
import subprocess
import tempfile
from groq import Groq
from app.config import get_settings
from app.transcription.models import TranscriptionResult, Segment, Word
from app.utils.logger import get_logger

logger = get_logger(__name__)
_groq_client = None
_whisper_model = None


def _get_groq_client() -> Groq:
    """Get or create the Groq client for Whisper API."""
    global _groq_client
    if _groq_client is None:
        settings = get_settings()
        _groq_client = Groq(api_key=settings.groq_api_key)
        logger.info("Groq Whisper client initialized")
    return _groq_client


def _get_local_model():
    """Lazy-load the local Whisper model (fallback only)."""
    global _whisper_model
    if _whisper_model is None:
        from faster_whisper import WhisperModel
        settings = get_settings()
        logger.info(f"Loading local Whisper model: {settings.whisper_model_size} on {settings.whisper_device}")
        _whisper_model = WhisperModel(
            settings.whisper_model_size,
            device=settings.whisper_device,
            compute_type=settings.whisper_compute_type,
        )
        logger.info("Local Whisper model loaded")
    return _whisper_model


def _extract_audio(video_path: str, output_path: str) -> str:
    """Extract audio from video as compressed M4A for API upload (keeps file small)."""
    settings = get_settings()
    cmd = [
        settings.ffmpeg_path,
        "-i", video_path,
        "-vn",                    # No video
        "-acodec", "aac",         # Compressed audio
        "-b:a", "64k",            # Low bitrate to stay under 25MB
        "-ar", "16000",           # 16kHz sample rate (optimal for Whisper)
        "-ac", "1",               # Mono
        "-y",
        output_path,
    ]
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        raise RuntimeError(f"Audio extraction failed: {result.stderr}")
    return output_path


def _transcribe_with_groq(video_path: str) -> TranscriptionResult:
    """
    Transcribe using Groq Whisper API (cloud).
    ~50-100x faster than local CPU Whisper.
    Skips audio extraction for small files (< 25MB) to save time.
    """
    logger.info(f"Transcribing via Groq Whisper API: {video_path}")
    client = _get_groq_client()

    video_size_mb = os.path.getsize(video_path) / (1024 * 1024)

    # Fast path: send video directly if small enough (skip audio extraction)
    if video_size_mb < 25:
        logger.info(f"Video is {video_size_mb:.1f}MB — sending directly (skipping audio extraction)")
        ext = os.path.splitext(video_path)[1] or ".mp4"
        filename = f"video{ext}"

        try:
            with open(video_path, "rb") as video_file:
                response = client.audio.transcriptions.create(
                    file=(filename, video_file),
                    model="whisper-large-v3-turbo",
                    response_format="verbose_json",
                    timestamp_granularities=["word", "segment"],
                )
            return _parse_groq_response(response)
        except Exception as e:
            logger.warning(f"Direct upload failed ({e}), falling back to audio extraction")

    # Standard path: extract audio first (for large files or if direct upload failed)
    temp_dir = tempfile.mkdtemp()
    audio_path = os.path.join(temp_dir, "audio.m4a")

    try:
        _extract_audio(video_path, audio_path)
        audio_size_mb = os.path.getsize(audio_path) / (1024 * 1024)
        logger.info(f"Extracted audio: {audio_size_mb:.1f} MB")

        if audio_size_mb > 25:
            logger.warning(f"Audio file is {audio_size_mb:.1f}MB (> 25MB limit). Chunking...")
            return _transcribe_chunked_groq(video_path, audio_path)

        # Single-file transcription
        with open(audio_path, "rb") as audio_file:
            response = client.audio.transcriptions.create(
                file=("audio.m4a", audio_file),
                model="whisper-large-v3-turbo",
                response_format="verbose_json",
                timestamp_granularities=["word", "segment"],
            )

        return _parse_groq_response(response)

    finally:
        # Cleanup temp files
        try:
            os.remove(audio_path)
            os.rmdir(temp_dir)
        except OSError:
            pass


def _transcribe_chunked_groq(video_path: str, full_audio_path: str) -> TranscriptionResult:
    """
    Handle large files by splitting audio into chunks and transcribing each.
    """
    settings = get_settings()
    client = _get_groq_client()
    temp_dir = os.path.dirname(full_audio_path)

    # Get audio duration via ffprobe
    probe_cmd = [
        settings.ffprobe_path, "-v", "error",
        "-show_entries", "format=duration",
        "-of", "default=noprint_wrappers=1:nokey=1",
        full_audio_path,
    ]
    probe_result = subprocess.run(probe_cmd, capture_output=True, text=True)
    total_duration = float(probe_result.stdout.strip())

    # Split into 10-minute chunks (should be well under 25MB each at 64kbps)
    chunk_duration = 600  # 10 minutes
    all_segments = []
    all_text_parts = []
    time_offset = 0.0
    chunk_idx = 0
    detected_language = "en"

    while time_offset < total_duration:
        chunk_path = os.path.join(temp_dir, f"chunk_{chunk_idx}.m4a")
        remaining = total_duration - time_offset
        duration = min(chunk_duration, remaining)

        # Extract chunk
        cmd = [
            settings.ffmpeg_path,
            "-ss", str(time_offset),
            "-i", full_audio_path,
            "-t", str(duration),
            "-c", "copy",
            "-y",
            chunk_path,
        ]
        subprocess.run(cmd, capture_output=True, text=True)

        try:
            with open(chunk_path, "rb") as chunk_file:
                response = client.audio.transcriptions.create(
                    file=(f"chunk_{chunk_idx}.m4a", chunk_file),
                    model="whisper-large-v3-turbo",
                    response_format="verbose_json",
                    timestamp_granularities=["word", "segment"],
                )

            # Parse and offset timestamps
            chunk_result = _parse_groq_response(response, time_offset=time_offset)
            all_segments.extend(chunk_result.segments)
            all_text_parts.append(chunk_result.full_text)
            if chunk_idx == 0:
                detected_language = chunk_result.language

        finally:
            try:
                os.remove(chunk_path)
            except OSError:
                pass

        time_offset += duration
        chunk_idx += 1
        logger.info(f"Chunk {chunk_idx} transcribed (offset {time_offset:.1f}s)")

    return TranscriptionResult(
        full_text=" ".join(all_text_parts),
        segments=all_segments,
        language=detected_language,
        language_probability=1.0,
        duration=total_duration,
    )


def _parse_groq_response(response, time_offset: float = 0.0) -> TranscriptionResult:
    """Parse Groq Whisper API response into our TranscriptionResult model."""
    segments = []
    full_text_parts = []

    # Build word list from response
    all_words = []
    if hasattr(response, "words") and response.words:
        for w in response.words:
            w_dict = w if isinstance(w, dict) else w.__dict__ if hasattr(w, '__dict__') else w.model_dump() if hasattr(w, 'model_dump') else dict(w)
            # Some objects might not convert easily, let's just do attribute or get
            word_text = w.get("word", "") if isinstance(w, dict) else getattr(w, "word", "")
            w_start = w.get("start", 0) if isinstance(w, dict) else getattr(w, "start", 0)
            w_end = w.get("end", 0) if isinstance(w, dict) else getattr(w, "end", 0)
            
            word_text = word_text.strip()
            if word_text:
                all_words.append(
                    Word(
                        word=word_text,
                        start=round(float(w_start) + time_offset, 3),
                        end=round(float(w_end) + time_offset, 3),
                    )
                )

    # Build segments from response
    if hasattr(response, "segments") and response.segments:
        for seg in response.segments:
            seg_start = seg.get("start", 0) if isinstance(seg, dict) else getattr(seg, "start", 0)
            seg_end = seg.get("end", 0) if isinstance(seg, dict) else getattr(seg, "end", 0)
            seg_text = seg.get("text", "") if isinstance(seg, dict) else getattr(seg, "text", "")
            seg_text = seg_text.strip()
            
            seg_start = round(float(seg_start) + time_offset, 3)
            seg_end = round(float(seg_end) + time_offset, 3)

            # Find words belonging to this segment
            seg_words = [w for w in all_words if seg_start <= w.start <= seg_end]

            segment = Segment(
                text=seg_text,
                start=seg_start,
                end=seg_end,
                words=seg_words,
            )
            segments.append(segment)
            full_text_parts.append(seg_text)
    elif all_words:
        # No segments returned, create one big segment from all words
        response_text = response.get("text", "") if isinstance(response, dict) else getattr(response, "text", "")
        segment = Segment(
            text=response_text.strip() if response_text else " ".join(w.word for w in all_words),
            start=all_words[0].start if all_words else 0,
            end=all_words[-1].end if all_words else 0,
            words=all_words,
        )
        segments.append(segment)
        full_text_parts.append(segment.text)

    duration = getattr(response, "duration", None)
    if duration and time_offset == 0:
        duration = round(float(duration), 3)
    else:
        duration = segments[-1].end if segments else 0

    return TranscriptionResult(
        full_text=" ".join(full_text_parts) if full_text_parts else (response.text.strip() if hasattr(response, "text") else ""),
        segments=segments,
        language=getattr(response, "language", "en"),
        language_probability=1.0,
        duration=duration,
    )


def _transcribe_local(video_path: str) -> TranscriptionResult:
    """
    Transcribe using local Faster-Whisper (CPU fallback).
    WARNING: This is very slow on CPU (1-2x video duration).
    """
    logger.info(f"Transcribing locally (SLOW): {video_path}")
    model = _get_local_model()

    segments_raw, info = model.transcribe(
        video_path,
        word_timestamps=True,
        beam_size=5,
        vad_filter=True,
        vad_parameters=dict(min_silence_duration_ms=500),
    )

    segments = []
    full_text_parts = []

    for seg in segments_raw:
        words = []
        if seg.words:
            words = [
                Word(word=w.word.strip(), start=round(w.start, 3), end=round(w.end, 3))
                for w in seg.words
                if w.word.strip()
            ]

        segment = Segment(
            text=seg.text.strip(),
            start=round(seg.start, 3),
            end=round(seg.end, 3),
            words=words,
        )
        segments.append(segment)
        full_text_parts.append(seg.text.strip())

    result = TranscriptionResult(
        full_text=" ".join(full_text_parts),
        segments=segments,
        language=info.language,
        language_probability=round(info.language_probability, 3),
        duration=info.duration,
    )

    logger.info(f"Local transcription complete: {len(segments)} segments, language={info.language}")
    return result


def transcribe_video(video_path: str) -> TranscriptionResult:
    """
    Transcribe a video file.
    Uses Groq Whisper API by default (fast), falls back to local Faster-Whisper.
    """
    settings = get_settings()

    if settings.whisper_mode == "groq":
        # Do not catch and fallback silently here, as local transcription is VERY slow 
        # and freezes the backend. Better to fail fast.
        return _transcribe_with_groq(video_path)
    else:
        return _transcribe_local(video_path)
