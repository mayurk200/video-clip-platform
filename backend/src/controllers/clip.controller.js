import clipService from "../services/clip.service.js";
import { successResponse } from "../utils/responseHelper.js";

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
