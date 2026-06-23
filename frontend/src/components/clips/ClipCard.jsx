import { useState, useRef } from "react";
import { Zap, Play, Download, Trash2, MoreHorizontal, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { ScoreBadge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

export default function ClipCard({ clip, onDelete, className }) {
  const videoRef = useRef(null);
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseEnter = () => {
    setIsHovering(true);
    videoRef.current?.play().catch(() => {});
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  return (
    <Link
      to={`/clips/${clip.id}`}
      className={cn("clip-card group block relative rounded-xl overflow-hidden border border-border card-interactive bg-bg-card", className)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Video */}
      <div className="aspect-[9/16] relative overflow-hidden bg-black">
        <video
          ref={videoRef}
          src={`/api/clips/${clip.id}/download`}
          className={cn("clip-card-video w-full h-full object-cover", isHovering ? "opacity-100" : "opacity-70")}
          muted
          loop
          playsInline
          preload="metadata"
        />

        {/* Score Badge */}
        <div className="absolute top-3 right-3 z-10">
          <div className="flex items-center gap-1 bg-black/60 backdrop-blur-md px-2 py-1 rounded-md border border-white/10">
            <Zap size={11} className="text-yellow-400" fill="currentColor" />
            <span className="text-xs font-bold text-white">{clip.viralScore}</span>
          </div>
        </div>

        {/* Play overlay */}
        <div className={cn(
          "absolute inset-0 flex items-center justify-center transition-opacity",
          isHovering ? "opacity-0" : "opacity-100"
        )}>
          <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center">
            <Play size={16} className="text-white ml-0.5" fill="currentColor" />
          </div>
        </div>

        {/* Bottom gradient */}
        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/90 via-black/50 to-transparent">
          <p className="text-sm font-semibold text-white line-clamp-2 leading-tight">{clip.title || "Untitled Clip"}</p>
          <div className="flex items-center gap-2 mt-1.5">
            <span className="flex items-center gap-1 text-[10px] text-zinc-400">
              <Clock size={10} /> {Math.round(clip.duration)}s
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
