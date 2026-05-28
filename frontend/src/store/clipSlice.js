import { create } from "zustand";
import clipService from "@/services/clipService";

/**
 * Clip store — generated clips list, active clip for editor, render state.
 */
const useClipStore = create((set, get) => ({
  clips: [],
  activeClip: null,
  isLoading: false,
  isRendering: false,

  /** Fetch all clips for a video */
  fetchClips: async (videoId) => {
    set({ isLoading: true });
    try {
      const { clips } = await clipService.listByVideo(videoId);
      set({ clips, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  /** Set the active clip in the editor */
  setActiveClip: (clip) => set({ activeClip: clip }),

  /** Update clip metadata */
  updateClip: async (clipId, updates) => {
    const { clip } = await clipService.update(clipId, updates);
    set((state) => ({
      clips: state.clips.map((c) => (c.id === clipId ? clip : c)),
      activeClip: state.activeClip?.id === clipId ? clip : state.activeClip,
    }));
    return clip;
  },

  /** Render a clip with captions + reframing */
  renderClip: async (clipId, options) => {
    set({ isRendering: true });
    try {
      const result = await clipService.render(clipId, options);
      set({ isRendering: false });
      return result;
    } catch (err) {
      set({ isRendering: false });
      throw err;
    }
  },

  /** Export for a specific platform */
  exportClip: async (clipId, platform) => {
    return clipService.export(clipId, platform);
  },

  /** Delete a clip */
  deleteClip: async (clipId) => {
    await clipService.delete(clipId);
    set((state) => ({
      clips: state.clips.filter((c) => c.id !== clipId),
      activeClip: state.activeClip?.id === clipId ? null : state.activeClip,
    }));
  },
}));

export default useClipStore;
