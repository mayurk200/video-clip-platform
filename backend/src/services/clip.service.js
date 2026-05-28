import db from "../config/database.js";
import logger from "../utils/logger.js";

/**
 * Clip service — CRUD, render, export.
 */
const clipService = {
  async listByVideo(videoId) {
    return db.clips.findAll({ videoId }, { orderBy: { viralScore: "desc" } });
  },

  async getById(clipId) {
    const clip = db.clips.findOne({ id: clipId });
    if (!clip) throw Object.assign(new Error("Clip not found"), { statusCode: 404 });
    return clip;
  },

  async createMany(videoId, clipData) {
    const items = clipData.map((c) => ({
      videoId,
      title: c.suggested_title || c.title,
      hook: c.hook,
      startTime: c.clip_start,
      endTime: c.clip_end,
      duration: c.clip_end - c.clip_start,
      viralScore: c.viral_score,
      scores: c.scores || {},
      reason: c.reason,
      hashtags: c.hashtags || [],
      seoKeywords: c.seo_keywords || [],
    }));

    const clips = db.clips.insertMany(items);
    logger.info(`Created ${clipData.length} clips for video ${videoId}`);
    return clips;
  },

  async update(clipId, updates) {
    const clip = db.clips.updateOne({ id: clipId }, updates);
    return clip;
  },

  async delete(clipId) {
    db.clips.deleteOne({ id: clipId });
    logger.info(`Clip deleted: ${clipId}`);
  },
};

export default clipService;
