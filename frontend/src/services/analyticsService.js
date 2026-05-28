import api from "./api";

/**
 * Analytics service — dashboard stats, clip performance, trends.
 */
const analyticsService = {
  async getDashboardStats() {
    const { data } = await api.get("/analytics/dashboard");
    return data;
  },

  async getClipPerformance(clipId) {
    const { data } = await api.get(`/analytics/clips/${clipId}`);
    return data;
  },

  async getProcessingHistory(page = 1, limit = 20) {
    const { data } = await api.get("/analytics/history", { params: { page, limit } });
    return data;
  },

  async getViralScoreDistribution() {
    const { data } = await api.get("/analytics/scores");
    return data;
  },
};

export default analyticsService;
