import { create } from "zustand";
import monitorApi from "@/services/monitorService";

const MAX_LOG_BUFFER = 10000;

const useMonitorStore = create((set, get) => ({
  // ── State ────────────────────────────────────────────
  logs: [],
  processes: [],
  downloads: [],
  downloadHistory: [],
  errors: [],
  stats: { memoryUsage: 0, activeProcesses: 0, errorCount: 0, totalLogs: 0, activeDownloads: 0, uptime: 0 },

  monitoringEnabled: localStorage.getItem("cf_monitoring") !== "false",
  debugMode: localStorage.getItem("cf_debug") === "true",
  paused: false,
  sseSource: null,
  sseConnected: false,

  // Filters
  logFilters: {
    levels: ["info", "success", "warn", "error"],
    module: "",
    search: "",
  },

  // ── Toggles ──────────────────────────────────────────
  toggleMonitoring: () => {
    const next = !get().monitoringEnabled;
    localStorage.setItem("cf_monitoring", next);
    set({ monitoringEnabled: next });
    if (next) {
      get().connectSSE();
    } else {
      get().disconnectSSE();
    }
  },

  toggleDebug: () => {
    const next = !get().debugMode;
    localStorage.setItem("cf_debug", next);
    set({ debugMode: next });
  },

  togglePause: () => set((s) => ({ paused: !s.paused })),

  setLogFilter: (key, value) =>
    set((s) => ({ logFilters: { ...s.logFilters, [key]: value } })),

  toggleLevelFilter: (level) =>
    set((s) => {
      const levels = s.logFilters.levels.includes(level)
        ? s.logFilters.levels.filter((l) => l !== level)
        : [...s.logFilters.levels, level];
      return { logFilters: { ...s.logFilters, levels } };
    }),

  // ── SSE Connection ───────────────────────────────────
  connectSSE: () => {
    const existing = get().sseSource;
    if (existing) existing.close();

    const source = monitorApi.connectSSE(
      (msg) => {
        const state = get();
        if (state.paused && msg.type === "log") return;

        switch (msg.type) {
          case "init":
            set({
              logs: msg.logs || [],
              processes: msg.processes || [],
              downloads: msg.downloads || [],
              errors: msg.errors || [],
              sseConnected: true,
            });
            break;

          case "log": {
            // Skip debug logs unless debug mode is on
            if (msg.data.level === "debug" && !state.debugMode) return;
            set((s) => {
              const newLogs = [...s.logs, msg.data];
              if (newLogs.length > MAX_LOG_BUFFER) newLogs.splice(0, newLogs.length - MAX_LOG_BUFFER);
              const newErrors = msg.data.level === "error"
                ? [...s.errors, msg.data].slice(-100)
                : s.errors;
              return { logs: newLogs, errors: newErrors };
            });
            break;
          }

          case "process":
            set((s) => {
              const idx = s.processes.findIndex((p) => p.id === msg.data.id);
              const procs = [...s.processes];
              if (idx >= 0) procs[idx] = msg.data;
              else procs.push(msg.data);
              return { processes: procs };
            });
            break;

          case "download":
            set((s) => {
              const idx = s.downloads.findIndex((d) => d.id === msg.data.id);
              const dls = [...s.downloads];
              if (idx >= 0) dls[idx] = msg.data;
              else dls.push(msg.data);
              // Move completed/failed to history
              if (msg.data.status === "completed" || msg.data.status === "failed") {
                return {
                  downloads: dls.filter((d) => d.status !== "completed" && d.status !== "failed"),
                  downloadHistory: [...s.downloadHistory, msg.data].slice(-100),
                };
              }
              return { downloads: dls };
            });
            break;

          case "stats":
            set({ stats: msg.data });
            break;
        }
      },
      () => {
        set({ sseConnected: false });
        // Auto-reconnect after 3s
        setTimeout(() => {
          if (get().monitoringEnabled) get().connectSSE();
        }, 3000);
      }
    );

    set({ sseSource: source, sseConnected: true });
  },

  disconnectSSE: () => {
    const source = get().sseSource;
    if (source) source.close();
    set({ sseSource: null, sseConnected: false });
  },

  // ── Actions ──────────────────────────────────────────
  clearLogs: async () => {
    await monitorApi.clearLogs();
    set({ logs: [], errors: [] });
  },

  deleteDownload: async (id) => {
    await monitorApi.deleteDownload(id);
    set((s) => ({
      downloadHistory: s.downloadHistory.filter((d) => d.id !== id),
    }));
  },

  exportLogs: () => {
    const logs = get().logs;
    const blob = new Blob([JSON.stringify(logs, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `clipforge-logs-${new Date().toISOString().slice(0, 19)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  },

  killAllProcesses: async () => {
    try {
      await monitorApi.killAllProcesses();
    } catch { /* backend may not respond if processes are killed */ }
    set({ processes: [] });
  },

  // ── Computed: Filtered Logs ──────────────────────────
  getFilteredLogs: () => {
    const { logs, logFilters, debugMode } = get();
    return logs.filter((log) => {
      if (!logFilters.levels.includes(log.level)) return false;
      if (!debugMode && log.level === "debug") return false;
      if (logFilters.module && log.module !== logFilters.module) return false;
      if (logFilters.search) {
        const s = logFilters.search.toLowerCase();
        return (
          log.message.toLowerCase().includes(s) ||
          log.module.toLowerCase().includes(s) ||
          (log.process && log.process.toLowerCase().includes(s))
        );
      }
      return true;
    });
  },

  // ── Get unique modules from logs ─────────────────────
  getModules: () => {
    const modules = new Set(get().logs.map((l) => l.module));
    return Array.from(modules).sort();
  },
}));

export default useMonitorStore;
