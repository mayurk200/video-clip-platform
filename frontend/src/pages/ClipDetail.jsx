import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Zap, Clock, CheckCircle2, Play } from "lucide-react";
import Button from "@/components/ui/Button";
import ExportPanel from "@/components/clips/ExportPanel";
import ScoreBreakdown from "@/components/clips/ScoreBreakdown";
import { SkeletonCard } from "@/components/ui/Skeleton";
import clipService from "@/services/clipService";

export default function ClipDetail() {
  const { id } = useParams();
  const [clip, setClip] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadClip = async () => {
      try {
        const res = await clipService.getById(id);
        setClip(res.clip || res);
      } catch (e) {
        console.error("Failed to load clip", e);
      } finally {
        setIsLoading(false);
      }
    };
    if (id) loadClip();
  }, [id]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  if (!clip) {
    return (
      <div className="text-center py-20">
        <p className="text-text-muted">Clip not found.</p>
        <Link to="/clips" className="text-accent text-sm mt-2 inline-block hover:underline">
          Back to Clips
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back */}
      <Link to="/clips" className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-text-primary transition-colors">
        <ArrowLeft size={16} /> Back to Clips
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        {/* Video Player Column */}
        <div className="lg:col-span-1">
          <div className="aspect-[9/16] rounded-xl overflow-hidden bg-black border border-border shadow-xl">
            <video
              src={`/api/clips/${clip.id}/download`}
              controls
              className="w-full h-full object-cover"
              poster={`/api/clips/${clip.id}/thumbnail`}
              preload="metadata"
            />
          </div>
        </div>

        {/* Details Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title & Metadata */}
          <div className="glass-panel-solid rounded-xl p-6">
            <div className="flex items-start justify-between gap-4 mb-4">
              <h1 className="text-xl font-bold text-text-primary">{clip.title || "Untitled Clip"}</h1>
              <div className="flex items-center gap-1.5 bg-yellow-500/10 px-3 py-1.5 rounded-lg border border-yellow-500/20 shrink-0">
                <Zap size={14} className="text-yellow-500" fill="currentColor" />
                <span className="text-sm font-bold text-yellow-500">{clip.viralScore}</span>
              </div>
            </div>

            <div className="flex items-center gap-4 text-sm text-text-muted">
              <span className="flex items-center gap-1.5">
                <Clock size={14} /> {Math.round(clip.duration)}s
              </span>
              {clip.startTime != null && (
                <span className="flex items-center gap-1.5">
                  <Play size={14} /> {Math.round(clip.startTime)}s — {Math.round(clip.endTime)}s
                </span>
              )}
            </div>
          </div>

          {/* Hook */}
          {clip.hook && (
            <div className="glass-panel-solid rounded-xl p-6">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1 h-full min-h-[24px] bg-success rounded-full" />
                <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-success" /> Generated Hook
                </h3>
              </div>
              <p className="text-lg font-medium text-success italic leading-relaxed">
                "{clip.hook}"
              </p>
            </div>
          )}

          {/* Score Breakdown */}
          <div className="glass-panel-solid rounded-xl p-6">
            <ScoreBreakdown scores={clip.scores || clip.scoreBreakdown} />
          </div>

          {/* Export Panel */}
          <div className="glass-panel-solid rounded-xl p-6">
            <ExportPanel clipId={clip.id} />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
