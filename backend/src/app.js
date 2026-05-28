import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import config from "./config/index.js";
import routes from "./api/routes/index.js";
import { errorHandler } from "./middleware/errorHandler.middleware.js";
import { apiLimiter } from "./middleware/rateLimiter.middleware.js";

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

// ---- Logging ----
if (config.isDev) {
  app.use(morgan("dev"));
}

// ---- Rate limiting ----
app.use("/api", apiLimiter);

// ---- Routes ----
app.use("/api", routes);

// ---- Error handler ----
app.use(errorHandler);

export default app;
