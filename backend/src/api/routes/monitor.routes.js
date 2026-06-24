import { Router } from "express";
import {
  getLogs,
  streamEvents,
  getProcesses,
  getDownloads,
  getStats,
  getErrors,
  clearLogs,
  deleteDownloadHistory,
  killAllProcesses,
} from "../../controllers/monitor.controller.js";

const router = Router();

// No auth — developer tool
router.get("/logs", getLogs);
router.get("/stream", streamEvents);
router.get("/processes", getProcesses);
router.get("/downloads", getDownloads);
router.get("/stats", getStats);
router.get("/errors", getErrors);
router.post("/clear", clearLogs);
router.post("/kill-all", killAllProcesses);
router.delete("/downloads/:id", deleteDownloadHistory);

export default router;
