import monitorService from "../services/monitor.service.js";
import logger from "../utils/logger.js";
import { successResponse, errorResponse } from "../utils/responseHelper.js";

const log = logger.module("MonitorController");

/**
 * GET /api/monitor/logs — Return filtered log buffer
 */
export function getLogs(req, res) {
  const { level, module, search } = req.query;
  const filters = {};
  if (level) filters.level = level.split(",");
  if (module) filters.module = module;
  if (search) filters.search = search;

  const logs = monitorService.getLogs(filters);
  return successResponse(res, { logs, total: logs.length });
}

/**
 * GET /api/monitor/stream — SSE endpoint for real-time updates
 */
export function streamEvents(req, res) {
  // Set SSE headers
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
    "Access-Control-Allow-Origin": "*",
  });

  // Send initial data burst
  const initialData = {
    type: "init",
    logs: monitorService.getLogs().slice(-200), // Last 200 logs
    processes: monitorService.getProcesses(),
    downloads: monitorService.getActiveDownloads(),
    stats: monitorService.getStats(),
    errors: monitorService.getRecentErrors().slice(-20),
  };
  res.write(`data: ${JSON.stringify(initialData)}\n\n`);

  // Event handlers
  const onLog = (entry) => {
    res.write(`data: ${JSON.stringify({ type: "log", data: entry })}\n\n`);
  };
  const onProcess = (proc) => {
    res.write(`data: ${JSON.stringify({ type: "process", data: proc })}\n\n`);
  };
  const onDownload = (dl) => {
    res.write(`data: ${JSON.stringify({ type: "download", data: dl })}\n\n`);
  };
  const onStats = (stats) => {
    res.write(`data: ${JSON.stringify({ type: "stats", data: stats })}\n\n`);
  };

  monitorService.on("log", onLog);
  monitorService.on("process:update", onProcess);
  monitorService.on("download:update", onDownload);
  monitorService.on("stats:update", onStats);

  // Heartbeat every 15s to keep connection alive
  const heartbeat = setInterval(() => {
    res.write(`: heartbeat\n\n`);
  }, 15000);

  // Cleanup on client disconnect
  req.on("close", () => {
    clearInterval(heartbeat);
    monitorService.off("log", onLog);
    monitorService.off("process:update", onProcess);
    monitorService.off("download:update", onDownload);
    monitorService.off("stats:update", onStats);
    log.debug("SSE client disconnected");
  });
}

/**
 * GET /api/monitor/processes — Current process states
 */
export function getProcesses(req, res) {
  return successResponse(res, { processes: monitorService.getProcesses() });
}

/**
 * GET /api/monitor/downloads — Active + history
 */
export function getDownloads(req, res) {
  return successResponse(res, {
    active: monitorService.getActiveDownloads(),
    history: monitorService.getDownloadHistory(),
  });
}

/**
 * GET /api/monitor/stats — System stats snapshot
 */
export function getStats(req, res) {
  return successResponse(res, { stats: monitorService.getStats() });
}

/**
 * GET /api/monitor/errors — Recent errors
 */
export function getErrors(req, res) {
  return successResponse(res, { errors: monitorService.getRecentErrors() });
}

/**
 * POST /api/monitor/clear — Clear log buffer
 */
export function clearLogs(req, res) {
  monitorService.clearLogs();
  return successResponse(res, {}, "Logs cleared");
}

/**
 * DELETE /api/monitor/downloads/:id — Delete from history
 */
export function deleteDownloadHistory(req, res) {
  monitorService.deleteDownloadHistory(req.params.id);
  return successResponse(res, {}, "Download history entry deleted");
}

/**
 * POST /api/monitor/kill-all — Kill all tracked processes
 */
export function killAllProcesses(req, res) {
  monitorService.killAllProcesses();
  return successResponse(res, {}, "All processes killed");
}

