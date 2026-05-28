import IORedis from "ioredis";
import config from "./index.js";

/**
 * Shared Redis connection for BullMQ and caching.
 */
const redis = new IORedis({
  host: config.redis.host,
  port: config.redis.port,
  password: config.redis.password,
  maxRetriesPerRequest: null, // required by BullMQ
});

redis.on("error", (err) => {
  console.error("Redis connection error:", err.message);
});

redis.on("connect", () => {
  console.log("✅ Redis connected");
});

export default redis;
