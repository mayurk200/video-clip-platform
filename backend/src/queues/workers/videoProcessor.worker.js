import videoService from "../../services/video.service.js";
import clipService from "../../services/clip.service.js";
import processingService from "../../services/processing.service.js";
import db from "../../config/database.js";
import logger from "../../utils/logger.js";
import fs from "fs";

/** Track step start times for elapsed calculation */
const stepTimers = {};

/** Helper: create/update a ProcessingJob step with elapsed time tracking */
async function updateJobStep(videoId, step, status, error = null) {
  const now = new Date();
  let elapsedMs = null;

  if (status === "processing") {
    stepTimers[step] = Date.now();
  } else if (status === "completed" || status === "failed") {
    if (stepTimers[step]) {
      elapsedMs = Date.now() - stepTimers[step];
      delete stepTimers[step];
    }
  }

  const metadata = elapsedMs !== null ? { elapsedMs } : undefined;
  const id = `${videoId}-${step}`;

  db.processingJobs.upsert(
    { id },
    { status, error, metadata, startedAt: status === "processing" ? now : undefined, completedAt: status === "completed" || status === "failed" ? now : undefined },
    { id, videoId, step, status, error, metadata, startedAt: status === "processing" ? now : undefined, completedAt: status === "completed" ? now : undefined }
  );
}

/** Format milliseconds to human-readable */
function fmtMs(ms) {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

/**
 * Production-ready video processor.
 * - Validates inputs before starting
 * - Health-checks the AI service
 * - Stops IMMEDIATELY on any error (no silent background failures)
 * - Logs step durations
 */
export async function processVideo(jobData) {
  const { videoId, videoPath } = jobData;
  logger.info(`▶ Starting video processing: ${videoId}`);

  // ── Pre-flight checks ──────────────────────────────────────
  // 1. Verify video file exists on disk
  if (!fs.existsSync(videoPath)) {
    const msg = `Video file not found on disk: ${videoPath}`;
    logger.error(msg);
    await videoService.updateStatus(videoId, "FAILED", msg);
    throw new Error(msg);
  }

  // 2. Health-check the Python AI service
  try {
    await processingService.healthCheck();
  } catch (err) {
    const msg = `AI service is unreachable (http://localhost:8000). Cannot process video.`;
    logger.error(msg);
    await videoService.updateStatus(videoId, "FAILED", msg);
    throw new Error(msg);
  }

  // ── Processing pipeline ────────────────────────────────────
  let currentStep = "transcription";

  try {
    // Step 1: Transcribe
    currentStep = "transcription";
    await videoService.updateStatus(videoId, "TRANSCRIBING");
    await updateJobStep(videoId, "transcription", "processing");
    logger.info(`  Step 1/4: Transcribing...`);
    const t0 = Date.now();

    const transcription = await processingService.transcribe(videoPath);

    db.transcripts.insert({
      videoId,
      fullText: transcription.full_text,
      segments: transcription.segments,
      language: transcription.language,
    });
    await updateJobStep(videoId, "transcription", "completed");
    logger.info(`  Step 1/4: Transcription done (${fmtMs(Date.now() - t0)}) — ${transcription.segments?.length || 0} segments`);

    // Step 2: AI Analysis
    currentStep = "analysis";
    await videoService.updateStatus(videoId, "ANALYZING");
    await updateJobStep(videoId, "analysis", "processing");
    logger.info(`  Step 2/4: Analyzing transcript for viral moments...`);
    const t1 = Date.now();

    const analysis = await processingService.analyzeTranscript(transcription, videoId);

    await updateJobStep(videoId, "analysis", "completed");
    logger.info(`  Step 2/4: Analysis done (${fmtMs(Date.now() - t1)}) — ${analysis.clips?.length || 0} clip candidates`);

    // Step 3: Create clip records
    currentStep = "clipping";
    await videoService.updateStatus(videoId, "CLIPPING");
    await updateJobStep(videoId, "clipping", "processing");
    const t2 = Date.now();

    if (analysis.clips && analysis.clips.length > 0) {
      await clipService.createMany(videoId, analysis.clips);
    }
    await updateJobStep(videoId, "clipping", "completed");
    logger.info(`  Step 3/4: Clip records created (${fmtMs(Date.now() - t2)})`);

    // Step 4: Generate clip files via FFmpeg
    currentStep = "rendering";
    await updateJobStep(videoId, "rendering", "processing");
    const clips = await clipService.listByVideo(videoId);
    const t3 = Date.now();

    if (clips.length > 0) {
      logger.info(`  Step 4/4: Cutting ${clips.length} clips...`);
      const result = await processingService.generateClips(
        videoPath,
        clips.map((c) => ({ id: c.id, start: c.startTime, end: c.endTime }))
      );

      if (result.clips && result.clips.length > 0) {
        for (const generated of result.clips) {
          await clipService.update(generated.id, {
            filePath: generated.path,
            status: "COMPLETED",
          });
        }
        logger.info(`  Step 4/4: ${result.clips.length} clips rendered (${fmtMs(Date.now() - t3)})`);
      }
    } else {
      logger.info(`  Step 4/4: No clips to render (skipped)`);
    }
    await updateJobStep(videoId, "rendering", "completed");

    // ── Success ─────────────────────────────────────────────
    const totalElapsed = fmtMs(Date.now() - t0);
    await videoService.updateStatus(videoId, "COMPLETED");
    logger.info(`✅ Video processing completed: ${videoId} (total: ${totalElapsed})`);

  } catch (err) {
    // ── Failure — stop immediately ─────────────────────────
    const errorMsg = err.response?.data?.detail || err.message || "Unknown error";
    logger.error(`❌ Video processing FAILED at step "${currentStep}": ${errorMsg}`);

    // Mark the current step as failed
    try {
      await updateJobStep(videoId, currentStep, "failed", errorMsg);
    } catch { /* ignore cleanup errors */ }

    // Mark the video as FAILED
    try {
      await videoService.updateStatus(videoId, "FAILED", `[${currentStep}] ${errorMsg}`);
    } catch { /* ignore cleanup errors */ }

    throw err; // Re-throw so caller knows it failed
  }
}
