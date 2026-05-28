import logger from "../utils/logger.js";
import { processClip } from "./workers/clipGenerator.worker.js";

export async function addClipGenerationJob(clipId, options) {
  logger.info(`Queued local clip generation job`, { clipId });

  processClip({ clipId, ...options }).catch(err => {
    logger.error("Local clip rendering failed", err);
  });

  return { id: `local-${clipId}` };
}
