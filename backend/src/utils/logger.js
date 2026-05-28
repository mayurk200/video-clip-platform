import winston from "winston";
import config from "../config/index.js";
import util from "util";

/**
 * Application logger using Winston.
 */
const logger = winston.createLogger({
  level: config.isDev ? "debug" : "info",
  format: winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: "clipforge-backend" },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ timestamp, level, message, ...meta }) => {
          if (meta.error instanceof Error) {
            meta.error = meta.error.message;
            meta.stack = meta.error.stack;
          }
          const metaStr = Object.keys(meta).length > 0 ? ` ${util.inspect(meta, { depth: 3, compact: true })}` : "";
          return `${timestamp} [${level}]: ${message}${metaStr}`;
        })
      ),
    }),
  ],
});

export default logger;
