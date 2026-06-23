import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Circle, Loader2, Film } from "lucide-react";
import DropzoneUploader from "@/components/upload/DropzoneUploader";
import useVideoStore from "@/store/videoSlice";
import Button from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const PIPELINE_STAGES = [
  { id: "UPLOAD", label: "Upload Complete" },
  { id: "AUDIO_EXTRACTION", label: "Extracting Audio" },
  { id: "TRANSCRIPTION", label: "Transcribing" },
  { id: "ANALYSIS", label: "Analyzing Virality" },
  { id: "CLIPPING", label: "Finding Viral Moments & Clipping" },
  { id: "REFRAMING", label: "Reframing to Vertical" },
  { id: "COMPLETED", label: "Processing Complete" },
];

function PipelineProgress({ video, statusData }) {
  let currentStage = video.status;

  if (statusData?.steps) {
    for (let i = PIPELINE_STAGES.length - 1; i >= 0; i--) {
      const stageId = PIPELINE_STAGES[i].id;
      if (statusData.steps[stageId]) {
        currentStage = stageId;
        break;
      }
    }
  }

  const isFailed = video.status === "FAILED" || statusData?.status === "failed";
  const isCompleted = video.status === "COMPLETED" || statusData?.status === "completed";

  const getStageIndex = (stage) => {
    if (isCompleted) return PIPELINE_STAGES.length - 1;
    const idx = PIPELINE_STAGES.findIndex((s) => s.id === stage);
    return idx === -1 ? 0 : idx;
  };

  const currentIndex = getStageIndex(currentStage);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel-solid rounded-xl p-6 max-w-2xl mx-auto"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold">Processing: {video.originalFilename}</h2>
          <p className="text-xs text-text-muted mt-1">Our AI is extracting viral moments.</p>
        </div>
      </div>

      <div className="space-y-4">
        {PIPELINE_STAGES.map((stage, idx) => {
          const isActive = idx === currentIndex && !isCompleted && !isFailed;
          const isDone = idx < currentIndex || isCompleted;

          return (
            <div key={stage.id} className={cn(
              "flex items-center gap-3 transition-opacity duration-300",
              (isDone || isActive) ? "opacity-100" : "opacity-30"
            )}>
              <div className="relative shrink-0">
                {isDone ? (
                  <CheckCircle2 size={20} className="text-success" />
                ) : isActive ? (
                  <Loader2 size={20} className="text-accent animate-spin" />
                ) : (
                  <Circle size={20} className="text-text-faint" />
                )}
                {idx !== PIPELINE_STAGES.length - 1 && (
                  <div className={cn(
                    "absolute top-5 left-1/2 -translate-x-1/2 w-px h-4",
                    isDone ? "bg-success/40" : "bg-white/[0.05]"
                  )} />
                )}
              </div>
              <div>
                <p className={cn(
                  "text-sm font-medium",
                  isDone ? "text-success" : isActive ? "text-text-primary" : "text-text-faint"
                )}>
                  {stage.label}
                </p>
                {isActive && <p className="text-xs text-accent mt-0.5 animate-pulse">In progress...</p>}
                {isDone && statusData?.steps?.[stage.id]?.elapsedMs && (
                  <p className="text-xs text-text-faint mt-0.5">
                    {(statusData.steps[stage.id].elapsedMs / 1000).toFixed(1)}s
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {isFailed && (
        <div className="mt-6 p-3 bg-danger-muted border border-danger/20 rounded-lg">
          <p className="text-sm text-danger font-medium">Processing failed. Check backend logs or try again.</p>
        </div>
      )}
    </motion.div>
  );
}

export default function Upload() {
  const { videos, pollStatus, processingStatuses, fetchVideos } = useVideoStore();
  const [latestVideoId, setLatestVideoId] = useState(null);

  useEffect(() => {
    fetchVideos();
    const interval = setInterval(() => fetchVideos(), 5000);
    return () => clearInterval(interval);
  }, [fetchVideos]);

  useEffect(() => {
    if (!latestVideoId && videos.length > 0) {
      const activeVideo = videos.find((v) => ["QUEUED", "PROCESSING"].includes(v.status));
      if (activeVideo) setLatestVideoId(activeVideo.id);
    }
  }, [videos, latestVideoId]);

  const latestVideo = videos.find((v) => v.id === latestVideoId);
  const isProcessing = latestVideo && ["QUEUED", "PROCESSING"].includes(latestVideo.status);
  const showPipeline = latestVideo && ["QUEUED", "PROCESSING", "COMPLETED", "FAILED"].includes(latestVideo.status);

  useEffect(() => {
    let interval;
    if (isProcessing) {
      pollStatus(latestVideoId);
      interval = setInterval(() => pollStatus(latestVideoId), 3000);
    }
    return () => clearInterval(interval);
  }, [isProcessing, latestVideoId, pollStatus]);

  const handleUploadSuccess = useCallback((videoId) => {
    setLatestVideoId(videoId);
  }, []);

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-2xl font-bold tracking-tight mb-2">Upload Video</h1>
        <p className="text-sm text-text-muted">
          Drop your long-form video and let AI extract the most viral moments.
        </p>
      </motion.div>

      {/* Upload or Pipeline */}
      {!showPipeline ? (
        <DropzoneUploader onUploadSuccess={handleUploadSuccess} />
      ) : (
        <>
          <div className="text-center">
            <Button
              variant="secondary"
              onClick={() => setLatestVideoId(null)}
              icon={Film}
            >
              Upload another video
            </Button>
          </div>
          <PipelineProgress
            video={latestVideo}
            statusData={processingStatuses[latestVideoId]}
          />
        </>
      )}
    </div>
  );
}
