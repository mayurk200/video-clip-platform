import { motion } from "framer-motion";
import { Cpu, OctagonX } from "lucide-react";
import useMonitorStore from "@/store/monitorSlice";
import { cn } from "@/lib/utils";

const STATUS_STYLES = {
  running:   { dot: "bg-emerald-400 animate-pulse", text: "text-emerald-400", label: "Running" },
  waiting:   { dot: "bg-amber-400", text: "text-amber-400", label: "Waiting" },
  completed: { dot: "bg-blue-400", text: "text-blue-400", label: "Completed" },
  failed:    { dot: "bg-red-400", text: "text-red-400", label: "Failed" },
  cancelled: { dot: "bg-zinc-500", text: "text-zinc-500", label: "Cancelled" },
  paused:    { dot: "bg-orange-400", text: "text-orange-400", label: "Paused" },
  idle:      { dot: "bg-zinc-600", text: "text-zinc-500", label: "Idle" },
};

function formatDuration(ms) {
  if (!ms) return "—";
  if (ms < 1000) return `${ms}ms`;
  const s = Math.floor(ms / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  return `${m}m ${s % 60}s`;
}

function formatTime(iso) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" });
  } catch {
    return "—";
  }
}

export default function ProcessMonitor() {
  const { processes, killAllProcesses } = useMonitorStore();
  const hasRunning = processes.some((p) => p.status === "running" || p.status === "waiting");

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="glass-panel-solid rounded-xl overflow-hidden flex-1"
    >
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.06]">
        <Cpu size={14} className="text-blue-400" />
        <h3 className="text-sm font-semibold text-zinc-200">Process Monitor</h3>
        <span className="text-[10px] text-zinc-600 tabular-nums">{processes.length} tracked</span>
        <div className="ml-auto">
          <button
            onClick={killAllProcesses}
            disabled={!hasRunning}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] font-semibold border transition-all ${
              hasRunning
                ? "text-red-400 hover:text-red-300 bg-red-500/[0.08] hover:bg-red-500/[0.15] border-red-500/[0.15] cursor-pointer"
                : "text-zinc-600 bg-white/[0.02] border-white/[0.04] cursor-not-allowed opacity-50"
            }`}
          >
            <OctagonX size={13} />
            Kill All
          </button>
        </div>
      </div>

      {/* Column headers */}
      <div className="grid grid-cols-[1fr_90px_70px_70px_100px] gap-2 px-4 py-2 text-[10px] text-zinc-600 uppercase tracking-wider border-b border-white/[0.04]">
        <span>Process</span>
        <span>Status</span>
        <span>Started</span>
        <span>Duration</span>
        <span>Progress</span>
      </div>

      {/* Rows */}
      <div className="max-h-[200px] overflow-y-auto custom-scrollbar">
        {processes.length === 0 ? (
          <div className="px-4 py-6 text-center text-xs text-zinc-600">No active processes</div>
        ) : (
          processes.map((proc) => {
            const style = STATUS_STYLES[proc.status] || STATUS_STYLES.idle;
            return (
              <div
                key={proc.id}
                className="grid grid-cols-[1fr_90px_70px_70px_100px] gap-2 items-center px-4 py-2 border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors"
              >
                <div>
                  <p className="text-xs font-medium text-zinc-200 truncate">{proc.name}</p>
                  {proc.activity && (
                    <p className="text-[10px] text-zinc-600 truncate">{proc.activity}</p>
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  <div className={cn("w-1.5 h-1.5 rounded-full", style.dot)} />
                  <span className={cn("text-[11px] font-medium", style.text)}>{style.label}</span>
                </div>
                <span className="text-[11px] text-zinc-500 tabular-nums">{formatTime(proc.startTime)}</span>
                <span className="text-[11px] text-zinc-500 tabular-nums">{formatDuration(proc.duration)}</span>
                <div>
                  {proc.status === "running" || proc.progress > 0 ? (
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 rounded-full bg-white/[0.05] overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${proc.progress}%` }}
                          className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
                        />
                      </div>
                      <span className="text-[10px] text-zinc-500 tabular-nums w-8 text-right">{Math.round(proc.progress)}%</span>
                    </div>
                  ) : proc.status === "completed" ? (
                    <span className="text-[10px] text-blue-400">✓ Done</span>
                  ) : proc.status === "failed" ? (
                    <span className="text-[10px] text-red-400">✗ Error</span>
                  ) : (
                    <span className="text-[10px] text-zinc-600">—</span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </motion.div>
  );
}

