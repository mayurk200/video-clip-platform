import { AnimatePresence } from "framer-motion";
import ClipCard from "./ClipCard";

/**
 * Responsive grid of clip cards.
 */
export default function ClipGrid({ clips, onSelect, onDelete, onDownload }) {
  if (!clips || clips.length === 0) {
    return (
      <div className="text-center py-16 text-[var(--color-text-muted)]">
        <p className="text-lg font-medium">No clips generated yet</p>
        <p className="text-sm mt-1">Upload a video to start generating viral clips.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      <AnimatePresence mode="popLayout">
        {clips.map((clip) => (
          <ClipCard
            key={clip.id}
            clip={clip}
            onSelect={onSelect}
            onDelete={onDelete}
            onDownload={onDownload}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
