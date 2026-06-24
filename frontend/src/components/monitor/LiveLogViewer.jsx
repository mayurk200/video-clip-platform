import { useEffect, useRef, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Search, Pause, Play, ChevronDown, ArrowDownToLine } from "lucide-react";
import useMonitorStore from "@/store/monitorSlice";
import { cn } from "@/lib/utils";

const LEVEL_STYLES = {
  info: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  success: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  warn: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  error: "bg-red-500/20 text-red-400 border-red-500/30",
  debug: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30",
};

const LEVEL_LABELS = ["info", "success", "warn", "error", "debug"];

function LogRow({ log }) {
  const time = log.timestamp?.split(" ")[1] || log.timestamp?.split("T")[1]?.slice(0, 12) || "";

  return (
    <div className="flex items-start gap-3 px-3 py-1.5 hover:bg-white/[0.02] font-mono text-[12px] leading-5 border-b border-white/[0.03] last:border-0">
      <span className="text-zinc-600 shrink-0 w-[85px] tabular-nums">{time}</span>
      <span className={cn("shrink-0 w-[68px] px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase text-center border", LEVEL_STYLES[log.level] || LEVEL_STYLES.info)}>
        {log.level}
      </span>
      <span className="text-purple-400 shrink-0 w-[130px] truncate">{log.module}</span>
      <span className="text-zinc-500 shrink-0 w-[120px] truncate">{log.process || "—"}</span>
      <span className="text-zinc-300 flex-1 break-words">{log.message}</span>
    </div>
  );
}

export default function LiveLogViewer() {
  const {
    logFilters, paused, debugMode,
    setLogFilter, toggleLevelFilter, togglePause, getFilteredLogs, getModules,
  } = useMonitorStore();

  const scrollRef = useRef(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const [moduleDropdownOpen, setModuleDropdownOpen] = useState(false);

  const filteredLogs = useMemo(() => getFilteredLogs(), [useMonitorStore.getState().logs, logFilters, debugMode]);
  const modules = useMemo(() => getModules(), [useMonitorStore.getState().logs]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [filteredLogs.length, autoScroll]);

  // Detect manual scroll
  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    setAutoScroll(scrollHeight - scrollTop - clientHeight < 50);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel-solid rounded-xl flex flex-col overflow-hidden"
      style={{ height: "calc(55vh - 120px)", minHeight: "300px" }}
    >
      {/* Toolbar */}
      <div className="flex items-center gap-2 p-3 border-b border-white/[0.06] flex-wrap">
        {/* Search */}
        <div className="relative flex-1 min-w-[180px]">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            placeholder="Search logs..."
            value={logFilters.search}
            onChange={(e) => setLogFilter("search", e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-md bg-white/[0.03] border border-white/[0.06] text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500 transition-colors font-mono"
          />
        </div>

        {/* Level pills */}
        <div className="flex items-center gap-1">
          {LEVEL_LABELS.map((level) => (
            <button
              key={level}
              onClick={() => toggleLevelFilter(level)}
              className={cn(
                "px-2 py-1 rounded text-[10px] font-semibold uppercase border transition-all",
                logFilters.levels.includes(level)
                  ? LEVEL_STYLES[level]
                  : "bg-white/[0.02] text-zinc-600 border-white/[0.04] opacity-50"
              )}
            >
              {level}
            </button>
          ))}
        </div>

        {/* Module dropdown */}
        <div className="relative">
          <button
            onClick={() => setModuleDropdownOpen(!moduleDropdownOpen)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-white/[0.03] border border-white/[0.06] text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            {logFilters.module || "All Modules"}
            <ChevronDown size={12} />
          </button>
          {moduleDropdownOpen && (
            <div className="absolute top-full mt-1 right-0 bg-[#1a1a1a] border border-white/[0.08] rounded-lg shadow-2xl z-50 min-w-[160px] py-1 max-h-[200px] overflow-y-auto">
              <button
                onClick={() => { setLogFilter("module", ""); setModuleDropdownOpen(false); }}
                className="w-full text-left px-3 py-1.5 text-xs text-zinc-300 hover:bg-white/[0.05] transition-colors"
              >
                All Modules
              </button>
              {modules.map((m) => (
                <button
                  key={m}
                  onClick={() => { setLogFilter("module", m); setModuleDropdownOpen(false); }}
                  className={cn(
                    "w-full text-left px-3 py-1.5 text-xs hover:bg-white/[0.05] transition-colors",
                    logFilters.module === m ? "text-blue-400" : "text-zinc-400"
                  )}
                >
                  {m}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Pause / Auto-scroll */}
        <button
          onClick={togglePause}
          className={cn(
            "flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium border transition-all",
            paused
              ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
              : "bg-white/[0.03] text-zinc-400 border-white/[0.06] hover:text-zinc-200"
          )}
        >
          {paused ? <Play size={12} /> : <Pause size={12} />}
          {paused ? "Resume" : "Pause"}
        </button>
        {autoScroll && (
          <div className="flex items-center gap-1 text-[10px] text-emerald-500">
            <ArrowDownToLine size={10} />
            Auto-scroll
          </div>
        )}
      </div>

      {/* Column headers */}
      <div className="flex items-center gap-3 px-3 py-1.5 bg-white/[0.02] border-b border-white/[0.06] font-mono text-[10px] text-zinc-600 uppercase tracking-wider">
        <span className="w-[85px]">Time</span>
        <span className="w-[68px] text-center">Level</span>
        <span className="w-[130px]">Module</span>
        <span className="w-[120px]">Process</span>
        <span className="flex-1">Message</span>
      </div>

      {/* Log entries */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar"
      >
        {filteredLogs.length === 0 ? (
          <div className="flex items-center justify-center h-full text-zinc-600 text-sm">
            {paused ? "Updates paused" : "Waiting for logs..."}
          </div>
        ) : (
          filteredLogs.map((log) => <LogRow key={log.id} log={log} />)
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-3 py-1.5 border-t border-white/[0.06] text-[10px] text-zinc-600">
        <span>{filteredLogs.length.toLocaleString()} entries shown</span>
        <span className="tabular-nums">{paused ? "⏸ Paused" : "● Live"}</span>
      </div>
    </motion.div>
  );
}
