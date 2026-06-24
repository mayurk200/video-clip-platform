import { motion } from "framer-motion";
import {
  Activity, Cpu, AlertTriangle, ScrollText, Download, Clock,
  ToggleLeft, ToggleRight, Trash2, FileDown, Bug
} from "lucide-react";
import useMonitorStore from "@/store/monitorSlice";
import { cn } from "@/lib/utils";

function StatPill({ icon: Icon, label, value, color = "text-zinc-400" }) {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.06]">
      <Icon size={13} className={color} />
      <span className="text-[11px] text-zinc-500 uppercase tracking-wider">{label}</span>
      <span className={cn("text-sm font-semibold tabular-nums", color)}>{value}</span>
    </div>
  );
}

export default function MonitorHeader() {
  const {
    stats, monitoringEnabled, debugMode,
    toggleMonitoring, toggleDebug, clearLogs, exportLogs, sseConnected,
  } = useMonitorStore();

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-4"
    >
      {/* Title row */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-glow-sm">
            <Activity size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">System Monitor</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <div className={cn(
                "w-1.5 h-1.5 rounded-full",
                sseConnected ? "bg-emerald-400 animate-pulse" : "bg-zinc-600"
              )} />
              <span className="text-[11px] text-zinc-500">
                {sseConnected ? "Connected — Live" : "Disconnected"}
              </span>
            </div>
          </div>
        </div>

        {/* Toggles */}
        <div className="flex items-center gap-4">
          <button
            onClick={toggleMonitoring}
            className="flex items-center gap-2 text-xs font-medium text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            {monitoringEnabled
              ? <ToggleRight size={20} className="text-emerald-400" />
              : <ToggleLeft size={20} className="text-zinc-600" />
            }
            Monitoring
          </button>
          <button
            onClick={toggleDebug}
            className="flex items-center gap-2 text-xs font-medium text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            {debugMode
              ? <ToggleRight size={20} className="text-amber-400" />
              : <ToggleLeft size={20} className="text-zinc-600" />
            }
            <Bug size={12} />
            Debug
          </button>

          <div className="w-px h-5 bg-white/[0.08]" />

          <button
            onClick={exportLogs}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-zinc-400 hover:text-zinc-200 bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] transition-all"
          >
            <FileDown size={13} />
            Export
          </button>
          <button
            onClick={clearLogs}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-red-400 hover:text-red-300 bg-red-500/[0.05] hover:bg-red-500/[0.1] border border-red-500/[0.1] transition-all"
          >
            <Trash2 size={13} />
            Clear
          </button>
        </div>
      </div>

      {/* Stats strip */}
      <div className="flex items-center gap-2 flex-wrap">
        <StatPill icon={Cpu} label="Memory" value={`${stats.memoryUsage}MB`} color="text-blue-400" />
        <StatPill icon={Activity} label="Processes" value={stats.activeProcesses} color="text-emerald-400" />
        <StatPill icon={AlertTriangle} label="Errors" value={stats.errorCount} color={stats.errorCount > 0 ? "text-red-400" : "text-zinc-400"} />
        <StatPill icon={ScrollText} label="Logs" value={stats.totalLogs?.toLocaleString()} color="text-zinc-300" />
        <StatPill icon={Download} label="Downloads" value={stats.activeDownloads} color="text-purple-400" />
        <StatPill icon={Clock} label="Uptime" value={`${Math.floor((stats.uptime || 0) / 60)}m`} color="text-zinc-400" />
      </div>
    </motion.div>
  );
}
