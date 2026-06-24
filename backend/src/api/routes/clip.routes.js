import { Router } from "express";
import { listByVideo, listRecent, getById, update, deleteClip, renderClip, exportClip, downloadClip, updateCaptions, updateThumbnail } from "../../controllers/clip.controller.js";
import { authMiddleware } from "../../middleware/auth.middleware.js";

const router = Router();

router.use(authMiddleware);

router.get("/recent", listRecent);
router.get("/video/:videoId", listByVideo);
router.get("/:id", getById);
router.get("/:id/download", downloadClip);
router.put("/:id", update);
router.put("/:id/captions", updateCaptions);
router.put("/:id/thumbnail", updateThumbnail);
router.delete("/:id", deleteClip);
router.post("/:id/render", renderClip);
router.post("/:id/export", exportClip);

export default router;
