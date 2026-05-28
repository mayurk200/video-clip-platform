import api from "./api";

/**
 * Clip service — list clips, edit, export, download.
 */
const clipService = {
  async listByVideo(videoId) {
    const { data } = await api.get(`/clips/video/${videoId}`);
    return data;
  },

  async getById(clipId) {
    const { data } = await api.get(`/clips/${clipId}`);
    return data;
  },

  async update(clipId, updates) {
    const { data } = await api.put(`/clips/${clipId}`, updates);
    return data;
  },

  async delete(clipId) {
    const { data } = await api.delete(`/clips/${clipId}`);
    return data;
  },

  async render(clipId, options = {}) {
    const { data } = await api.post(`/clips/${clipId}/render`, options);
    return data;
  },

  async export(clipId, platform) {
    const { data } = await api.post(`/clips/${clipId}/export`, { platform });
    return data;
  },

  async download(clipId) {
    const response = await api.get(`/clips/${clipId}/download`, {
      responseType: "blob",
    });
    return response.data;
  },

  async updateCaptions(clipId, captions) {
    const { data } = await api.put(`/clips/${clipId}/captions`, { captions });
    return data;
  },

  async updateThumbnail(clipId, thumbnailData) {
    const { data } = await api.put(`/clips/${clipId}/thumbnail`, thumbnailData);
    return data;
  },
};

export default clipService;
