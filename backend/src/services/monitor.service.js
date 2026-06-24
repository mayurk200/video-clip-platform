import { EventEmitter } from "events";
import logger, { logEmitter, getLogBuffer, clearLogBuffer, getLogCount } from "../utils/logger.js";
import db from "../config/database.js";

const log = logger.module("MonitorService");

/**
 * Centralized monitoring service.
 * Provides: process tracking, download tracking, system stats, and event streaming.
 */
class MonitorService extends EventEmitter {
  constructor() {
    super();
    this.setMaxListeners(50);

    // ── Process Tracker ────────────────────────────────────
    this.processes = new Map(); // id -> { id, name, status, startTime, duration, progress, activity }

    // ── Download Tracker ───────────────────────────────────
    this.activeDownloads = new Map(); // id -> { id, videoId, title, url, status, progress, speed, eta, downloaded, total, thumbnail, startTime }

    // ── Error Tracker ──────────────────────────────────────
    this.recentErrors = []; // Last 100 errors
    this.errorCount = 0;

    // ── Stats ──────────────────────────────────────────────
    this.stats = {
      memoryUsage: 0,
      activeProcesses: 0,
      errorCount: 0,
      totalLogs: 0,
      activeDownloads: 0,
      uptime: 0,
    };

    // Listen to log events to capture errors
    logEmitter.on("log", (entry) => {
      if (entry.level === "error") {
        this.errorCount++;
        this.recentErrors.push({
          id: entry.id,
          type: entry.metadata?.errorType || "RuntimeError",
          message: entry.message,
          module: entry.module,
          process: entry.process,
          stack: entry.metadata?.stack || null,
          time: entry.timestamp,
          cause: entry.metadata?.cause || null,
        });
        // Keep only last 100 errors
        if (this.recentErrors.length > 100) {
          this.recentErrors.shift();
        }
      }

      // Forward log events to SSE clients
      this.emit("log", entry);
    });

    // Start stats collection interval
    this._statsInterval = setInterval(() => this._collectStats(), 2000);

    log.success("Monitor service initialized");
  }

  // ── Process Tracking ─────────────────────────────────────

  registerProcess(id, name, activity = "", killFn = null) {
    const proc = {
      id,
      name,
      status: "running",
      startTime: new Date().toISOString(),
      duration: null,
      progress: 0,
      activity,
      killFn,
    };
    this.processes.set(id, proc);
    this.emit("process:update", { ...proc, killFn: undefined });
    log.debug(`Process registered: ${name}`, { processId: id }, "registerProcess");
    return proc;
  }

  updateProcess(id, updates) {
    const proc = this.processes.get(id);
    if (!proc) return;
    Object.assign(proc, updates);
    if (proc.startTime && (proc.status === "running" || proc.status === "completed" || proc.status === "failed")) {
      proc.duration = Date.now() - new Date(proc.startTime).getTime();
    }
    this.emit("process:update", { ...proc, killFn: undefined });
  }

  completeProcess(id, status = "completed") {
    const proc = this.processes.get(id);
    if (!proc) return;
    proc.status = status;
    proc.progress = status === "completed" ? 100 : proc.progress;
    proc.duration = Date.now() - new Date(proc.startTime).getTime();
    this.emit("process:update", { ...proc, killFn: undefined });
    // Auto-remove after 60s
    setTimeout(() => this.processes.delete(id), 60000);
  }

  getProcesses() {
    return Array.from(this.processes.values()).map(p => ({ ...p, killFn: undefined }));
  }

  killAllProcesses() {
    log.warn("Killing all tracked processes");
    for (const [id, proc] of this.processes) {
      if (proc.status === "running" || proc.status === "waiting") {
        if (typeof proc.killFn === "function") {
          try {
            proc.killFn();
          } catch (e) {
            log.error(`Error killing process ${proc.name}`, { error: e.message });
          }
        }
        proc.status = "cancelled";
        proc.duration = Date.now() - new Date(proc.startTime).getTime();
        this.emit("process:update", { ...proc, killFn: undefined });
      }
    }
    this.processes.clear();
    log.success("All processes killed");
  }

  // ── Download Tracking ────────────────────────────────────

  registerDownload(id, videoId, title, url) {
    const dl = {
      id,
      videoId,
      title: title || "YouTube Video",
      url,
      status: "queued",
      progress: 0,
      speed: "",
      eta: "",
      downloaded: "",
      total: "",
      thumbnail: null,
      startTime: new Date().toISOString(),
      format: "MP4",
      resolution: "Best",
    };
    this.activeDownloads.set(id, dl);
    this.emit("download:update", dl);
    log.info(`Download registered: ${title}`, { url, videoId }, "registerDownload");
    return dl;
  }

