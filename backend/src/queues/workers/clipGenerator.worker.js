import processingService from "../../services/processing.service.js";
import clipService from "../../services/clip.service.js";
import logger from "../../utils/logger.js";

/**
 * Worker for rendering individual clips locally.
 */
export async function processClip(jobData) {
  const { clipId, captionStyle, aspectRatio } = jobData;
  logger.info(`Rendering clip locally: ${clipId}`);

  try {
    const clip = await clipService.getById(clipId);
    await clipService.update(clipId, { status: "RENDERING" });

    const result = await processingService.renderClip(clip.filePath, {
      caption_style: captionStyle,
      aspect_ratio: aspectRatio,
      captions: clip.captions,
    });

    await clipService.update(clipId, {
      status: "COMPLETED",
      filePath: result.output_path,
      thumbnailPath: result.thumbnail_path,
    });

    logger.info(`Clip rendered: ${clipId}`);
  } catch (err) {
    await clipService.update(clipId, { status: "FAILED" });
    logger.error(`Clip render failed: ${clipId}`, { error: err.message });
    throw err;
  }
}
