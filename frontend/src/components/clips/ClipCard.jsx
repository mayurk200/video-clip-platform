import { motion } from "framer-motion";
import { Play, Download, Trash2 } from "lucide-react";
import ViralScoreBadge from "./ViralScoreBadge";
import { formatDuration, truncate } from "@/lib/utils";

/**
 * Card displaying a generated clip with score, title, and actions.
 */
export default function ClipCard({ clip, onSelect, onDelete, onDownload }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      whileHover={{ y: -4 }}
      className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-xl overflow-hidden group cursor-pointer transition-all hover:border-[var(--color-border-hover)]"
      onClick={() => onSelect?.(clip)}
    >
      {/* Thumbnail */}
      <div className="relative aspect-video bg-[var(--color-bg-elevated)]">
        {clip.thumbnailUrl ? (
          <img src={clip.thumbnailUrl} alt={clip.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[var(--color-text-muted)]">
            <Play size={32} />
          </div>
        )}

        {/* Duration badge */}
        <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/70 text-xs font-medium text-white">
          {formatDuration(clip.duration)}
        </span>

        {/* Hover play overlay */}
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <Play size={20} className="text-white ml-0.5" />
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-[var(--color-text-primary)] truncate">
              {clip.title || "Untitled Clip"}
            </h3>
            <p className="text-xs text-[var(--color-text-muted)] mt-1">
              {truncate(clip.reason, 50)}
            </p>
          </div>
          <ViralScoreBadge score={clip.viralScore || 0} size={44} />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[var(--color-border)]">
          <button
            onClick={(e) => { e.stopPropagation(); onDownload?.(clip); }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[var(--color-bg-elevated)] hover:bg-white/5 text-[var(--color-text-secondary)] transition-colors"
          >
            <Download size={12} /> Export
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete?.(clip); }}
            className="ml-auto p-1.5 rounded-lg text-[var(--color-text-muted)] hover:text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
