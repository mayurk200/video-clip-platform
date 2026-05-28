/**
 * Allowed video MIME types.
 */
export const ALLOWED_VIDEO_TYPES = [
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "video/x-msvideo",
  "video/x-matroska",
];

/**
 * Validate that a value is a valid email.
 */
export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Validate password strength (min 6 chars).
 */
export function isValidPassword(password) {
  return typeof password === "string" && password.length >= 6;
}
