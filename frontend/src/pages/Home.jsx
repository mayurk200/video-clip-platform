import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { 
  CheckCircle2, Circle, Loader2, 
  Film, Zap, Play
} from "lucide-react";
import DropzoneUploader from "@/components/upload/DropzoneUploader";
import useVideoStore from "@/store/videoSlice";
import clipService from "@/services/clipService";
import { cn } from "@/lib/utils";

const PIPELINE_STAGES = [
  { id: "UPLOAD", label: "Upload Complete" },
  { id: "AUDIO_EXTRACTION", label: "Extracting Audio" },
  { id: "TRANSCRIPTION", label: "Transcribing" },
  { id: "ANALYSIS", label: "Analyzing Virality" },
  { id: "CLIPPING", label: "Finding Viral Moments & Clipping" },
  { id: "REFRAMING", label: "Reframing to Vertical" },
  { id: "COMPLETED", label: "Processing Complete" }
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
    const idx = PIPELINE_STAGES.findIndex(s => s.id === stage);
    return idx === -1 ? 0 : idx;
  };

  const currentIndex = getStageIndex(currentStage);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel rounded-2xl p-8 max-w-3xl mx-auto mt-8"
    >
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-xl font-semibold">Processing: {video.originalFilename}</h2>
          <p className="text-sm text-zinc-400 mt-1">Our AI is currently working its magic.</p>
        </div>
      </div>

      <div className="space-y-6">
        {PIPELINE_STAGES.map((stage, idx) => {
          const isActive = idx === currentIndex && !isCompleted && !isFailed;
          const isDone = idx < currentIndex || isCompleted;

          return (
            <div key={stage.id} className={cn("flex items-center gap-4 transition-opacity duration-300", 
              (isDone || isActive) ? "opacity-100" : "opacity-40"
            )}>
              <div className="relative">
                {isDone ? (
                  <CheckCircle2 size={24} className="text-emerald-500" />
                ) : isActive ? (
                  <Loader2 size={24} className="text-blue-500 animate-spin" />
                ) : (
                  <Circle size={24} className="text-zinc-600" />
                )}
                {/* Connecting line */}
                {idx !== PIPELINE_STAGES.length - 1 && (
                  <div className={cn(
                    "absolute top-6 left-1/2 -translate-x-1/2 w-[2px] h-6",
                    isDone ? "bg-emerald-500/50" : "bg-white/[0.05]"
                  )} />
                )}
              </div>
              <div>
                <p className={cn("font-medium", isDone ? "text-emerald-400" : isActive ? "text-white" : "text-zinc-500")}>
                  {stage.label}
                </p>
                {isActive && (
                  <p className="text-xs text-blue-400 mt-1 animate-pulse">In progress...</p>
                )}
                {isDone && statusData?.steps?.[stage.id]?.elapsedMs && (
                  <p className="text-xs text-zinc-500 mt-1">
                    Took {(statusData.steps[stage.id].elapsedMs / 1000).toFixed(1)}s
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {isFailed && (
        <div className="mt-8 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
          <p className="text-red-400 text-sm font-medium">Processing failed. Please check backend logs or try again.</p>
        </div>
      )}
    </motion.div>
  );
}

export default function Home() {
  const { videos, pollStatus, processingStatuses, fetchVideos } = useVideoStore();
  const [latestVideoId, setLatestVideoId] = useState(null);
  
  const [recentClips, setRecentClips] = useState([]);
  const [isLoadingClips, setIsLoadingClips] = useState(true);

  // Fetch initial videos
  useEffect(() => {
    fetchVideos();
    const interval = setInterval(() => fetchVideos(), 5000);
    return () => clearInterval(interval);
  }, [fetchVideos]);

  // Fetch initial clips
  useEffect(() => {
    const loadClips = async () => {
      try {
        const res = await clipService.listRecent(15);
        if (res.clips) setRecentClips(res.clips);
      } catch (e) {
        console.error("Failed to load clips", e);
      } finally {
        setIsLoadingClips(false);
      }
    };
    loadClips();
    
    // Refresh clips periodically
    const interval = setInterval(loadClips, 5000);
    return () => clearInterval(interval);
  }, []);

  // Set latest processing video automatically
  useEffect(() => {
    if (!latestVideoId && videos.length > 0) {
      const activeVideo = videos.find(v => ["QUEUED", "PROCESSING"].includes(v.status));
      if (activeVideo) {
        setLatestVideoId(activeVideo.id);
      }
    }
  }, [videos, latestVideoId]);

  const latestVideo = videos.find(v => v.id === latestVideoId);
  const isProcessing = latestVideo && ["QUEUED", "PROCESSING"].includes(latestVideo.status);
  const showPipeline = latestVideo && ["QUEUED", "PROCESSING", "COMPLETED", "FAILED"].includes(latestVideo.status);

  // Poll status if processing
  useEffect(() => {
    let interval;
    if (isProcessing) {
      pollStatus(latestVideoId);
      interval = setInterval(() => pollStatus(latestVideoId), 3000);
    }
    return () => clearInterval(interval);
  }, [isProcessing, latestVideoId, pollStatus]);

  return (
    <div className="max-w-6xl mx-auto py-8 space-y-16">
      
      {/* 1. Upload & Processing Section */}
      <section>
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold tracking-tight mb-3">ClipForge AI Studio</h1>
          <p className="text-zinc-400 text-lg">Upload your long-form video and let our AI extract the most engaging moments automatically.</p>
        </div>

        {!showPipeline ? (
          <DropzoneUploader onUploadSuccess={(videoId) => setLatestVideoId(videoId)} />
        ) : (
          <>
            <div className="text-center mb-8">
              <button 
                onClick={() => setLatestVideoId(null)}
                className="btn btn-secondary"
              >
                Upload another video
              </button>
            </div>
            <PipelineProgress 
              video={latestVideo} 
              statusData={processingStatuses[latestVideoId]} 
            />
          </>
        )}
      </section>

      {/* 2. Recent Clips Section */}
      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <Zap className="text-yellow-500" size={24}/> Your Viral Clips
          </h2>
        </div>
        
        {isLoadingClips ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {[1,2,3,4,5].map(i => (
              <div key={i} className="aspect-[9/16] bg-white/[0.02] border border-white/[0.05] rounded-xl animate-pulse"></div>
            ))}
          </div>
        ) : recentClips.length === 0 ? (
          <div className="glass-panel rounded-xl p-12 text-center flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-white/[0.03] border border-white/[0.05] flex items-center justify-center mb-4">
              <Film size={24} className="text-zinc-500" />
            </div>
            <h3 className="text-lg font-medium text-zinc-200">No clips yet</h3>
            <p className="text-sm text-zinc-500 mt-1 max-w-sm">Upload a video above to start extracting highly engaging vertical clips automatically.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {recentClips.map((clip) => (
              <div key={clip.id} className="group relative aspect-[9/16] rounded-xl overflow-hidden bg-black border border-white/[0.1] hover:border-white/[0.3] transition-all">
                {/* Simulated Thumbnail background */}
                <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 to-zinc-900 opacity-50 group-hover:opacity-30 transition-opacity"></div>
                <div className="absolute inset-0 bg-black/40 group-hover:bg-transparent transition-colors"></div>
                
                {/* Viral Score Badge */}
                <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-2 py-1 rounded border border-white/10 flex items-center gap-1">
                  <Zap size={12} className="text-yellow-400" />
                  <span className="text-xs font-bold text-white">{clip.viralScore}</span>
                </div>
                
                {/* Play Button Overlay */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100 transition-all duration-300">
                  <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center">
                    <Play fill="white" size={20} className="text-white ml-1" />
                  </div>
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/90 via-black/40 to-transparent">
                  <p className="text-sm font-semibold text-white line-clamp-2">{clip.title}</p>
                  <p className="text-[10px] text-zinc-400 mt-1">{Math.round(clip.duration)}s</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
