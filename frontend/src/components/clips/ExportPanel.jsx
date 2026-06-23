import { PLATFORMS } from "@/constants/platforms";
import Button from "@/components/ui/Button";
import { Download, ExternalLink, Loader2 } from "lucide-react";
import { useState } from "react";
import clipService from "@/services/clipService";
import toast from "react-hot-toast";

export default function ExportPanel({ clipId }) {
  const [exporting, setExporting] = useState(null);

  const handleExport = async (platformId) => {
    setExporting(platformId);
    try {
      await clipService.export(clipId, platformId);
      toast.success(`Exported for ${PLATFORMS[platformId].name}!`);
    } catch (e) {
      toast.error("Export failed");
    }
    setExporting(null);
  };

  const handleDownload = async () => {
    setExporting("download");
    try {
      const blob = await clipService.download(clipId);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `clip-${clipId}.mp4`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Download started!");
    } catch (e) {
      toast.error("Download failed");
    }
    setExporting(null);
  };

  return (
    <div className="space-y-3">
      <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wider">Export For</h4>
      <div className="grid grid-cols-2 gap-2">
        {Object.values(PLATFORMS).map((p) => (
          <button
            key={p.id}
            onClick={() => handleExport(p.id)}
            disabled={!!exporting}
            className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-white/[0.03] border border-border hover:bg-white/[0.06] hover:border-border-hover transition-all text-left disabled:opacity-40"
          >
            <span className="text-lg">{p.icon}</span>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-text-primary truncate">{p.name}</p>
              <p className="text-[10px] text-text-faint">{p.aspectRatio} • {p.maxDuration}s max</p>
            </div>
            {exporting === p.id && <Loader2 size={14} className="animate-spin text-accent" />}
          </button>
        ))}
      </div>
      <Button
        variant="primary"
        icon={Download}
        loading={exporting === "download"}
        onClick={handleDownload}
        className="w-full mt-2"
      >
        Download Original
      </Button>
    </div>
  );
}
