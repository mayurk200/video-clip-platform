import { useParams } from "react-router-dom";
import { useEffect } from "react";
import useClips from "@/hooks/useClips";
import useVideoStore from "@/store/videoSlice";
import useProcessingStatus from "@/hooks/useProcessingStatus";
import ClipGrid from "@/components/clips/ClipGrid";
import ProcessingTimeline from "@/components/analytics/ProcessingTimeline";
import ViralScoreChart from "@/components/analytics/ViralScoreChart";
import VideoPlayer from "@/components/editor/VideoPlayer";
import Timeline from "@/components/editor/Timeline";
import CaptionEditor from "@/components/editor/CaptionEditor";
import CropResizer from "@/components/editor/CropResizer";
import TitleEditor from "@/components/editor/TitleEditor";
import ThumbnailEditor from "@/components/editor/ThumbnailEditor";

/**
 * Clip editor page — video preview + clips grid + editing tools.
 */
export default function ClipEditor() {
  const { videoId } = useParams();
  const { fetchVideo, currentVideo } = useVideoStore();
  const { clips, activeClip, setActiveClip, isLoading } = useClips(videoId);
  const status = useProcessingStatus(videoId);

  useEffect(() => {
    fetchVideo(videoId);
  }, [videoId]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
        {currentVideo?.filename || "Clip Editor"}
      </h1>

      {/* Processing status */}
      {status && status.status !== "completed" && (
        <ProcessingTimeline status={status.steps || {}} />
      )}

      {/* Main layout: 2-column when clip is active */}
      {activeClip ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: video preview + timeline */}
          <div className="lg:col-span-2 space-y-4">
            <VideoPlayer src={activeClip.videoUrl} className="aspect-video" />
            <Timeline duration={activeClip.duration || 0} currentTime={0} markers={[]} />
          </div>

          {/* Right: editing tools */}
          <div className="space-y-4">
            <ViralScoreChart scores={activeClip.scores || {}} />
            <TitleEditor title={activeClip.title} hook={activeClip.hook} />
            <CaptionEditor captions={activeClip.captions || []} />
            <CropResizer aspectRatio={activeClip.aspectRatio || "9:16"} />
            <ThumbnailEditor frames={activeClip.thumbnails || []} />

            {/* Export button */}
            <button className="w-full py-3 rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white font-semibold transition-colors glow-btn">
              Export Clip
            </button>
            <button
              onClick={() => setActiveClip(null)}
              className="w-full py-2.5 rounded-xl border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-white/5 transition-colors"
            >
              Back to All Clips
            </button>
          </div>
        </div>
      ) : (
        /* All clips grid */
        <ClipGrid
          clips={clips}
          onSelect={setActiveClip}
          onDelete={(clip) => console.log("Delete", clip.id)}
          onDownload={(clip) => console.log("Download", clip.id)}
        />
      )}
    </div>
  );
}
