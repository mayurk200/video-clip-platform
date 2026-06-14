import { Router } from "express";
import { getSettingsController, updateSettingsController } from "../../controllers/settings.controller.js";

const router = Router();

router.get("/", getSettingsController);
router.put("/", updateSettingsController);

export default router;
