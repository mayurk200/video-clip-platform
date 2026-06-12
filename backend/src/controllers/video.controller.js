import videoService from "../services/video.service.js";
import { addVideoProcessingJob, isProcessing } from "../queues/videoProcessing.queue.js";
import { successResponse, errorResponse } from "../utils/responseHelper.js";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import storage from "../config/storage.js";

export async function upload(req, res, next) {
  try {
    if (!req.file) return errorResponse(res, "No video file provided", 400);
    const desiredClipCount = parseInt(req.body.desiredClipCount) || null;
    const video = await videoService.create(req.user.id, req.file, desiredClipCount);
    await addVideoProcessingJob(video.id, video.filePath);
    return successResponse(res, { video }, "Video uploaded and queued for processing", 201);
  } catch (err) { next(err); }
}

export async function list(req, res, next) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const result = await videoService.listByUser(req.user.id, page, limit);
    return successResponse(res, result);
  } catch (err) { next(err); }
}

export async function getById(req, res, next) {
  try {
    const video = await videoService.getById(req.params.id, req.user.id);
    return successResponse(res, { video });
  } catch (err) { next(err); }
}

export async function getStatus(req, res, next) {
  try {
    const status = await videoService.getProcessingStatus(req.params.id);
    return successResponse(res, status);
  } catch (err) { next(err); }
}

export async function deleteVideo(req, res, next) {
  try {
    await videoService.delete(req.params.id, req.user.id);
    return successResponse(res, {}, "Video deleted");
  } catch (err) { next(err); }
}

export async function deleteAll(req, res, next) {
  try {
    await videoService.deleteAll(req.user.id);
    return successResponse(res, {}, "All videos deleted");
  } catch (err) { next(err); }
}

/** Retry a failed video */
export async function retryVideo(req, res, next) {
  try {
    const videoId = req.params.id;

    if (isProcessing(videoId)) {
      return errorResponse(res, "Video is already being processed", 409);
    }

    const video = await videoService.resetForRetry(videoId);
    await addVideoProcessingJob(video.id, video.filePath);
    return successResponse(res, { video }, "Video re-queued for processing");
  } catch (err) { next(err); }
}

export async function uploadLocal(req, res, next) {
  try {
    const { localPath } = req.body;
    if (!localPath) return errorResponse(res, "No localPath provided", 400);

    const stats = await fs.stat(localPath);
    if (!stats.isFile()) return errorResponse(res, "Path is not a file", 400);

    const ext = path.extname(localPath);
    const originalName = path.basename(localPath);
    let baseName = path.basename(localPath, ext).replace(/[^a-zA-Z0-9_-]/g, "_");
    if (baseName.length > 50) baseName = baseName.substring(0, 50);
    const shortId = crypto.randomUUID().slice(0, 8);
    const folderName = `${baseName}_${shortId}`;
    
    const videoDir = path.join(storage.root, folderName);
    const originalDir = path.join(videoDir, "original");
    const clipsDir = path.join(videoDir, "clips");
    const tempDir = path.join(videoDir, "temp");

    await fs.mkdir(originalDir, { recursive: true });
    await fs.mkdir(clipsDir, { recursive: true });
    await fs.mkdir(tempDir, { recursive: true });

    let sanitizedBaseName = originalName.substring(0, originalName.length - ext.length).replace(/[^a-zA-Z0-9_.-]/g, "_");
    if (sanitizedBaseName.length > 50) sanitizedBaseName = sanitizedBaseName.substring(0, 50);
    const sanitizedName = `${sanitizedBaseName}${ext}`;
    const destination = path.join(originalDir, sanitizedName);

    await fs.copyFile(localPath, destination);

    // Verify copy succeeded
    try {
      await fs.access(destination);
    } catch {
      return errorResponse(res, "Failed to copy file to storage", 500);
    }

    const fileData = {
      filename: sanitizedName,
      originalname: originalName,
      path: destination,
      size: stats.size,
      mimetype: `video/${ext.replace(".", "")}`,
    };

    const desiredClipCount = parseInt(req.body.desiredClipCount) || null;
    const video = await videoService.create(req.user.id, fileData, desiredClipCount);
    await addVideoProcessingJob(video.id, video.filePath);
    return successResponse(res, { video }, "Local video copied and queued", 201);
  } catch (err) {
    if (err.code === "ENOENT") return errorResponse(res, "Local file not found", 404);
    next(err);
  }
}
