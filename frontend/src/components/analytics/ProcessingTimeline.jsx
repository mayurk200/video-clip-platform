import { CheckCircle, Loader, AlertCircle, Clock, Zap, Timer, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

const STEPS = [
  { key: "transcription", label: "Transcription", description: "Converting speech to text using Groq Whisper API", eta: "~30s" },
  { key: "analysis",      label: "AI Analysis",    description: "Detecting viral moments & scoring engagement",   eta: "~5s" },
  { key: "clipping",      label: "Clip Generation", description: "Creating clip records in database",              eta: "~2s" },
  { key: "rendering",     label: "Cut & Reframe",   description: "Cutting clips, vertical reframe, thumbnails & captions", eta: "~15s" },
];

function ElapsedTimer({ startedAt }) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!startedAt) return;
    const start = new Date(startedAt).getTime();
    const tick = () => setElapsed(Math.floor((Date.now() - start) / 1000));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [startedAt]);

  if (!startedAt) return null;
  const m = Math.floor(elapsed / 60);
  const s = elapsed % 60;
  return (
    <span className="tabular-nums text-xs text-[var(--color-text-muted)] font-mono">
      {m > 0 ? `${m}m ${s}s` : `${s}s`}
    </span>
  );
}

function CompletedDuration({ startedAt, completedAt }) {
  if (!startedAt || !completedAt) return null;
  const ms = new Date(completedAt).getTime() - new Date(startedAt).getTime();
  const s = Math.round(ms / 1000);
  return (
    <span className="text-xs text-[var(--color-success)] font-mono tabular-nums">
      {s}s
    </span>
  );
}

/**
 * Processing pipeline timeline showing detailed step-by-step status,
 * expected time, elapsed time, errors, and overall progress.
 */
