import { motion } from "framer-motion";
import { Play, Download, Trash2, Clock } from "lucide-react";
import ViralScoreBadge from "./ViralScoreBadge";
import { formatDuration, truncate } from "@/lib/utils";

/**
 * Premium clip card with thumbnail, score ring, and hover effects.
 */
export default function ClipCard({ clip, onSelect, onDelete, onDownload }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -3 }}
      className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl overflow-hidden group cursor-pointer transition-all duration-300 hover:border-[var(--color-border-hover)] hover:shadow-card"
      onClick={() => onSelect?.(clip)}
    >
      {/* Thumbnail area */}
      <div className="relative aspect-video bg-[var(--color-bg-elevated)]">
        {clip.thumbnailUrl ? (
          <img src={clip.thumbnailUrl} alt={clip.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-12 h-12 rounded-xl bg-[var(--color-bg-card)] flex items-center justify-center">
              <Play size={20} className="text-[var(--color-text-muted)] ml-0.5" />
            </div>
          </div>
        )}

        {/* Duration pill */}
        <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1 px-2 py-1 rounded-lg bg-black/60 backdrop-blur-sm">
          <Clock size={10} className="text-white/70" />
          <span className="text-[10px] font-semibold text-white tabular-nums">
            {formatDuration(clip.duration)}
          </span>
        </div>

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
          <motion.div
            initial={{ scale: 0.8 }}
            whileHover={{ scale: 1.1 }}
            className="w-12 h-12 rounded-full bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20"
          >
            <Play size={18} className="text-white ml-0.5" />
          </motion.div>
        </div>

        {/* Score badge — top right */}
        <div className="absolute top-2.5 right-2.5">
          <ViralScoreBadge score={clip.viralScore || 0} size={40} />
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-sm font-semibold text-[var(--color-text-primary)] truncate leading-snug">
          {clip.title || "Untitled Clip"}
        </h3>
        <p className="text-xs text-[var(--color-text-muted)] mt-1 leading-relaxed line-clamp-2">
          {truncate(clip.reason, 80)}
        </p>

        {/* Actions */}
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[var(--color-border)]">
          <button
            onClick={(e) => { e.stopPropagation(); onDownload?.(clip); }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[var(--color-primary-light)] text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white transition-all"
          >
            <Download size={11} /> Export
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete?.(clip); }}
            className="ml-auto p-1.5 rounded-lg text-[var(--color-text-muted)] hover:text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
