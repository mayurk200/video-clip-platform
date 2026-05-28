import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind classes with clsx — used by ShadCN components.
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Format seconds → mm:ss or hh:mm:ss
 */
export function formatDuration(seconds) {
  if (!seconds || isNaN(seconds)) return "0:00";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}

/**
 * Format file size in human-readable form.
 */
export function formatFileSize(bytes) {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  let i = 0;
  let size = bytes;
  while (size >= 1024 && i < units.length - 1) {
    size /= 1024;
    i++;
  }
  return `${size.toFixed(1)} ${units[i]}`;
}

/**
 * Viral score → color mapping.
 */
export function getScoreColor(score) {
  if (score >= 80) return "#10B981"; // green
  if (score >= 60) return "#FFB347"; // amber
  if (score >= 40) return "#3B82F6"; // blue
  return "#EF4444"; // red
}

/**
 * Truncate text with ellipsis.
 */
export function truncate(str, maxLength = 60) {
  if (!str) return "";
  return str.length > maxLength ? str.slice(0, maxLength) + "…" : str;
}
