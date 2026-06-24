import videoService from "../../services/video.service.js";
import clipService from "../../services/clip.service.js";
import processingService from "../../services/processing.service.js";
import downloadService from "../../services/download.service.js";
import db from "../../config/database.js";
import logger from "../../utils/logger.js";
import fs from "fs";
import path from "path";
import storage from "../../config/storage.js";

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
  let { videoId, videoPath, sourceUrl } = jobData;
  logger.info(`▶ Starting video processing: ${videoId}`);

  let currentStep = "downloading";
  const t0 = Date.now();

  try {
    // ── Step 0: Download YouTube (if applicable) ───────────────
    if (sourceUrl && !videoPath) {
      currentStep = "downloading";
      await videoService.updateStatus(videoId, "DOWNLOADING");
      await updateJobStep(videoId, "downloading", "processing");
      logger.info(`  Step 0: Downloading YouTube video...`);
      const tD = Date.now();
      
      const folderName = `youtube_${videoId.substring(0, 8)}`;
      const videoDir = path.join(storage.root, folderName);
      const originalDir = path.join(videoDir, "original");
      const clipsDir = path.join(videoDir, "clips");
      await fs.promises.mkdir(originalDir, { recursive: true });
      await fs.promises.mkdir(clipsDir, { recursive: true });

      try {
        const metadata = await downloadService.getMetadata(sourceUrl);
        if (metadata && metadata.title) {
          db.videos.updateOne({ id: videoId }, { originalName: metadata.title, duration: metadata.duration });
        }
      } catch (e) {
        logger.warn("Could not fetch metadata, proceeding with generic name");
      }

      videoPath = await downloadService.downloadVideo(sourceUrl, originalDir, "video.mp4");
      
      const stats = await fs.promises.stat(videoPath);
      db.videos.updateOne({ id: videoId }, { filePath: videoPath, fileSize: stats.size });

      await updateJobStep(videoId, "downloading", "completed");
      logger.info(`  Step 0: Download done (${fmtMs(Date.now() - tD)})`);
    }

    // ── Pre-flight checks ──────────────────────────────────────
    if (!fs.existsSync(videoPath)) {
      throw new Error(`Video file not found on disk: ${videoPath}`);
    }

    try {
      await processingService.healthCheck();
    } catch (err) {
      throw new Error(`AI service is unreachable (http://localhost:8000). Cannot process video.`);
    }

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

    const videoRecord = db.videos.findOne({ id: videoId });
    const desiredClipCount = videoRecord?.desiredClipCount || null;
    const analysis = await processingService.analyzeTranscript(transcription, videoId, desiredClipCount);

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
      const outputDir = path.join(path.dirname(videoPath), "..", "clips");
      
      const transcriptRecord = db.transcripts.findOne({ videoId });
      const allWords = transcriptRecord?.segments?.flatMap(s => s.words) || [];
      
      const clipSpecs = clips.map((c) => {
        const clipWords = allWords.filter(w => w.end >= c.startTime && w.start <= c.endTime);
        // adjust word times to be relative to the clip start
        const adjustedWords = clipWords.map(w => ({
            word: w.word,
            start: Math.max(0, w.start - c.startTime),
            end: w.end - c.startTime
        }));
        return { 
          id: c.id, 
          start: c.startTime, 
          end: c.endTime, 
          title: c.title,
          overlay_title: c.thumbnailText,
          words: adjustedWords 
        };
      });

      const result = await processingService.generateClips(
        videoPath,
        clipSpecs,
        outputDir
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
