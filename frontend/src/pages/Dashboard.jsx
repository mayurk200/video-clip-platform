import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileVideo, HardDrive, Clock, AlertCircle, CheckCircle2, Film, RefreshCw, Trash2, ChevronRight } from "lucide-react";
import useVideoStore from "@/store/videoSlice";
import DropzoneUploader from "@/components/upload/DropzoneUploader";
import ProcessingTimeline from "@/components/analytics/ProcessingTimeline";
import useClips from "@/hooks/useClips";
import ClipGrid from "@/components/clips/ClipGrid";
import { formatFileSize, formatDuration } from "@/lib/utils";
import toast from "react-hot-toast";

function VideoInfoCard({ video, statusData, onSelect, isSelected, onDelete, onRetry }) {
  const fileSize = statusData?.videoInfo?.fileSize || (video.fileSize ? Number(video.fileSize) : null);
  const duration = statusData?.videoInfo?.duration || video.duration;
  const originalName = statusData?.videoInfo?.originalName || video.originalName || video.filename;
  const isFailed = video.status?.toUpperCase() === "FAILED";
  const isCompleted = video.status?.toUpperCase() === "COMPLETED";
  const isProcessing = !isFailed && !isCompleted && video.status?.toUpperCase() !== "QUEUED";

  return (
    <div 
      className={`bg-[var(--color-bg-card)] border rounded-xl p-5 transition-all cursor-pointer hover:border-[var(--color-border-hover)] ${isSelected ? 'border-[var(--color-primary)] shadow-glow' : 'border-[var(--color-border)]'}`}
      onClick={() => onSelect(video)}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[var(--color-primary-light)] flex items-center justify-center">
            <FileVideo size={20} className="text-[var(--color-primary)]" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[var(--color-text-primary)] truncate max-w-[200px] sm:max-w-md" title={originalName}>
              {originalName}
            </h2>
            <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
              {new Date(video.createdAt).toLocaleString()}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Status Badge */}
          <span className={`px-3 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase flex items-center gap-1.5
            ${isProcessing ? "bg-[var(--color-primary-light)] text-[var(--color-primary)]" :
              isFailed ? "bg-red-500/15 text-red-400" :
              video.status === 'QUEUED' ? "bg-white/10 text-gray-300" :
              "bg-[var(--color-success)]/15 text-[var(--color-success)]"}
          `}>
            {isProcessing && <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />}
            {isCompleted && <CheckCircle2 size={12} />}
            {isFailed && <AlertCircle size={12} />}
            {video.status}
          </span>
          
          {/* Actions */}
          {isFailed && (
            <button 
              onClick={(e) => { e.stopPropagation(); onRetry(video.id); }}
              className="p-1.5 rounded-lg bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)] hover:text-white hover:bg-[var(--color-primary)] transition-colors"
              title="Retry Processing"
            >
              <RefreshCw size={16} />
            </button>
          )}
          
          <button 
            onClick={(e) => { e.stopPropagation(); onDelete(video.id); }}
            className="p-1.5 rounded-lg bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)] hover:text-red-400 hover:bg-red-500/20 transition-colors"
            title="Delete Video"
          >
            <Trash2 size={16} />
          </button>
          
          <ChevronRight size={18} className={`text-[var(--color-text-muted)] transition-transform ${isSelected ? 'rotate-90' : ''}`} />
        </div>
      </div>

      {/* Video metadata row */}
      <div className="flex items-center gap-6 text-sm">
        {fileSize && (
          <div className="flex items-center gap-1.5 text-[var(--color-text-secondary)]">
            <HardDrive size={14} className="text-[var(--color-text-muted)]" />
            <span>{formatFileSize(fileSize)}</span>
          </div>
        )}
        {duration && (
          <div className="flex items-center gap-1.5 text-[var(--color-text-secondary)]">
            <Clock size={14} className="text-[var(--color-text-muted)]" />
            <span>{formatDuration(duration)}</span>
          </div>
        )}
        {video._count?.clips > 0 && (
          <div className="flex items-center gap-1.5 text-[var(--color-text-secondary)]">
            <Film size={14} className="text-[var(--color-text-muted)]" />
            <span>{video._count.clips} clips</span>
          </div>
        )}
      </div>

      {/* Error message row */}
      {isFailed && (statusData?.errorMessage || video.errorMessage) && (
        <div className="mt-3 text-xs text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-lg flex items-start gap-2">
          <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
          <span className="font-mono break-all">{statusData?.errorMessage || video.errorMessage}</span>
        </div>
      )}
    </div>
  );
}

