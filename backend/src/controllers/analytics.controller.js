import { successResponse } from "../utils/responseHelper.js";
import db from "../config/database.js";

export async function getDashboardStats(req, res, next) {
  try {
    const userId = req.user.id;
    const totalVideos = db.videos.count({ userId });

    // Get all clips for this user's videos
    const userVideos = db.videos.findAll({ userId });
    const videoIds = userVideos.map((v) => v.id);
    let totalClips = 0;
    let totalScore = 0;

    for (const vid of videoIds) {
      const clips = db.clips.findAll({ videoId: vid });
      totalClips += clips.length;
      for (const c of clips) {
        totalScore += c.viralScore || 0;
      }
    }

    return successResponse(res, {
      stats: {
        totalVideos,
        totalClips,
        avgViralScore: totalClips > 0 ? Math.round(totalScore / totalClips) : 0,
        avgProcessingTime: 0,
      },
    });
  } catch (err) { next(err); }
}
