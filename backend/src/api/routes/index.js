import { Router } from "express";
import authRoutes from "./auth.routes.js";
import videoRoutes from "./video.routes.js";
import clipRoutes from "./clip.routes.js";
import analyticsRoutes from "./analytics.routes.js";
import settingsRoutes from "./settings.routes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/videos", videoRoutes);
router.use("/clips", clipRoutes);
router.use("/analytics", analyticsRoutes);
router.use("/settings", settingsRoutes);

// Health check
router.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

export default router;
