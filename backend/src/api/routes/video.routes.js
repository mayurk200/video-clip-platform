import { Router } from "express";
import { upload, uploadLocal, uploadYouTube, list, getById, getStatus, deleteVideo, retryVideo, deleteAll } from "../../controllers/video.controller.js";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import { uploadVideo } from "../../middleware/upload.middleware.js";
import { uploadLimiter } from "../../middleware/rateLimiter.middleware.js";

const router = Router();

router.use(authMiddleware);

router.post("/upload", uploadLimiter, uploadVideo, upload);
router.post("/upload-local", uploadLimiter, uploadLocal);
router.post("/youtube", uploadLimiter, uploadYouTube);
router.get("/", list);
router.delete("/", deleteAll);
router.get("/:id", getById);
router.get("/:id/status", getStatus);
router.post("/:id/retry", retryVideo);
router.delete("/:id", deleteVideo);

export default router;
