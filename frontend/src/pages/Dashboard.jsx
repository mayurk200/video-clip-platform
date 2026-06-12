import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Film, Video, Zap } from "lucide-react";
import useVideoStore from "@/store/videoSlice";
import DropzoneUploader from "@/components/upload/DropzoneUploader";
import VideoInfoCard from "@/components/videos/VideoInfoCard";
import VideoDetailView from "@/components/videos/VideoDetailView";
import toast from "react-hot-toast";

/**
 * Minimalist stat pill.
 */
function StatPill({ icon: Icon, value, colorClass = "text-zinc-400" }) {
  return (
    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/[0.03] border border-white/[0.05]">
      <Icon size={12} className={colorClass} />
      <span className={`text-[11px] font-medium font-mono ${colorClass}`}>{value}</span>
    </div>
  );
}

export default function Dashboard() {
  const { videos, fetchVideos, deleteVideo, retryVideo, deleteAllVideos } = useVideoStore();
  const [selectedVideoId, setSelectedVideoId] = useState(null);

  useEffect(() => {
    fetchVideos();
    const interval = setInterval(() => fetchVideos(), 5000);
    return () => clearInterval(interval);
  }, [fetchVideos]);

  useEffect(() => {
    if (videos.length > 0 && !selectedVideoId) setSelectedVideoId(videos[0].id);
    else if (videos.length === 0) setSelectedVideoId(null);
  }, [videos, selectedVideoId]);

  const handleDelete = useCallback(async (id) => {
    if (!confirm("Delete video and clips?")) return;
    try {
      await deleteVideo(id);
      if (selectedVideoId === id) setSelectedVideoId(null);
      toast.success("Video deleted");
    } catch { toast.error("Failed to delete"); }
  }, [deleteVideo, selectedVideoId]);

  const handleRetry = useCallback(async (id) => {
    try {
      await retryVideo(id);
      toast.success("Processing restarted");
    } catch (err) { toast.error("Retry failed"); }
  }, [retryVideo]);

  const handleDeleteAll = useCallback(async () => {
    if (!confirm("Delete all videos?")) return;
    try {
      await deleteAllVideos();
      toast.success("All cleared");
    } catch { toast.error("Failed to clear"); }
  }, [deleteAllVideos]);

  const completedCount = videos.filter((v) => v.status === "COMPLETED").length;
  const failedCount = videos.filter((v) => v.status === "FAILED").length;

  return (
    <div className="pb-32 max-w-[960px] mx-auto px-4 sm:px-6">
      
      {/* ── Ultra-Premium Header ── */}
      <header className="pt-20 pb-12 text-center flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, filter: "blur(10px)", y: -20 }}
          animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Subtle badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-8 rounded-full bg-white/[0.03] border border-white/[0.08] backdrop-blur-md">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]"></span>
            <span className="text-[11px] font-medium tracking-wide text-zinc-300 uppercase">ClipForge Engine v2.0</span>
          </div>

          <h1 className="text-5xl sm:text-6xl font-semibold tracking-[-0.04em] gradient-text pb-2">
            Video to Viral.
          </h1>
          
          <p className="text-zinc-400 max-w-[480px] mx-auto mt-4 text-[15px] leading-relaxed font-light">
            Drop long-form content. Our AI extracts high-retention moments, reframes, and creates production-ready shorts instantly.
          </p>
        </motion.div>
      </header>

      {/* ── Main Uploader ── */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
      >
        <DropzoneUploader />
      </motion.section>

      {/* ── Library ── */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.3 }}
        className="mt-16"
      >
        {/* Header row */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/[0.06]">
          <div className="flex items-center gap-4">
            <h2 className="text-sm font-medium text-zinc-200">Processing Pipeline</h2>
            {videos.length > 0 && (
              <div className="hidden sm:flex items-center gap-2">
                <StatPill icon={Video} value={videos.length} />
                {completedCount > 0 && <StatPill icon={Zap} value={completedCount} colorClass="text-emerald-400" />}
                {failedCount > 0 && <StatPill icon={Film} value={failedCount} colorClass="text-red-400" />}
              </div>
            )}
          </div>
          {videos.length > 0 && (
            <button
              onClick={handleDeleteAll}
              className="text-[11px] uppercase tracking-wider font-medium text-zinc-500 hover:text-red-400 transition-colors"
            >
              Clear
            </button>
          )}
        </div>

        {/* Empty State */}
        {videos.length === 0 ? (
          <div className="glass-panel inner-border rounded-xl p-12 text-center flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-white/[0.03] border border-white/[0.05] flex items-center justify-center mb-4">
              <Film size={20} className="text-zinc-500" />
            </div>
            <p className="text-sm text-zinc-300 font-medium">Pipeline is empty</p>
            <p className="text-xs text-zinc-500 mt-1">Upload a video to begin processing</p>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {videos.map((video) => {
                const isSelected = selectedVideoId === video.id;
                return (
                  <motion.div
                    key={video.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, height: 0, overflow: "hidden" }}
                    transition={{ duration: 0.3 }}
                  >
                    <VideoInfoCard
                      video={video}
                      statusData={useVideoStore.getState().processingStatuses[video.id]}
                      isSelected={isSelected}
                      onSelect={() => setSelectedVideoId(isSelected ? null : video.id)}
                      onDelete={handleDelete}
                      onRetry={handleRetry}
                    />
                    <AnimatePresence>
                      {isSelected && <VideoDetailView video={video} onRetry={handleRetry} />}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </motion.section>
    </div>
  );
}
