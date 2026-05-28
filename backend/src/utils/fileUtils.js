import fs from "fs/promises";
import path from "path";

/**
 * Ensure a directory exists, creating it recursively if needed.
 */
export async function ensureDir(dirPath) {
  await fs.mkdir(dirPath, { recursive: true });
}

/**
 * Safely delete a file, ignoring if it doesn't exist.
 */
export async function safeDelete(filePath) {
  try {
    await fs.unlink(filePath);
  } catch (err) {
    if (err.code !== "ENOENT") throw err;
  }
}

/**
 * Get file extension from a filename.
 */
export function getExtension(filename) {
  return path.extname(filename).toLowerCase();
}
