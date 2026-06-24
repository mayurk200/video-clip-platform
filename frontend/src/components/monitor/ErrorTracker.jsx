import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Copy, ChevronDown, ChevronRight } from "lucide-react";
import useMonitorStore from "@/store/monitorSlice";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

function ErrorRow({ error }) {
  const [expanded, setExpanded] = useState(false);

  const typeColor = {
    RuntimeError: "bg-red-500/20 text-red-400 border-red-500/30",
    DownloadError: "bg-orange-500/20 text-orange-400 border-orange-500/30",
    MetadataError: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    UnhandledRejection: "bg-pink-500/20 text-pink-400 border-pink-500/30",
    UncaughtException: "bg-red-600/20 text-red-300 border-red-600/30",
    Timeout: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    FileNotFound: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  };

  const time = error.time?.split(" ")[1] || error.time?.split("T")[1]?.slice(0, 8) || "";

  return (
    <div className="border-b border-white/[0.03] last:border-0">
      <div
        className="flex items-center gap-3 px-4 py-2.5 hover:bg-white/[0.02] cursor-pointer transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        {expanded ? <ChevronDown size={12} className="text-zinc-500" /> : <ChevronRight size={12} className="text-zinc-500" />}
        <span className={cn(
          "shrink-0 px-1.5 py-0.5 rounded text-[9px] font-semibold uppercase border",
          typeColor[error.type] || typeColor.RuntimeError
        )}>
          {error.type || "Error"}
        </span>
        <span className="flex-1 text-xs text-zinc-300 truncate">{error.message}</span>
        <span className="text-[10px] text-zinc-600 shrink-0">{error.module}</span>
        <span className="text-[10px] text-zinc-600 tabular-nums shrink-0 w-[60px] text-right">{time}</span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            navigator.clipboard.writeText(`[${error.type}] ${error.message}\n${error.stack || ""}`);
            toast.success("Error copied to clipboard");
          }}
          className="shrink-0 p-1 rounded hover:bg-white/[0.05] text-zinc-600 hover:text-zinc-300 transition-colors"
          title="Copy error"
        >
          <Copy size={12} />
        </button>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-3 pt-1 ml-6 space-y-2">
              {error.cause && (
                <div className="text-[11px]">
                  <span className="text-zinc-600">Cause: </span>
                  <span className="text-amber-400">{error.cause}</span>
                </div>
              )}
              {error.stack && (
                <pre className="text-[10px] text-zinc-500 font-mono bg-black/40 rounded-md p-2 overflow-x-auto whitespace-pre-wrap max-h-[120px] overflow-y-auto custom-scrollbar">
                  {error.stack}
                </pre>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ErrorTracker() {
  const { errors } = useMonitorStore();
  const recentErrors = errors.slice(-20).reverse();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="glass-panel-solid rounded-xl overflow-hidden flex-1"
    >
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.06]">
        <AlertTriangle size={14} className="text-red-400" />
        <h3 className="text-sm font-semibold text-zinc-200">Error Tracker</h3>
        <span className={cn(
          "ml-auto px-1.5 py-0.5 rounded text-[10px] font-semibold tabular-nums",
          recentErrors.length > 0 ? "bg-red-500/20 text-red-400" : "text-zinc-600"
        )}>
          {recentErrors.length}
        </span>
      </div>

      {/* Error list */}
      <div className="max-h-[200px] overflow-y-auto custom-scrollbar">
        {recentErrors.length === 0 ? (
          <div className="px-4 py-6 text-center text-xs text-zinc-600">No errors detected ✓</div>
        ) : (
          recentErrors.map((error, i) => <ErrorRow key={error.id || i} error={error} />)
        )}
      </div>
    </motion.div>
  );
}
