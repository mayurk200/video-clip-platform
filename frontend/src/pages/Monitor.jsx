import { useEffect } from "react";
import MonitorHeader from "@/components/monitor/MonitorHeader";
import LiveLogViewer from "@/components/monitor/LiveLogViewer";
import ProcessMonitor from "@/components/monitor/ProcessMonitor";
import ErrorTracker from "@/components/monitor/ErrorTracker";
import DownloadManager from "@/components/monitor/DownloadManager";
import useMonitorStore from "@/store/monitorSlice";

export default function Monitor() {
  const { monitoringEnabled, connectSSE, disconnectSSE } = useMonitorStore();

  // Connect SSE on mount, disconnect on unmount
  useEffect(() => {
    if (monitoringEnabled) {
      connectSSE();
    }
    return () => disconnectSSE();
  }, [monitoringEnabled, connectSSE, disconnectSSE]);

  return (
    <div className="space-y-4 max-w-[1600px] mx-auto">
      {/* Header with stats and toggles */}
      <MonitorHeader />

      {monitoringEnabled ? (
        <>
          {/* Live Log Viewer */}
          <LiveLogViewer />

          {/* Download Manager */}
          <DownloadManager />

          {/* Bottom row: Process Monitor + Error Tracker */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ProcessMonitor />
            <ErrorTracker />
          </div>
        </>
      ) : (
        <div className="glass-panel-solid rounded-xl p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">📊</span>
          </div>
          <h2 className="text-lg font-semibold text-zinc-300 mb-2">Monitoring Disabled</h2>
          <p className="text-sm text-zinc-500 max-w-md mx-auto">
            Enable monitoring to see live logs, process status, download progress, and system metrics in real time.
          </p>
        </div>
      )}
    </div>
  );
}
