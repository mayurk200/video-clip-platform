import db from "../config/database.js";
import { safeDelete } from "../utils/fileUtils.js";
import logger from "../utils/logger.js";

const PROCESSING_STATUSES = ["PREPARING", "DOWNLOADING", "TRANSCRIBING", "ANALYZING", "CLIPPING", "RENDERING"];

/**
 * Video service — CRUD, status tracking, retry logic.
 */
const videoService = {
  async create(userId, fileData, desiredClipCount = null) {
    const video = db.videos.insert({
      userId,
      filename: fileData.filename,
      originalName: fileData.originalname,
      filePath: fileData.path,
      fileSize: fileData.size,
      mimeType: fileData.mimetype,
      desiredClipCount: desiredClipCount,
      sourceType: "upload",
      status: "QUEUED",
    });
    logger.info(`Video created: ${video.id}`, { userId, filename: fileData.originalname, desiredClipCount });
    return video;
  },

  async createFromYouTube(userId, url, desiredClipCount = null) {
    const video = db.videos.insert({
      userId,
      filename: `youtube_${Date.now()}.mp4`,
      originalName: url, // Use URL as name until metadata is fetched
      filePath: null, // Will be set after download
      fileSize: null,
      mimeType: "video/mp4",
      desiredClipCount: desiredClipCount,
      sourceUrl: url,
      sourceType: "youtube",
      status: "QUEUED",
    });
    logger.info(`YouTube Video queued: ${video.id}`, { userId, url, desiredClipCount });
    return video;
  },

  async listByUser(userId, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const videos = db.videos.findAll({ userId }, { orderBy: { createdAt: "desc" }, skip, take: limit });
    const total = db.videos.count({ userId });

    // Attach clip counts
    const enriched = videos.map((v) => ({
      ...v,
      _count: { clips: db.clips.count({ videoId: v.id }) },
    }));

    return { videos: enriched, total };
  },

  async getById(videoId, userId) {
    const video = db.videos.findOne({ id: videoId, userId });
    if (!video) throw Object.assign(new Error("Video not found"), { statusCode: 404 });

    // Attach relations
    const transcript = db.transcripts.findOne({ videoId });
    video.transcript = transcript ? { id: transcript.id, language: transcript.language } : null;
    video._count = { clips: db.clips.count({ videoId }) };

    return video;
  },

  async updateStatus(videoId, status, errorMessage = null) {
    return db.videos.updateOne({ id: videoId }, { status, errorMessage });
  },

  async delete(videoId, userId) {
    const video = db.videos.findOne({ id: videoId, userId });
    if (!video) throw Object.assign(new Error("Video not found"), { statusCode: 404 });

    if (video.filePath) await safeDelete(video.filePath);

    // Clean up clips
    const clips = db.clips.findAll({ videoId });
    for (const clip of clips) {
      if (clip.filePath) await safeDelete(clip.filePath);
    }
    db.clips.deleteMany({ videoId });

    // Clean up transcript and jobs
    db.transcripts.deleteMany({ videoId });
    db.processingJobs.deleteMany({ videoId });

    // Delete video
    db.videos.deleteOne({ id: videoId });
    logger.info(`Video deleted (with all related data): ${videoId}`);
  },

  async deleteAll(userId) {
    const videos = db.videos.findAll({ userId });
    for (const video of videos) {
      await this.delete(video.id, userId);
    }
    logger.info(`All videos deleted for user: ${userId}`);
  },

  /** Reset a failed video for retry */
  async resetForRetry(videoId) {
    const video = db.videos.findOne({ id: videoId });
    if (!video) throw Object.assign(new Error("Video not found"), { statusCode: 404 });
    if (video.status !== "FAILED") {
      throw Object.assign(new Error("Only failed videos can be retried"), { statusCode: 400 });
    }

    // Clean up old processing data
    db.processingJobs.deleteMany({ videoId });
    db.transcripts.deleteMany({ videoId });

    const clips = db.clips.findAll({ videoId });
    for (const clip of clips) {
      if (clip.filePath) await safeDelete(clip.filePath);
    }
    db.clips.deleteMany({ videoId });

    // Reset video status
    db.videos.updateOne({ id: videoId }, { status: "QUEUED", errorMessage: null });

    logger.info(`Video reset for retry: ${videoId}`);
    return video;
  },

  async getProcessingStatus(videoId) {
    const jobs = db.processingJobs.findAll({ videoId }, { orderBy: { createdAt: "asc" } });
    const video = db.videos.findOne({ id: videoId });

    const steps = {};
    for (const job of jobs) {
      steps[job.step] = {
        status: job.status,
        startedAt: job.startedAt,
        completedAt: job.completedAt,
        elapsedMs: job.metadata?.elapsedMs || null,
        error: job.error || null,
      };
    }

    const status = video?.status?.toUpperCase() || "UNKNOWN";

    return {
      status: status.toLowerCase(),
      errorMessage: video?.errorMessage || null,
      canRetry: status === "FAILED",
      videoInfo: {
        originalName: video?.originalName || null,
        duration: video?.duration || null,
        fileSize: video?.fileSize ? Number(video.fileSize) : null,
      },
      steps,
    };
  },

  /** On startup: recover stuck jobs by re-queueing them */
  async recoverStuckJobs() {
    const stuckVideos = db.videos.findAll({ status: { in: PROCESSING_STATUSES } });

    if (stuckVideos.length === 0) return;

    logger.warn(`Found ${stuckVideos.length} stuck video(s) from previous session. Re-queueing them.`);
    for (const video of stuckVideos) {
      db.videos.updateOne(
        { id: video.id },
        {
          status: "QUEUED",
          errorMessage: null,
        }
      );

      // Clean up incomplete jobs so they start fresh
      const jobs = db.processingJobs.findAll({ videoId: video.id });
      for (const job of jobs) {
        if (job.status === "processing") {
          db.processingJobs.deleteOne({ id: job.id });
        }
      }
      logger.info(`  Re-queued stuck video: ${video.id}`);
    }
  },
};

export default videoService;
