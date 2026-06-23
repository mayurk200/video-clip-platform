import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { BarChart3, Film, Scissors, Zap, Clock, HardDrive, TrendingUp } from "lucide-react";
import KPICard from "@/components/ui/KPICard";
import { SkeletonCard } from "@/components/ui/Skeleton";
import useVideoStore from "@/store/videoSlice";
import clipService from "@/services/clipService";
import { cn } from "@/lib/utils";

function ScoreDistribution({ clips }) {
  const ranges = [
    { label: "90-100", min: 90, max: 100, color: "bg-emerald-500" },
    { label: "75-89", min: 75, max: 89, color: "bg-green-500" },
    { label: "60-74", min: 60, max: 74, color: "bg-yellow-500" },
    { label: "40-59", min: 40, max: 59, color: "bg-orange-500" },
    { label: "0-39", min: 0, max: 39, color: "bg-red-500" },
  ];

  const maxCount = Math.max(...ranges.map((r) =>
    clips.filter((c) => c.viralScore >= r.min && c.viralScore <= r.max).length
  ), 1);

  return (
    <div className="glass-panel-solid rounded-xl p-6">
      <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
        <TrendingUp size={16} className="text-text-muted" /> Score Distribution
      </h3>
      <div className="space-y-3">
        {ranges.map((range) => {
          const count = clips.filter((c) => c.viralScore >= range.min && c.viralScore <= range.max).length;
          const pct = (count / maxCount) * 100;
          return (
            <div key={range.label} className="flex items-center gap-3">
              <span className="text-xs text-text-muted w-12 text-right font-mono">{range.label}</span>
              <div className="flex-1 h-5 bg-white/[0.04] rounded overflow-hidden">
                <div
                  className={cn("h-full rounded transition-all duration-700", range.color)}
                  style={{ width: `${pct}%`, opacity: 0.7 }}
                />
              </div>
              <span className="text-xs text-text-secondary w-6 text-right font-mono">{count}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TopPerformers({ clips }) {
  const top = [...clips].sort((a, b) => b.viralScore - a.viralScore).slice(0, 5);
  if (top.length === 0) return null;

  return (
    <div className="glass-panel-solid rounded-xl p-6">
      <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
        <Zap size={16} className="text-yellow-500" /> Top Performers
      </h3>
      <div className="space-y-3">
        {top.map((clip, idx) => (
          <div key={clip.id} className="flex items-center gap-3">
            <span className={cn(
              "w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold shrink-0",
              idx === 0 ? "bg-yellow-500/20 text-yellow-500" :
              idx === 1 ? "bg-zinc-400/20 text-zinc-400" :
              idx === 2 ? "bg-amber-600/20 text-amber-600" :
              "bg-white/[0.04] text-text-muted"
            )}>
              {idx + 1}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-text-primary truncate">{clip.title || "Untitled"}</p>
              <p className="text-xs text-text-faint">{Math.round(clip.duration)}s</p>
            </div>
            <div className="flex items-center gap-1 px-2 py-1 rounded bg-yellow-500/10 border border-yellow-500/20">
              <Zap size={10} className="text-yellow-500" fill="currentColor" />
              <span className="text-xs font-bold text-yellow-500">{clip.viralScore}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Analytics() {
  const { videos, fetchVideos } = useVideoStore();
  const [clips, setClips] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchVideos();
    const loadClips = async () => {
      try {
        const res = await clipService.listRecent(100);
        if (res.clips) setClips(res.clips);
      } catch (e) {
        console.error("Failed to load clips", e);
      } finally {
        setIsLoading(false);
      }
    };
    loadClips();
  }, [fetchVideos]);

  const totalClips = clips.length;
  const avgScore = totalClips > 0
    ? Math.round(clips.reduce((sum, c) => sum + (c.viralScore || 0), 0) / totalClips)
    : 0;
  const avgDuration = totalClips > 0
    ? Math.round(clips.reduce((sum, c) => sum + (c.duration || 0), 0) / totalClips)
    : 0;
  const highScoreClips = clips.filter((c) => c.viralScore >= 75).length;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => <SkeletonCard key={i} />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <BarChart3 size={22} className="text-accent" /> Analytics
        </h1>
        <p className="text-sm text-text-muted mt-1">Insights into your video processing and clip performance.</p>
      </motion.div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard icon={Film} label="Total Videos" value={videos.length} />
        <KPICard icon={Scissors} label="Total Clips" value={totalClips} />
        <KPICard icon={Zap} label="Avg Score" value={avgScore || "—"} />
        <KPICard icon={Clock} label="Avg Duration" value={`${avgDuration}s`} />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ScoreDistribution clips={clips} />
        <TopPerformers clips={clips} />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-panel-solid rounded-xl p-5">
          <p className="text-xs text-text-muted uppercase tracking-wider mb-2">High Score Clips</p>
          <p className="text-2xl font-bold text-success">{highScoreClips}</p>
          <p className="text-xs text-text-faint mt-1">Score ≥ 75</p>
        </div>
        <div className="glass-panel-solid rounded-xl p-5">
          <p className="text-xs text-text-muted uppercase tracking-wider mb-2">Clips Per Video</p>
          <p className="text-2xl font-bold text-text-primary">
            {videos.length > 0 ? (totalClips / videos.length).toFixed(1) : "—"}
          </p>
          <p className="text-xs text-text-faint mt-1">Average output</p>
        </div>
        <div className="glass-panel-solid rounded-xl p-5">
          <p className="text-xs text-text-muted uppercase tracking-wider mb-2">Score Range</p>
          <p className="text-2xl font-bold text-text-primary">
            {totalClips > 0
              ? `${Math.min(...clips.map((c) => c.viralScore))} — ${Math.max(...clips.map((c) => c.viralScore))}`
              : "—"
            }
          </p>
          <p className="text-xs text-text-faint mt-1">Min — Max</p>
        </div>
      </div>
    </div>
  );
}
