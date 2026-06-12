import api from "./api";

/**
 * Video service — upload, list, get details, delete.
 */
const videoService = {
  /** Upload video with progress callback */
  async upload(file, onProgress, desiredClipCount) {
    const formData = new FormData();
    formData.append("video", file);
    if (desiredClipCount) formData.append("desiredClipCount", desiredClipCount);

    const { data } = await api.post("/videos/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      timeout: 0, // no timeout for large uploads
      onUploadProgress: (event) => {
        const pct = Math.round((event.loaded / event.total) * 100);
        onProgress?.(pct);
      },
    });
    return data;
  },

  async uploadLocal(localPath, desiredClipCount) {
    const { data } = await api.post("/videos/upload-local", { localPath, desiredClipCount });
    return data;
  },

  async list(page = 1, limit = 20) {
    const { data } = await api.get("/videos", { params: { page, limit } });
    return data;
  },

  async getById(videoId) {
    const { data } = await api.get(`/videos/${videoId}`);
    return data;
  },

  async delete(videoId) {
    const { data } = await api.delete(`/videos/${videoId}`);
    return data;
  },

  async getProcessingStatus(videoId) {
    const { data } = await api.get(`/videos/${videoId}/status`);
    return data;
  },

  async retryProcessing(videoId) {
    const { data } = await api.post(`/videos/${videoId}/retry`);
    return data;
  },

  async deleteAll() {
    const { data } = await api.delete("/videos");
    return data;
  },
};

export default videoService;
