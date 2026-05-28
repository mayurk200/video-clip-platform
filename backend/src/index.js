import app from "./app.js";
import config from "./config/index.js";
import logger from "./utils/logger.js";
import videoService from "./services/video.service.js";

const server = app.listen(config.port, async () => {
  logger.info(`🚀 ClipForge backend running on port ${config.port}`);
  logger.info(`📡 Environment: ${config.nodeEnv}`);
  
  // Recover any stuck jobs from previous run
  try {
    await videoService.recoverStuckJobs();
  } catch (err) {
    logger.error(`Failed to recover stuck jobs on startup: ${err.message}`);
  }
});

// Graceful shutdown
const shutdown = async (signal) => {
  logger.info(`${signal} received. Shutting down gracefully...`);
  server.close(() => {
    logger.info("Server closed");
    process.exit(0);
  });
  setTimeout(() => {
    logger.error("Forced shutdown");
    process.exit(1);
  }, 10000);
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