function VideoDetailView({ video, onRetry }) {
  const { pollStatus, processingStatuses } = useVideoStore();
  const { clips } = useClips(video.id);

  const isProcessing = ["QUEUED", "PROCESSING", "TRANSCRIBING", "ANALYZING", "CLIPPING", "RENDERING"].includes(video.status?.toUpperCase());
  const isFailed = video.status?.toUpperCase() === "FAILED";

  useEffect(() => {
    if (!isProcessing && !isFailed) return;
    pollStatus(video.id);
    if (!isProcessing) return;
    const interval = setInterval(() => {
      pollStatus(video.id);
    }, 2000);
    return () => clearInterval(interval);
  }, [video.id, isProcessing, isFailed, pollStatus]);

  const statusData = processingStatuses[video.id];

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="space-y-6 mt-4 pl-4 md:pl-12 border-l-2 border-[var(--color-border)]"
    >
      {/* Processing Timeline — show when processing OR failed */}
      {(isProcessing || isFailed) && (
        <div className="max-w-4xl">
          <ProcessingTimeline
            status={statusData?.steps || {}}
            videoStatus={video.status}
            errorMessage={statusData?.errorMessage || video.errorMessage}
            onRetry={() => onRetry(video.id)}
            canRetry={isFailed}
          />
        </div>
      )}

      {/* Generated Clips */}
      {clips && clips.length > 0 && !isProcessing && (
        <div className="pt-2">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-[var(--color-text-primary)] flex items-center gap-2">
              <Film size={18} className="text-[var(--color-primary)]" />
              Generated Clips
            </h3>
            <span className="text-sm font-medium px-2.5 py-1 rounded-full bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)]">
              {clips.length} viral clips
            </span>
          </div>
          <ClipGrid
            clips={clips}
            onSelect={(clip) => window.open(clip.videoUrl || clip.filePath, "_blank")}
            onDownload={(clip) => {
              if (clip.videoUrl) {
                const a = document.createElement("a");
                a.href = clip.videoUrl;
                a.download = `${video.originalName}-clip.mp4`;
                a.click();
              } else {
                toast.error("Download URL not available");
              }
            }}
          />
        </div>
      )}
    </motion.div>
  );
}

/**
 * Unified Single Page App
 */
export default function Dashboard() {
  const { videos, fetchVideos, deleteVideo, retryVideo, deleteAllVideos } = useVideoStore();
  const [selectedVideoId, setSelectedVideoId] = useState(null);

  useEffect(() => {
    fetchVideos();
    // Poll the overall video list periodically to catch new uploads completing
    const interval = setInterval(() => fetchVideos(), 5000);
    return () => clearInterval(interval);
  }, [fetchVideos]);

  // Select newest video automatically if none selected
  useEffect(() => {
    if (videos.length > 0 && !selectedVideoId) {
      setSelectedVideoId(videos[0].id);
    } else if (videos.length === 0) {
      setSelectedVideoId(null);
    }
  }, [videos, selectedVideoId]);

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this video and all its clips?")) {
      try {
        await deleteVideo(id);
        if (selectedVideoId === id) setSelectedVideoId(null);
        toast.success("Video deleted");
      } catch (err) {
        toast.error("Failed to delete video");
      }
    }
  };
  
  const handleRetry = async (id) => {
    try {
      await retryVideo(id);
      toast.success("Video processing restarted!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to retry video");
    }
  };

  const handleDeleteAll = async () => {
    if (confirm("Are you sure you want to delete ALL videos? This cannot be undone.")) {
      try {
        await deleteAllVideos();
        toast.success("All videos deleted");
      } catch (err) {
        toast.error("Failed to delete videos");
      }
    }
  };

  const completedCount = videos.filter(v => v.status === 'COMPLETED').length;
  const failedCount = videos.filter(v => v.status === 'FAILED').length;

  return (
    <div className="space-y-12 pb-24 max-w-5xl mx-auto">
      {/* Header */}
      <div className="text-center pt-8">
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-primary)] to-[#FF2E93] mb-4 drop-shadow-sm">
          Viral Clip AI
        </h1>
        <p className="text-[var(--color-text-secondary)] max-w-2xl mx-auto text-lg">
          Drop a long video below. Our AI will analyze, reframe, and generate viral vertical clips instantly in a single shot.
        </p>
      </div>

      {/* Uploader (Always visible at top) */}
      <div className="w-full">
        <DropzoneUploader />
      </div>

      {/* Video List Section */}
      <div className="space-y-6 pt-4">
        <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-4">
          <h2 className="text-xl font-bold text-[var(--color-text-primary)]">Your Videos</h2>
          
          <div className="flex items-center gap-4 text-sm">
            <div className="hidden sm:flex items-center gap-3 mr-2">
              <span className="text-[var(--color-text-secondary)]">Total: <span className="font-semibold text-white">{videos.length}</span></span>
              {completedCount > 0 && <span className="text-[var(--color-success)] font-medium">{completedCount} done</span>}
              {failedCount > 0 && <span className="text-red-400 font-medium">{failedCount} failed</span>}
            </div>
            
            {videos.length > 0 && (
              <button 
                onClick={handleDeleteAll}
                className="text-[var(--color-text-muted)] hover:text-red-400 text-sm font-medium transition-colors"
              >
                Clear All
              </button>
            )}
          </div>
        </div>

        {videos.length === 0 ? (
          <div className="text-center py-16 bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-xl border-dashed">
            <Film size={48} className="mx-auto text-[var(--color-border-hover)] mb-4" />
            <h3 className="text-lg font-medium text-[var(--color-text-primary)]">No videos yet</h3>
            <p className="text-[var(--color-text-secondary)] mt-1">Upload your first video above to get started</p>
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {videos.map((video) => {
                const isSelected = selectedVideoId === video.id;
                return (
                  <motion.div
                    key={video.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, height: 0, overflow: 'hidden', margin: 0 }}
                    className="flex flex-col"
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
                      {isSelected && (
                        <VideoDetailView video={video} onRetry={handleRetry} />
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
