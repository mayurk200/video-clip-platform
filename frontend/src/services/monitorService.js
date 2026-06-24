import api from "./api";

/**
 * Monitor service — API client + SSE connection manager for real-time monitoring.
 */
const monitorApi = {
  async getLogs(filters = {}) {
    const params = {};
    if (filters.level?.length) params.level = filters.level.join(",");
    if (filters.module) params.module = filters.module;
    if (filters.search) params.search = filters.search;
    const { data } = await api.get("/monitor/logs", { params });
    return data;
  },

  async getProcesses() {
    const { data } = await api.get("/monitor/processes");
    return data;
  },

  async getDownloads() {
    const { data } = await api.get("/monitor/downloads");
    return data;
  },

  async getStats() {
    const { data } = await api.get("/monitor/stats");
    return data;
  },

  async getErrors() {
    const { data } = await api.get("/monitor/errors");
    return data;
  },

  async clearLogs() {
    const { data } = await api.post("/monitor/clear");
    return data;
  },

  async deleteDownload(id) {
    const { data } = await api.delete(`/monitor/downloads/${id}`);
    return data;
  },

  async killAllProcesses() {
    const { data } = await api.post("/monitor/kill-all");
    return data;
  },

  /**
   * Connect to SSE stream for real-time updates.
   * Returns an EventSource that emits typed messages.
   */
  connectSSE(onMessage, onError) {
    const baseUrl = api.defaults.baseURL || "/api";
    const url = `${baseUrl}/monitor/stream`;
    const source = new EventSource(url);

    source.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data);
        onMessage(parsed);
      } catch (e) {
        console.warn("Failed to parse SSE event:", e);
      }
    };

    source.onerror = (err) => {
      onError?.(err);
    };

    return source;
  },
};

export default monitorApi;