export default function ProcessingTimeline({ status = {}, videoStatus, errorMessage, canRetry, onRetry }) {
  // status can be:
  //   { stepKey: "completed" | "processing" | "failed" | "pending" }
  // OR richer format from enhanced endpoint:
  //   { stepKey: { status, startedAt, completedAt, error } }

  const getStepData = (key) => {
    const raw = status[key];
    if (!raw) return { status: "pending" };
    if (typeof raw === "string") return { status: raw };
    return raw;
  };

  // Calculate overall progress
  const totalSteps = STEPS.length;
  const completedSteps = STEPS.filter(s => {
    const d = getStepData(s.key);
    return d.status === "completed";
  }).length;
  const activeStep = STEPS.find(s => {
    const d = getStepData(s.key);
    return d.status === "processing" || d.status === "active" || d.status === "running";
  });
  const failedStep = STEPS.find(s => {
    const d = getStepData(s.key);
    return d.status === "failed";
  });

  const overallPct = Math.round((completedSteps / totalSteps) * 100);
  const isActive = !!activeStep;
  const isFailed = !!failedStep || videoStatus?.toUpperCase() === "FAILED";

  const getIcon = (stepStatus) => {
    switch (stepStatus) {
      case "completed": return <CheckCircle size={18} className="text-[var(--color-success)]" />;
      case "processing":
      case "active":
      case "running": return <Loader size={18} className="text-[var(--color-primary)] animate-spin" />;
      case "failed": return <AlertCircle size={18} className="text-[var(--color-danger)]" />;
      default: return <Clock size={18} className="text-[var(--color-text-muted)] opacity-40" />;
    }
  };

  const getStatusLabel = (stepStatus) => {
    switch (stepStatus) {
      case "completed": return "Done";
      case "processing":
      case "active":
      case "running": return "Running";
      case "failed": return "Failed";
      default: return "Waiting";
    }
  };

  return (
    <div className="bg-transparent border border-white/[0.05] rounded-xl p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
            isFailed ? "bg-red-500/15" : isActive ? "bg-[var(--color-primary-light)]" : "bg-[var(--color-success)]/15"
          }`}>
            {isFailed ? <AlertTriangle size={14} className="text-red-400" /> :
             isActive ? <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)] animate-pulse" /> :
             <CheckCircle size={14} className="text-emerald-400" />}
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
              {isFailed ? "Processing Failed" : isActive ? "Processing Pipeline" : "Processing Complete"}
            </h3>
            <p className="text-xs text-[var(--color-text-muted)]">
              {isFailed ? "An error occurred during processing" :
               isActive ? `Step ${completedSteps + 1} of ${totalSteps} — ${activeStep?.label}` :
               `All ${totalSteps} steps completed successfully`}
            </p>
          </div>
        </div>
        <div className="text-right">
          <span className={`text-lg font-bold tabular-nums ${
            isFailed ? "text-red-400" : isActive ? "text-[var(--color-primary)]" : "text-[var(--color-success)]"
          }`}>
            {overallPct}%
          </span>
        </div>
      </div>

      {/* Overall progress bar */}
      <div className="h-2 rounded-full bg-[var(--color-bg-elevated)] overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${overallPct}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className={`h-full rounded-full ${
            isFailed
              ? "bg-red-500"
              : "bg-zinc-200"
          }`}
        />
      </div>

      {/* Steps */}
      <div className="space-y-1">
        {STEPS.map(({ key, label, description, eta }, i) => {
          const stepData = getStepData(key);
          const stepStatus = stepData.status || "pending";
          const isRunning = stepStatus === "processing" || stepStatus === "active" || stepStatus === "running";
          const isCompleted = stepStatus === "completed";
          const isFailed = stepStatus === "failed";

          return (
            <motion.div
              key={key}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
            >
              <div
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                  isRunning ? "bg-[var(--color-primary-light)] border border-[var(--color-primary)]/20" :
                  isFailed ? "bg-red-500/8 border border-red-500/15" :
                  "hover:bg-white/[0.02]"
                }`}
              >
                {/* Icon */}
                <div className="flex-shrink-0">{getIcon(stepStatus)}</div>

                {/* Label + Description */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-medium ${
                      isCompleted ? "text-[var(--color-text-primary)]" :
                      isRunning ? "text-[var(--color-primary)]" :
                      isFailed ? "text-red-400" :
                      "text-[var(--color-text-muted)]"
                    }`}>
                      {label}
                    </span>
                    <span className={`text-[10px] uppercase tracking-widest font-semibold px-1.5 py-0.5 rounded ${
                      isCompleted ? "bg-[var(--color-success)]/15 text-[var(--color-success)]" :
                      isRunning ? "bg-[var(--color-primary-light)] text-[var(--color-primary)]" :
                      isFailed ? "bg-red-500/15 text-red-400" :
                      "bg-white/5 text-[var(--color-text-muted)]"
                    }`}>
                      {getStatusLabel(stepStatus)}
                    </span>
                  </div>
                  <p className={`text-xs mt-0.5 ${
                    isRunning ? "text-[var(--color-text-secondary)]" : "text-[var(--color-text-muted)]"
                  }`}>
                    {description}
                  </p>
                </div>

                {/* Time info */}
                <div className="flex-shrink-0 flex items-center gap-2 text-right">
                  {isRunning && <ElapsedTimer startedAt={stepData.startedAt} />}
                  {isCompleted && <CompletedDuration startedAt={stepData.startedAt} completedAt={stepData.completedAt} />}
                  {!isRunning && !isCompleted && !isFailed && (
                    <span className="text-xs text-[var(--color-text-muted)] opacity-50 flex items-center gap-1">
                      <Timer size={10} />{eta}
                    </span>
                  )}
                </div>
              </div>

              {/* Error message for failed steps */}
              <AnimatePresence>
                {isFailed && stepData.error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="ml-10 mt-1 mb-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20"
                  >
                    <p className="text-xs text-red-300 font-mono break-all leading-relaxed">{stepData.error}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* Global error message (from video status) */}
      {errorMessage && (
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20">
          <div className="flex items-start gap-2 flex-1">
            <AlertCircle size={14} className="text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-red-300">Error Details</p>
              <p className="text-xs text-red-300/80 font-mono mt-1 break-all leading-relaxed">{errorMessage}</p>
            </div>
          </div>
          {isFailed && canRetry && onRetry && (
            <button 
              onClick={onRetry}
              className="flex items-center justify-center gap-1.5 px-4 py-1.5 whitespace-nowrap rounded-md bg-red-500/20 hover:bg-red-500/30 text-red-200 text-xs font-semibold transition-colors border border-red-500/30 shadow-sm"
            >
              <AlertCircle size={12} /> Retry Processing
            </button>
          )}
        </div>
      )}

      {/* Estimated total time */}
      {isActive && (
        <div className="flex items-center justify-center gap-2 pt-2 border-t border-[var(--color-border)]">
          <Zap size={12} className="text-[var(--color-primary)]" />
          <span className="text-xs text-[var(--color-text-muted)]">
            Estimated total: <span className="text-[var(--color-text-secondary)] font-medium">~1–2 min</span> (API-accelerated)
          </span>
        </div>
      )}
    </div>
  );
}
