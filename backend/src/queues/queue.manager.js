import db from "../config/database.js";
import logger from "../utils/logger.js";
import { processVideo } from "./workers/videoProcessor.worker.js";
import config from "../config/index.js";

const MAX_CONCURRENT = config.processing?.maxConcurrentJobs || 2;
let activeCount = 0;

/**
 * Main queue processing loop.
 * Picks up QUEUED videos from DB and starts processing them if under concurrency limit.
 */
export async function processQueue() {
  if (activeCount >= MAX_CONCURRENT) return;

  // Find next QUEUED video (orderBy createdAt asc ensures FIFO)
  const nextVideo = db.videos.findAll({ status: "QUEUED" }, { orderBy: { createdAt: "asc" }, take: 1 })[0];
  if (!nextVideo) return;

  // Lock the record so another async loop doesn't grab it
  db.videos.updateOne({ id: nextVideo.id }, { status: "PREPARING" });
  
  activeCount++;
  logger.info(`[Queue] Starting job for ${nextVideo.id}. Active: ${activeCount}/${MAX_CONCURRENT}`);

  processVideo({ videoId: nextVideo.id, videoPath: nextVideo.filePath, sourceUrl: nextVideo.sourceUrl })
    .catch(err => {
      logger.error(`[Queue] Error processing ${nextVideo.id}: ${err.message}`);
    })
    .finally(() => {
      activeCount--;
      // Process next item in queue
      processQueue();
    });

  // Recursively fill up to MAX_CONCURRENT
  processQueue();
}

/**
 * Add a video to the queue.
 */
export async function addVideoProcessingJob(videoId, videoPath = null) {
  logger.info(`[Queue] Video queued: ${videoId}`);
  db.videos.updateOne({ id: videoId }, { status: "QUEUED" });
  processQueue();
  return { id: `local-${videoId}` };
}

/**
 * Check if a video is currently processing.
 */
export function isProcessing(videoId) {
  const v = db.videos.findOne({ id: videoId });
  if (!v) return false;
  return !["QUEUED", "COMPLETED", "FAILED"].includes(v.status);
}
