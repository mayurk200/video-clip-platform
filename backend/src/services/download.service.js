import { spawn } from "child_process";
import { promisify } from "util";
import { exec } from "child_process";
import path from "path";
import fs from "fs/promises";
import logger from "../utils/logger.js";
import monitorService from "./monitor.service.js";
import { ensureDir } from "../utils/fileUtils.js";

const execAsync = promisify(exec);
const log = logger.module("DownloadService");

// Assuming python-ai-service virtual environment has yt-dlp installed
const ytdlpPath = path.resolve(process.cwd(), "../python-ai-service/.venv/Scripts/yt-dlp.exe");

/**
 * Parse yt-dlp progress output line.
 * Example: "[download]  45.2% of ~1.00GiB at  4.52MiB/s ETA 01:12"
 */
function parseProgressLine(line) {
  const progressMatch = line.match(/(\d+\.?\d*)%/);
  const sizeMatch = line.match(/of\s+~?([\d.]+\w+)/);
  const speedMatch = line.match(/at\s+([\d.]+\w+\/s)/);
  const etaMatch = line.match(/ETA\s+([\d:]+)/);
  const downloadedMatch = line.match(/([\d.]+\w+)\s+of/);

  return {
    progress: progressMatch ? parseFloat(progressMatch[1]) : null,
    total: sizeMatch ? sizeMatch[1] : null,
    speed: speedMatch ? speedMatch[1] : null,
    eta: etaMatch ? etaMatch[1] : null,
    downloaded: downloadedMatch ? downloadedMatch[1] : null,
  };
}

/**
 * Downloads YouTube videos using yt-dlp with real-time progress tracking.
 */
const downloadService = {
  /**
   * Fetches video metadata without downloading.
   */
  async getMetadata(url) {
    const processId = `metadata-${Date.now()}`;
    monitorService.registerProcess(processId, "Metadata Fetch", `Fetching: ${url}`);
    log.info(`Fetching metadata for: ${url}`, { url }, "getMetadata");

    try {
      const { stdout } = await execAsync(`"${ytdlpPath}" -j "${url}"`, { timeout: 30000 });
      const metadata = JSON.parse(stdout);
      monitorService.completeProcess(processId, "completed");
      log.success(`Metadata fetched: ${metadata.title}`, { title: metadata.title, duration: metadata.duration }, "getMetadata");
      return metadata;
    } catch (err) {
      monitorService.completeProcess(processId, "failed");
      log.error("Failed to fetch YouTube metadata", { error: err.message, url, errorType: "MetadataError" }, "getMetadata");
      throw new Error("Failed to fetch YouTube metadata. Ensure the URL is valid.");
    }
  },

  /**
   * Downloads the video with real-time progress tracking.
   */
  async downloadVideo(url, outputDir, filename, downloadId = null) {
    await ensureDir(outputDir);
    const outputPath = path.join(outputDir, filename);
    const dlId = downloadId || `dl-${Date.now()}`;
    const processId = `download-${dlId}`;

    return new Promise((resolve, reject) => {
      const args = [
        "-f", "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best",
        "--merge-output-format", "mp4",
        "--newline", // Force progress on new lines
        "-o", outputPath,
        url,
      ];

      const child = spawn(ytdlpPath, args, { stdio: ["ignore", "pipe", "pipe"] });

      monitorService.registerProcess(processId, "YouTube Download", `Downloading: ${url}`, () => {
        child.kill();
        reject(new Error("Process was cancelled"));
      });
      monitorService.registerDownload(dlId, dlId, "YouTube Video", url);
      monitorService.updateDownload(dlId, { status: "downloading" });
      log.info(`Starting YouTube download: ${url} -> ${outputPath}`, { url, outputPath }, "downloadVideo");

      let lastProgress = 0;

      child.stdout.on("data", (data) => {
        const lines = data.toString().split("\n");
        for (const line of lines) {
          if (line.includes("[download]")) {
            const parsed = parseProgressLine(line);
            if (parsed.progress !== null && parsed.progress !== lastProgress) {
              lastProgress = parsed.progress;
              monitorService.updateDownload(dlId, {
                progress: parsed.progress,
                speed: parsed.speed || "",
                eta: parsed.eta || "",
                downloaded: parsed.downloaded || "",
                total: parsed.total || "",
              });
              monitorService.updateProcess(processId, {
                progress: parsed.progress,
                activity: `${parsed.progress}% @ ${parsed.speed || "..."}`,
              });
              log.debug(`Download progress: ${parsed.progress}%`, {
                progress: parsed.progress,
                speed: parsed.speed,
                eta: parsed.eta,
              }, "downloadVideo");
            }
          }
          if (line.includes("[Merger]") || line.includes("Merging")) {
            monitorService.updateDownload(dlId, { status: "merging", progress: 99 });
            monitorService.updateProcess(processId, { activity: "Merging audio/video..." });
            log.info("Merging audio and video streams", null, "downloadVideo");
          }
        }
      });

      child.stderr.on("data", (data) => {
        const msg = data.toString().trim();
        if (msg && !msg.startsWith("WARNING")) {
          log.debug(`yt-dlp stderr: ${msg}`, null, "downloadVideo");
        }
      });

      child.on("close", async (code) => {
        if (code === 0) {
          try {
            const stats = await fs.stat(outputPath);
            const fileSizeMB = `${(stats.size / (1024 * 1024)).toFixed(1)}MB`;
            monitorService.completeDownload(dlId, "completed", fileSizeMB);
            monitorService.completeProcess(processId, "completed");
            log.success(`Download complete: ${filename} (${fileSizeMB})`, { outputPath, size: fileSizeMB }, "downloadVideo");
            resolve(outputPath);
          } catch (e) {
            monitorService.completeDownload(dlId, "failed");
            monitorService.completeProcess(processId, "failed");
            log.error("Downloaded file not found", { error: e.message, outputPath, errorType: "FileNotFound" }, "downloadVideo");
            reject(new Error("Downloaded file not found on disk."));
          }
        } else {
          monitorService.completeDownload(dlId, "failed");
          monitorService.completeProcess(processId, "failed");
          log.error(`yt-dlp exited with code ${code}`, { exitCode: code, url, errorType: "DownloadError" }, "downloadVideo");
          reject(new Error(`yt-dlp exited with code ${code}`));
        }
      });

      child.on("error", (err) => {
        monitorService.completeDownload(dlId, "failed");
        monitorService.completeProcess(processId, "failed");
        log.error("yt-dlp spawn error", { error: err.message, errorType: "SpawnError" }, "downloadVideo");
        reject(new Error(`Failed to spawn yt-dlp: ${err.message}`));
      });
    });
  },
};

export default downloadService;