  updateDownload(id, updates) {
    const dl = this.activeDownloads.get(id);
    if (!dl) return;
    Object.assign(dl, updates);
    this.emit("download:update", dl);
  }

  completeDownload(id, status = "completed", fileSize = null) {
    const dl = this.activeDownloads.get(id);
    if (!dl) return;
    dl.status = status;
    dl.progress = status === "completed" ? 100 : dl.progress;
    dl.completedAt = new Date().toISOString();
    dl.duration = Date.now() - new Date(dl.startTime).getTime();
    if (fileSize) dl.total = fileSize;
    this.emit("download:update", dl);

    // Save to download history in DB
    try {
      if (!db.downloadHistory) {
        db.data.downloadHistory = db.data.downloadHistory || [];
        db.downloadHistory = db.collection ? db.collection("downloadHistory") : {
          findAll: () => db.data.downloadHistory || [],
          insert: (item) => { db.data.downloadHistory.push(item); db.save(); },
          deleteOne: (q) => {
            const idx = db.data.downloadHistory.findIndex(h => h.id === q.id);
            if (idx >= 0) { db.data.downloadHistory.splice(idx, 1); db.save(); }
          }
        };
      }
      const historyEntry = { ...dl };
      delete historyEntry.speed;
      delete historyEntry.eta;
      db.downloadHistory.insert(historyEntry);
    } catch (e) {
      log.warn("Could not persist download history", { error: e.message });
    }

    // Remove from active after 10s
    setTimeout(() => this.activeDownloads.delete(id), 10000);
  }

  getActiveDownloads() {
    return Array.from(this.activeDownloads.values());
  }

  getDownloadHistory() {
    try {
      if (db.downloadHistory) {
        return db.downloadHistory.findAll ? db.downloadHistory.findAll() : (db.data.downloadHistory || []);
      }
      return db.data?.downloadHistory || [];
    } catch {
      return [];
    }
  }

  deleteDownloadHistory(id) {
    try {
      if (db.downloadHistory?.deleteOne) {
        db.downloadHistory.deleteOne({ id });
      } else if (db.data?.downloadHistory) {
        const idx = db.data.downloadHistory.findIndex(h => h.id === id);
        if (idx >= 0) { db.data.downloadHistory.splice(idx, 1); db.save(); }
      }
    } catch (e) {
      log.warn("Could not delete download history entry", { error: e.message });
    }
  }

  // ── Error Tracking ───────────────────────────────────────

  getRecentErrors() {
    return this.recentErrors;
  }

  // ── Stats ────────────────────────────────────────────────

  getStats() {
    return { ...this.stats };
  }

  _collectStats() {
    const mem = process.memoryUsage();
    this.stats = {
      memoryUsage: Math.round(mem.heapUsed / 1024 / 1024),
      memoryTotal: Math.round(mem.heapTotal / 1024 / 1024),
      activeProcesses: this.processes.size,
      errorCount: this.errorCount,
      totalLogs: getLogCount(),
      activeDownloads: this.activeDownloads.size,
      uptime: Math.round(process.uptime()),
    };
    this.emit("stats:update", this.stats);
  }

  // ── Log Access ───────────────────────────────────────────

  getLogs(filters = {}) {
    let logs = getLogBuffer();

    if (filters.level) {
      const levels = Array.isArray(filters.level) ? filters.level : [filters.level];
      logs = logs.filter((l) => levels.includes(l.level));
    }
    if (filters.module) {
      logs = logs.filter((l) => l.module === filters.module);
    }
    if (filters.search) {
      const search = filters.search.toLowerCase();
      logs = logs.filter(
        (l) =>
          l.message.toLowerCase().includes(search) ||
          l.module.toLowerCase().includes(search) ||
          (l.process && l.process.toLowerCase().includes(search))
      );
    }

    return logs;
  }

  clearLogs() {
    clearLogBuffer();
    this.errorCount = 0;
    this.recentErrors = [];
    log.info("Log buffer cleared");
  }

  // ── Cleanup ──────────────────────────────────────────────

  destroy() {
    if (this._statsInterval) {
      clearInterval(this._statsInterval);
    }
    this.removeAllListeners();
  }
}

// Singleton
const monitorService = new MonitorService();
export default monitorService;
