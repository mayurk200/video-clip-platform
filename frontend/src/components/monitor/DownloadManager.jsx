import { motion } from "framer-motion";
import { Download, Search, Trash2, RotateCcw, X, Play } from "lucide-react";
import useMonitorStore from "@/store/monitorSlice";
import { cn } from "@/lib/utils";
import { useState } from "react";

const STATUS_CONFIG = {
  queued:       { color: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30", label: "Queued" },
  "fetching-metadata": { color: "bg-blue-500/20 text-blue-400 border-blue-500/30", label: "Fetching Metadata" },
  downloading:  { color: "bg-blue-500/20 text-blue-400 border-blue-500/30", label: "Downloading", pulse: true },
  merging:      { color: "bg-purple-500/20 text-purple-400 border-purple-500/30", label: "Merging" },
  processing:   { color: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30", label: "Processing" },
  completed:    { color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30", label: "Completed" },
  failed:       { color: "bg-red-500/20 text-red-400 border-red-500/30", label: "Failed" },
  cancelled:    { color: "bg-zinc-500/20 text-zinc-500 border-zinc-500/30", label: "Cancelled" },
};

function ActiveDownloadCard({ dl }) {
  const cfg = STATUS_CONFIG[dl.status] || STATUS_CONFIG.queued;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-panel rounded-xl p-4 border border-white/[0.06]"
    >
      {/* Thumbnail placeholder */}
      <div className="relative w-full h-24 rounded-lg bg-gradient-to-br from-zinc-800 to-zinc-900 mb-3 flex items-center justify-center overflow-hidden">
        <Play size={24} className="text-zinc-600" />
        <div className="absolute top-2 right-2">
          <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-black/60 text-zinc-300 border border-white/[0.1]">
            {dl.format || "MP4"} {dl.resolution || ""}
          </span>
        </div>
      </div>

      {/* Title */}
      <h4 className="text-xs font-semibold text-zinc-200 truncate mb-1">{dl.title}</h4>

      {/* Status badge */}
      <span className={cn(
        "inline-block px-1.5 py-0.5 rounded text-[9px] font-semibold uppercase border mb-3",
        cfg.color,
        cfg.pulse && "animate-pulse"
      )}>
        {cfg.label}
      </span>

      {/* Progress bar */}
      <div className="mb-2">
        <div className="h-2 rounded-full bg-white/[0.05] overflow-hidden">
          <motion.div
            animate={{ width: `${dl.progress || 0}%` }}
            transition={{ ease: "linear", duration: 0.5 }}
            className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-1 text-[10px] text-zinc-500">
        <div>
          <span className="text-zinc-600">Downloaded</span>
          <p className="text-zinc-300 font-medium tabular-nums">{dl.downloaded || "0"} / {dl.total || "—"}</p>
        </div>
        <div>
          <span className="text-zinc-600">Speed</span>
          <p className="text-zinc-300 font-medium tabular-nums">{dl.speed || "—"}</p>
        </div>
        <div>
          <span className="text-zinc-600">ETA</span>
          <p className="text-zinc-300 font-medium tabular-nums">{dl.eta || "—"}</p>
        </div>
      </div>
    </motion.div>
  );
}

export default function DownloadManager() {
  const { downloads, downloadHistory, deleteDownload } = useMonitorStore();
  const [historySearch, setHistorySearch] = useState("");

  const filteredHistory = downloadHistory
    .filter((d) => {
      if (!historySearch) return true;
      const s = historySearch.toLowerCase();
      return d.title?.toLowerCase().includes(s) || d.url?.toLowerCase().includes(s);
    })
    .slice(-20)
    .reverse();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="glass-panel-solid rounded-xl overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.06]">
        <Download size={14} className="text-purple-400" />
        <h3 className="text-sm font-semibold text-zinc-200">Download Manager</h3>
        <span className="ml-auto text-[10px] text-zinc-600 tabular-nums">
          {downloads.length} active · {downloadHistory.length} total
        </span>
      </div>

      {/* Active Downloads Grid */}
      {downloads.length > 0 && (
        <div className="p-4 border-b border-white/[0.06]">
          <p className="text-[10px] text-zinc-600 uppercase tracking-wider mb-3">Active Downloads</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {downloads.map((dl) => (
              <ActiveDownloadCard key={dl.id} dl={dl} />
            ))}
          </div>
        </div>
      )}

      {/* Download History */}
      <div>
        <div className="flex items-center gap-2 px-4 py-2 border-b border-white/[0.04]">
          <p className="text-[10px] text-zinc-600 uppercase tracking-wider">History</p>
          <div className="ml-auto relative">
            <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-zinc-600" />
            <input
              type="text"
              placeholder="Search..."
              value={historySearch}
              onChange={(e) => setHistorySearch(e.target.value)}
              className="pl-7 pr-2 py-1 rounded bg-white/[0.03] border border-white/[0.05] text-[10px] text-zinc-300 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500 w-[140px] transition-colors"
            />
          </div>
        </div>

        <div className="max-h-[200px] overflow-y-auto custom-scrollbar">
          {filteredHistory.length === 0 ? (
            <div className="px-4 py-6 text-center text-xs text-zinc-600">No download history</div>
          ) : (
            filteredHistory.map((dl) => {
              const cfg = STATUS_CONFIG[dl.status] || STATUS_CONFIG.completed;
              return (
                <div
                  key={dl.id}
                  className="flex items-center gap-3 px-4 py-2 border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors"
                >
                  {/* Mini thumbnail */}
                  <div className="w-10 h-7 rounded bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center shrink-0">
                    <Play size={10} className="text-zinc-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] text-zinc-300 font-medium truncate">{dl.title}</p>
                    <p className="text-[9px] text-zinc-600 truncate">{dl.url}</p>
                  </div>
                  <span className="text-[10px] text-zinc-600 tabular-nums shrink-0">{dl.total || "—"}</span>
                  <span className={cn(
                    "shrink-0 px-1.5 py-0.5 rounded text-[9px] font-semibold uppercase border",
                    cfg.color
                  )}>
                    {cfg.label}
                  </span>
                  <button
                    onClick={() => deleteDownload(dl.id)}
                    className="shrink-0 p-1 rounded hover:bg-red-500/10 text-zinc-600 hover:text-red-400 transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </motion.div>
  );
}
