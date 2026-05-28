import { Router } from "express";
import { getDashboardStats } from "../../controllers/analytics.controller.js";
import { authMiddleware } from "../../middleware/auth.middleware.js";

const router = Router();

router.use(authMiddleware);

router.get("/dashboard", getDashboardStats);

export default router;
