import app from "./app.js";
import config from "./config/index.js";
import logger from "./utils/logger.js";
import videoService from "./services/video.service.js";
import monitorService from "./services/monitor.service.js";
import { processQueue } from "./queues/queue.manager.js";

const log = logger.module("Server");

const server = app.listen(config.port, async () => {
  log.success(`ClipForge backend running on port ${config.port}`);
  log.info(`Environment: ${config.nodeEnv}`);

  // Register server as a tracked process
  monitorService.registerProcess("server", "Express Server", `Listening on :${config.port}`);
  monitorService.completeProcess("server", "completed");

  // Recover any stuck jobs from previous run
  try {
    await videoService.recoverStuckJobs();
    processQueue(); // Kick off queue processing to pick up the recovered jobs
    log.success("Stuck job recovery completed");
  } catch (err) {
    log.error(`Failed to recover stuck jobs: ${err.message}`, { errorType: "StartupError", stack: err.stack });
  }
});

// Graceful shutdown
const shutdown = async (signal) => {
  log.warn(`${signal} received. Shutting down gracefully...`);
  monitorService.destroy();
  server.close(() => {
    log.info("Server closed");
    process.exit(0);
  });
  setTimeout(() => {
    log.error("Forced shutdown after timeout", { errorType: "ShutdownTimeout" });
    process.exit(1);
  }, 10000);
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

// Global error handlers → pipe to monitor
process.on("unhandledRejection", (reason) => {
  log.error(`Unhandled Promise Rejection: ${reason?.message || reason}`, {
    errorType: "UnhandledRejection",
    stack: reason?.stack,
    cause: "A promise was rejected without a .catch() handler",
  });
});

process.on("uncaughtException", (error) => {
  log.error(`Uncaught Exception: ${error.message}`, {
    errorType: "UncaughtException",
    stack: error.stack,
    cause: "An error was thrown without being caught",
  });
  // Give logger time to flush
  setTimeout(() => process.exit(1), 1000);
});
