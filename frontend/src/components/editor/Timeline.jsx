import { useRef, useMemo } from "react";
import { motion } from "framer-motion";
import { formatDuration } from "@/lib/utils";

/**
 * Timeline scrubber for the clip editor — shows waveform-like bars and playhead.
 */
export default function Timeline({ duration, currentTime, onSeek, markers = [] }) {
  const timelineRef = useRef(null);

  // Generate placeholder waveform bars
  const bars = useMemo(() => {
    const count = 120;
    return Array.from({ length: count }, () => 0.2 + Math.random() * 0.8);
  }, []);

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleClick = (e) => {
    const rect = timelineRef.current.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    onSeek?.(pct * duration);
  };

  return (
    <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-xl p-4">
      {/* Time display */}
      <div className="flex justify-between text-xs text-[var(--color-text-muted)] mb-3">
        <span>{formatDuration(currentTime)}</span>
        <span>{formatDuration(duration)}</span>
      </div>

      {/* Waveform + playhead */}
      <div
        ref={timelineRef}
        className="relative h-16 cursor-pointer group"
        onClick={handleClick}
      >
        {/* Waveform bars */}
        <div className="absolute inset-0 flex items-center gap-[2px]">
          {bars.map((h, i) => {
            const barPct = (i / bars.length) * 100;
            const isPlayed = barPct <= progress;
            return (
              <div
                key={i}
                className="flex-1 rounded-sm transition-colors duration-150"
                style={{
                  height: `${h * 100}%`,
                  backgroundColor: isPlayed ? "var(--color-primary)" : "var(--color-bg-elevated)",
                }}
              />
            );
          })}
        </div>

        {/* Playhead */}
        <motion.div
          className="absolute top-0 bottom-0 w-0.5 bg-[var(--color-accent)] z-10"
          style={{ left: `${progress}%` }}
        />

        {/* Viral moment markers */}
        {markers.map((marker, i) => {
          const pos = duration > 0 ? (marker.time / duration) * 100 : 0;
          return (
            <div
              key={i}
              className="absolute top-0 w-1 h-full bg-yellow-400/40 rounded-full"
              style={{ left: `${pos}%` }}
              title={`Viral moment: ${marker.label}`}
            />
          );
        })}
      </div>
    </div>
  );
}
