import { getSettings, updateSettings } from "../config/settings.js";
import logger from "../utils/logger.js";

export async function getSettingsController(req, res, next) {
  try {
    const settings = getSettings();
    res.json(settings);
  } catch (error) {
    next(error);
  }
}

export async function updateSettingsController(req, res, next) {
  try {
    const updates = req.body;
    const newSettings = updateSettings(updates);
    logger.info("Settings updated via API");
    res.json(newSettings);
  } catch (error) {
    next(error);
  }
}
