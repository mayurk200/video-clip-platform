import rateLimit from "express-rate-limit";

/**
 * Rate limiters for different route groups.
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 20,
  message: { success: false, message: "Too many auth attempts. Try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

export const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 min
  max: 100,
  message: { success: false, message: "Rate limit exceeded." },
  standardHeaders: true,
  legacyHeaders: false,
});

export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  message: { success: false, message: "Upload limit reached. Try again in an hour." },
  standardHeaders: true,
  legacyHeaders: false,
});
