import { useEffect } from "react";
import useClipStore from "@/store/clipSlice";

/**
 * Hook to fetch and manage clips for a video.
 */
export default function useClips(videoId) {
  const store = useClipStore();

  useEffect(() => {
    if (videoId) {
      store.fetchClips(videoId);
    }
  }, [videoId]);

  return store;
}
