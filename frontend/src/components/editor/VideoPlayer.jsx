import { Play, Pause, Volume2, VolumeX, Maximize } from "lucide-react";
import useVideoPlayer from "@/hooks/useVideoPlayer";
import { formatDuration } from "@/lib/utils";

/**
 * Video player controls — play/pause, volume, seek, fullscreen.
 */
export default function VideoPlayer({ src, className = "" }) {
  const {
    videoRef, isPlaying, currentTime, duration, volume,
    toggle, seekTo, changeVolume,
  } = useVideoPlayer();

  return (
    <div className={`relative bg-black rounded-xl overflow-hidden group ${className}`}>
      <video
        ref={videoRef}
        src={src}
        className="w-full h-full object-contain"
        playsInline
        onClick={toggle}
      />

      {/* Controls overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
        {/* Progress bar */}
        <div
          className="h-1 bg-white/20 rounded-full mb-3 cursor-pointer"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const pct = (e.clientX - rect.left) / rect.width;
            seekTo(pct * duration);
          }}
        >
          <div
            className="h-full bg-[var(--color-primary)] rounded-full transition-all"
            style={{ width: `${(currentTime / duration) * 100 || 0}%` }}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={toggle} className="text-white hover:text-[var(--color-primary)] transition-colors">
              {isPlaying ? <Pause size={18} /> : <Play size={18} />}
            </button>
            <span className="text-xs text-white/70">
              {formatDuration(currentTime)} / {formatDuration(duration)}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => changeVolume(volume === 0 ? 1 : 0)}
              className="text-white hover:text-[var(--color-primary)] transition-colors"
            >
              {volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>
            <button
              onClick={() => videoRef.current?.requestFullscreen?.()}
              className="text-white hover:text-[var(--color-primary)] transition-colors"
            >
              <Maximize size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
