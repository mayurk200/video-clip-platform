import { useRef, useState, useCallback, useEffect } from "react";

/**
 * Hook for controlling the HTML5 video player in the clip editor.
 */
export default function useVideoPlayer() {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);

  const play = useCallback(() => {
    videoRef.current?.play();
    setIsPlaying(true);
  }, []);

  const pause = useCallback(() => {
    videoRef.current?.pause();
    setIsPlaying(false);
  }, []);

  const toggle = useCallback(() => {
    isPlaying ? pause() : play();
  }, [isPlaying, play, pause]);

  const seekTo = useCallback((time) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  }, []);

  const changeVolume = useCallback((vol) => {
    if (videoRef.current) {
      videoRef.current.volume = vol;
      setVolume(vol);
    }
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onTimeUpdate = () => setCurrentTime(video.currentTime);
    const onLoadedMeta = () => setDuration(video.duration);
    const onEnded = () => setIsPlaying(false);

    video.addEventListener("timeupdate", onTimeUpdate);
    video.addEventListener("loadedmetadata", onLoadedMeta);
    video.addEventListener("ended", onEnded);

    return () => {
      video.removeEventListener("timeupdate", onTimeUpdate);
      video.removeEventListener("loadedmetadata", onLoadedMeta);
      video.removeEventListener("ended", onEnded);
    };
  }, []);

  return {
    videoRef,
    isPlaying,
    currentTime,
    duration,
    volume,
    play,
    pause,
    toggle,
    seekTo,
    changeVolume,
  };
}
