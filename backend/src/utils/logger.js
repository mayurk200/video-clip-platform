import winston from "winston";
import config from "../config/index.js";
import util from "util";
import { EventEmitter } from "events";

/**
 * Centralized logging system with in-memory circular buffer and event emission.
 * Supports module-scoped child loggers for structured monitoring.
 */

// ── Event Bus ────────────────────────────────────────────────
export const logEmitter = new EventEmitter();
logEmitter.setMaxListeners(50); // Prevent warnings for many SSE clients

// ── Circular Log Buffer ──────────────────────────────────────
const MAX_BUFFER_SIZE = 10000;
const logBuffer = [];
let logIdCounter = 0;

export function getLogBuffer() {
  return logBuffer;
}

export function clearLogBuffer() {
  logBuffer.length = 0;
  logIdCounter = 0;
}

export function getLogCount() {
  return logBuffer.length;
}

// ── Custom Winston Transport: Buffer + Emit ──────────────────
class MonitorTransport extends winston.Transport {
  log(info, callback) {
    setImmediate(() => {
      const entry = {
        id: ++logIdCounter,
        timestamp: info.timestamp || new Date().toISOString(),
        level: info.level?.replace(/\u001b\[\d+m/g, "") || "info", // Strip ANSI
        module: info.module || "System",
        process: info.process || "",
        message: typeof info.message === "string" ? info.message : String(info.message),
        metadata: info.metadata || null,
      };

      // Push to circular buffer
      logBuffer.push(entry);
      if (logBuffer.length > MAX_BUFFER_SIZE) {
        logBuffer.shift();
      }

      // Emit for SSE streaming
      logEmitter.emit("log", entry);
    });
    callback();
  }
}

// ── Winston Logger ───────────────────────────────────────────
const logger = winston.createLogger({
  level: config.isDev ? "debug" : "info",
  levels: {
    error: 0,
    warn: 1,
    success: 2,
    info: 3,
    debug: 4,
  },
  format: winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss.SSS" }),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: "clipforge-backend" },
  transports: [
    // Console output (human-readable)
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize({
          colors: { error: "red", warn: "yellow", success: "green", info: "blue", debug: "gray" },
        }),
        winston.format.printf(({ timestamp, level, message, module, process: proc, ...meta }) => {
          const modStr = module ? `[${module}]` : "";
          const procStr = proc ? `(${proc})` : "";
          const cleanMeta = { ...meta };
          delete cleanMeta.service;
          delete cleanMeta.metadata;
          if (meta.metadata) Object.assign(cleanMeta, meta.metadata);
          const metaStr = Object.keys(cleanMeta).length > 0
            ? ` ${util.inspect(cleanMeta, { depth: 3, compact: true })}`
            : "";
          return `${timestamp} [${level}] ${modStr}${procStr}: ${message}${metaStr}`;
        })
      ),
    }),
    // Monitor transport (buffer + SSE)
    new MonitorTransport(),
  ],
});

// Add custom 'success' level color
winston.addColors({ error: "red", warn: "yellow", success: "green", info: "blue", debug: "gray" });

// ── Module-Scoped Logger Factory ─────────────────────────────
/**
 * Creates a child logger scoped to a specific module.
 * Usage: const log = logger.module("DownloadService");
 *        log.info("Download started", { url });
 */
logger.module = function (moduleName) {
  return {
    info: (message, metadata, processName) =>
      logger.info(message, { module: moduleName, process: processName, metadata }),
    success: (message, metadata, processName) =>
      logger.log("success", message, { module: moduleName, process: processName, metadata }),
    warn: (message, metadata, processName) =>
      logger.warn(message, { module: moduleName, process: processName, metadata }),
    error: (message, metadata, processName) =>
      logger.error(message, { module: moduleName, process: processName, metadata }),
    debug: (message, metadata, processName) =>
      logger.debug(message, { module: moduleName, process: processName, metadata }),
  };
};

export default logger;
