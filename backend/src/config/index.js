import dotenv from "dotenv";
dotenv.config();

/**
 * Central configuration loaded from environment variables.
 */
const config = {
  port: parseInt(process.env.PORT || "3001"),
  nodeEnv: process.env.NODE_ENV || "development",
  isDev: process.env.NODE_ENV !== "production",

  jwt: {
    secret: process.env.JWT_SECRET || "change-me",
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  },

  redis: {
    host: process.env.REDIS_HOST || "localhost",
    port: parseInt(process.env.REDIS_PORT || "6379"),
    password: process.env.REDIS_PASSWORD || undefined,
  },

  aiService: {
    url: process.env.AI_SERVICE_URL || "http://localhost:8000",
  },

  storage: {
    path: process.env.STORAGE_PATH || "../storage",
    maxUploadSizeMB: parseInt(process.env.MAX_UPLOAD_SIZE_MB || "2048"),
  },

  processing: {
    maxConcurrentJobs: parseInt(process.env.MAX_CONCURRENT_JOBS || "2"),
  },
};

export default config;
