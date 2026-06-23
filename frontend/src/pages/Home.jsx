import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Film, Scissors, Zap, Activity, Upload, ArrowRight, Clock, CheckCircle2 } from "lucide-react";
import KPICard from "@/components/ui/KPICard";
import Button from "@/components/ui/Button";
import ClipCard from "@/components/clips/ClipCard";
import { SkeletonCard, SkeletonClipCard } from "@/components/ui/Skeleton";
import EmptyState from "@/components/ui/EmptyState";
import useVideoStore from "@/store/videoSlice";
import clipService from "@/services/clipService";

export default function Home() {
  const { videos, fetchVideos } = useVideoStore();
  const [recentClips, setRecentClips] = useState([]);
  const [isLoadingClips, setIsLoadingClips] = useState(true);

  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  useEffect(() => {
    const loadClips = async () => {
      try {
        const res = await clipService.listRecent(8);
        if (res.clips) setRecentClips(res.clips);
      } catch (e) {
        console.error("Failed to load clips", e);
      } finally {
        setIsLoadingClips(false);
      }
    };
    loadClips();
  }, []);

  const totalVideos = videos.length;
  const totalClips = recentClips.length;
  const avgScore = totalClips > 0
    ? Math.round(recentClips.reduce((sum, c) => sum + (c.viralScore || 0), 0) / totalClips)
    : 0;
  const processingCount = videos.filter((v) => v.status === "PROCESSING").length;
  const topClips = [...recentClips].sort((a, b) => b.viralScore - a.viralScore).slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
          <p className="text-sm text-text-muted mt-1">Here's what's happening with your clips today.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/clips">
            <Button variant="secondary" icon={Film}>All Clips</Button>
          </Link>
          <Link to="/upload">
            <Button variant="accent" icon={Upload}>Upload Video</Button>
          </Link>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard icon={Film} label="Total Videos" value={totalVideos} subtitle="Uploaded" />
        <KPICard icon={Scissors} label="Total Clips" value={totalClips} subtitle="Generated" />
        <KPICard icon={Zap} label="Avg Score" value={avgScore || "—"} subtitle="Viral potential" />
        <KPICard
          icon={Activity}
          label="Queue"
          value={processingCount}
          subtitle={processingCount > 0 ? "In progress" : "All done"}
        />
      </div>

      {/* Processing Banner */}
      {processingCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel-solid rounded-xl p-4 flex items-center gap-4 border-accent/30"
          style={{ borderColor: "rgba(59, 130, 246, 0.3)" }}
        >
          <div className="w-10 h-10 rounded-lg bg-accent-muted flex items-center justify-center shrink-0">
            <Activity size={18} className="text-accent animate-pulse" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-text-primary">
              {processingCount} video{processingCount > 1 ? "s" : ""} being processed
            </p>
            <p className="text-xs text-text-muted mt-0.5">AI is extracting viral clips. Check the Upload page for details.</p>
          </div>
          <Link to="/upload">
            <Button variant="secondary" size="sm" iconRight={ArrowRight}>View</Button>
          </Link>
        </motion.div>
      )}

      {/* Top Clips */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Zap size={18} className="text-yellow-500" /> Top Clips
          </h2>
          {recentClips.length > 0 && (
            <Link to="/clips" className="text-xs text-text-muted hover:text-text-primary transition-colors flex items-center gap-1">
              View all <ArrowRight size={12} />
            </Link>
          )}
        </div>

        {isLoadingClips ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5].map((i) => <SkeletonClipCard key={i} />)}
          </div>
        ) : topClips.length === 0 ? (
          <EmptyState
            icon={Film}
            title="No clips yet"
            description="Upload your first video to start generating viral clips."
            action={
              <Link to="/upload">
                <Button variant="accent" icon={Upload}>Upload Video</Button>
              </Link>
            }
          />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {topClips.map((clip) => (
              <ClipCard key={clip.id} clip={clip} />
            ))}
          </div>
        )}
      </section>

      {/* Recent Activity */}
      {videos.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
          <div className="glass-panel-solid rounded-xl divide-y divide-border">
            {videos.slice(0, 5).map((video) => (
              <div key={video.id} className="flex items-center gap-4 p-4">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  video.status === "COMPLETED" ? "bg-success-muted" :
                  video.status === "PROCESSING" ? "bg-accent-muted" :
                  video.status === "FAILED" ? "bg-danger-muted" :
                  "bg-white/[0.04]"
                }`}>
                  {video.status === "COMPLETED" ? (
                    <CheckCircle2 size={14} className="text-success" />
                  ) : video.status === "PROCESSING" ? (
                    <Activity size={14} className="text-accent animate-pulse" />
                  ) : (
                    <Film size={14} className="text-text-muted" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary truncate">{video.originalFilename}</p>
                  <p className="text-xs text-text-muted mt-0.5">
                    {video.status === "COMPLETED" ? "Processing complete" :
                     video.status === "PROCESSING" ? "Processing..." :
                     video.status === "FAILED" ? "Processing failed" :
                     "Queued"}
                  </p>
                </div>
                <span className={`badge ${
                  video.status === "COMPLETED" ? "bg-success-muted text-success" :
                  video.status === "PROCESSING" ? "bg-accent-muted text-accent" :
                  video.status === "FAILED" ? "bg-danger-muted text-danger" :
                  "bg-white/[0.06] text-text-muted"
                }`}>
                  {video.status}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
