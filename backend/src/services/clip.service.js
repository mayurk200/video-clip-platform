import db from "../config/database.js";
import logger from "../utils/logger.js";

/**
 * Clip service — CRUD, render, export.
 */
const clipService = {
  async listByVideo(videoId) {
    return db.clips.findAll({ videoId }, { orderBy: { viralScore: "desc" } });
  },

  async listRecent(limit = 10) {
    const allClips = db.clips.findAll({}, { orderBy: { createdAt: "desc" } });
    return allClips.slice(0, limit);
  },

  async getById(clipId) {
    const clip = db.clips.findOne({ id: clipId });
    if (!clip) throw Object.assign(new Error("Clip not found"), { statusCode: 404 });
    return clip;
  },

  async createMany(videoId, clipData) {
    const items = clipData.map((c) => ({
      videoId,
      title: c.generated_title || c.suggested_title || c.title || "",
      hook: c.generated_hook || c.hook || "",
      startTime: c.clip_start,
      endTime: c.clip_end,
      duration: c.clip_end - c.clip_start,
      viralScore: c.viral_score,
      scores: {
        hook: c.hook_strength || 0,
        emotion: c.emotion_score || 0,
        curiosity: c.curiosity_score || 0,
        shareability: c.shareability_score || 0,
        retention: c.retention_score || 0,
      },
      reason: c.reason || "",
      audience: c.audience || "",
      platform: c.platform || "",
      thumbnailText: c.thumbnail_text || "",
      hashtags: c.hashtags || [],
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
