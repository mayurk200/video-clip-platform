import express from "express";
import cors from "cors";
import helmet from "helmet";
import config from "./config/index.js";
import routes from "./api/routes/index.js";
import { errorHandler } from "./middleware/errorHandler.middleware.js";
import { apiLimiter } from "./middleware/rateLimiter.middleware.js";
import logger from "./utils/logger.js";

const log = logger.module("API");

// Fix BigInt JSON serialization
BigInt.prototype.toJSON = function () {
  return this.toString();
};

const app = express();

// ---- Security ----
app.use(helmet());
app.use(cors({ origin: config.isDev ? "*" : process.env.FRONTEND_URL }));

// ---- Parsing ----
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// ---- Request Logging Middleware ----
app.use((req, res, next) => {
  // Skip SSE stream and static assets
  if (req.path === "/api/monitor/stream" || req.path.startsWith("/assets")) {
    return next();
  }
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    const level = res.statusCode >= 400 ? "warn" : "debug";
    log[level](`${req.method} ${req.path} ${res.statusCode} ${duration}ms`, {
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration,
    }, "request");
  });
  next();
});

// ---- Rate limiting ----
app.use("/api", apiLimiter);

// ---- Routes ----
app.use("/api", routes);

// ---- Error handler ----
app.use(errorHandler);

export default app;
