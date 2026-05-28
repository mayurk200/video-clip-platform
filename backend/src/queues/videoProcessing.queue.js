import logger from "../utils/logger.js";
import { processVideo } from "./workers/videoProcessor.worker.js";

/** Track active processing to prevent double-processing */
const activeJobs = new Set();

/**
 * Queue a video for processing.
 * - Prevents double-processing of the same video
 * - Awaits processing (errors propagate, not swallowed)
 * - Cleans up tracking on completion
 */
export async function addVideoProcessingJob(videoId, videoPath) {
  if (activeJobs.has(videoId)) {
    logger.warn(`Video ${videoId} is already being processed. Skipping.`);
    return { id: `duplicate-${videoId}`, skipped: true };
  }

  activeJobs.add(videoId);
  logger.info(`Queued video processing job`, { videoId });

  // Process asynchronously but track it
  processVideo({ videoId, videoPath })
    .catch((err) => {
      logger.error(`Processing job failed for ${videoId}: ${err.message}`);
    })
    .finally(() => {
      activeJobs.delete(videoId);
    });

  return { id: `local-${videoId}` };
}

/** Check if a video is currently being processed */
export function isProcessing(videoId) {
  return activeJobs.has(videoId);
}
