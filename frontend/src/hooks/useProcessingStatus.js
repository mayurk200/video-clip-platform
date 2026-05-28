import { useEffect, useRef, useState } from "react";
import useVideoStore from "@/store/videoSlice";

/**
 * Hook that polls processing status for a video at a given interval.
 * Stops polling when status is "completed" or "failed".
 */
export default function useProcessingStatus(videoId, intervalMs = 3000) {
  const { pollStatus } = useVideoStore();
  const [status, setStatus] = useState(null);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!videoId) return;

    const poll = async () => {
      const result = await pollStatus(videoId);
      if (result) {
        setStatus(result);
        if (result.status === "completed" || result.status === "failed") {
          clearInterval(timerRef.current);
        }
      }
    };

    poll(); // immediate first check
    timerRef.current = setInterval(poll, intervalMs);

    return () => clearInterval(timerRef.current);
  }, [videoId, intervalMs]);

  return status;
}
