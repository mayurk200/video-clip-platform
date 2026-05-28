import { Router } from "express";
import { listByVideo, getById, update, deleteClip, renderClip, exportClip } from "../../controllers/clip.controller.js";
import { authMiddleware } from "../../middleware/auth.middleware.js";

const router = Router();

router.use(authMiddleware);

router.get("/video/:videoId", listByVideo);
router.get("/:id", getById);
router.put("/:id", update);
router.delete("/:id", deleteClip);
router.post("/:id/render", renderClip);
router.post("/:id/export", exportClip);

export default router;
