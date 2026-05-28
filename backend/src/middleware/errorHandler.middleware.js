import logger from "../utils/logger.js";

/**
 * Global error handler middleware.
 */
export function errorHandler(err, req, res, next) {
  logger.error(err.message, { stack: err.stack, url: req.originalUrl, method: req.method });

  // Multer errors
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(413).json({ success: false, message: "File too large" });
  }

  if (err.message?.includes("Invalid file type")) {
    return res.status(400).json({ success: false, message: err.message });
  }

  const statusCode = err.statusCode || 500;
  const message = statusCode === 500 ? "Internal Server Error" : err.message;

  res.status(statusCode).json({ success: false, message });
}
