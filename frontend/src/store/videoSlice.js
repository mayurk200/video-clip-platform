import { create } from "zustand";
import videoService from "@/services/videoService";

/**
 * Video store — upload state, video list, processing status.
 */
const useVideoStore = create((set, get) => ({
  videos: [],
  currentVideo: null,
  uploadProgress: 0,
  isUploading: false,
  isLoading: false,
  processingStatuses: {}, // { [videoId]: statusObject }

  /** Fetch all user videos */
  fetchVideos: async (page = 1) => {
    set({ isLoading: true });
    try {
      const { videos, total } = await videoService.list(page);
      set({ videos, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  /** Fetch single video details */
  fetchVideo: async (videoId) => {
    set({ isLoading: true });
    try {
      const { video } = await videoService.getById(videoId);
      set({ currentVideo: video, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  /** Upload a new video */
  uploadVideo: async (file) => {
    set({ isUploading: true, uploadProgress: 0 });
    try {
      const result = await videoService.upload(file, (pct) => {
        set({ uploadProgress: pct });
      });
      set({ isUploading: false, uploadProgress: 100 });
      // Refresh video list
      get().fetchVideos();
      return result;
    } catch (err) {
      set({ isUploading: false, uploadProgress: 0 });
      throw err;
    }
  },

  /** Copy a local video */
  uploadLocalVideo: async (localPath) => {
    set({ isUploading: true, uploadProgress: 50 });
    try {
      const result = await videoService.uploadLocal(localPath);
      set({ isUploading: false, uploadProgress: 100 });
      get().fetchVideos();
      return result;
    } catch (err) {
      set({ isUploading: false, uploadProgress: 0 });
      throw err;
    }
  },

  /** Poll processing status for a video */
  pollStatus: async (videoId) => {
    try {
      const status = await videoService.getProcessingStatus(videoId);
      set((state) => ({
        processingStatuses: { ...state.processingStatuses, [videoId]: status },
      }));
      return status;
    } catch {
      return null;
    }
  },

  /** Retry a failed video */
  retryVideo: async (videoId) => {
    try {
      await videoService.retryProcessing(videoId);
      get().fetchVideos();
    } catch (err) {
      throw err;
    }
  },

  /** Delete a video */
  deleteVideo: async (videoId) => {
    await videoService.delete(videoId);
    set((state) => ({
      videos: state.videos.filter((v) => v.id !== videoId),
    }));
  },

  /** Delete all videos */
  deleteAllVideos: async () => {
    await videoService.deleteAll();
    set({ videos: [], currentVideo: null, processingStatuses: {} });
  },

  clearCurrentVideo: () => set({ currentVideo: null }),
}));

export default useVideoStore;
