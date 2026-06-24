import clipService from "../services/clip.service.js";
import { successResponse } from "../utils/responseHelper.js";
import path from "path";
import fs from "fs";

export async function listByVideo(req, res, next) {
  try {
    const clips = await clipService.listByVideo(req.params.videoId);
    return successResponse(res, { clips });
  } catch (err) { next(err); }
}

export async function listRecent(req, res, next) {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const clips = await clipService.listRecent(limit);
    return successResponse(res, { clips });
  } catch (err) { next(err); }
}

export async function getById(req, res, next) {
  try {
    const clip = await clipService.getById(req.params.id);
    return successResponse(res, { clip });
  } catch (err) { next(err); }
}

export async function update(req, res, next) {
  try {
    const clip = await clipService.update(req.params.id, req.body);
    return successResponse(res, { clip });
  } catch (err) { next(err); }
}

export async function deleteClip(req, res, next) {
  try {
    await clipService.delete(req.params.id);
    return successResponse(res, {}, "Clip deleted");
  } catch (err) { next(err); }
}

export async function renderClip(req, res, next) {
  try {
    // Trigger render via processing service (placeholder)
    return successResponse(res, { message: "Render job queued" });
  } catch (err) { next(err); }
}

export async function exportClip(req, res, next) {
  try {
    // Trigger export with platform settings (placeholder)
    const { platform } = req.body;
    return successResponse(res, { message: `Export for ${platform} queued` });
  } catch (err) { next(err); }
}

/**
 * GET /clips/:id/download — Stream clip file to client
 */
export async function downloadClip(req, res, next) {
  try {
    const clip = await clipService.getById(req.params.id);

    if (!clip.filePath || !fs.existsSync(clip.filePath)) {
      return res.status(404).json({ success: false, message: "Clip file not found on disk. It may not have been rendered yet." });
    }

    const filename = clip.title
      ? `${clip.title.replace(/[^a-zA-Z0-9_\- ]/g, "")}.mp4`
      : `clip_${clip.id}.mp4`;

    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-Type", "video/mp4");

    const stat = fs.statSync(clip.filePath);
    res.setHeader("Content-Length", stat.size);

    const stream = fs.createReadStream(clip.filePath);
    stream.pipe(res);
  } catch (err) { next(err); }
}

/**
 * PUT /clips/:id/captions — Update clip captions
 */
export async function updateCaptions(req, res, next) {
  try {
    const clip = await clipService.update(req.params.id, { captions: req.body.captions });
    return successResponse(res, { clip });
  } catch (err) { next(err); }
}

/**
 * PUT /clips/:id/thumbnail — Update clip thumbnail
 */
export async function updateThumbnail(req, res, next) {
  try {
    const clip = await clipService.update(req.params.id, { thumbnail: req.body });
    return successResponse(res, { clip });
  } catch (err) { next(err); }
}

