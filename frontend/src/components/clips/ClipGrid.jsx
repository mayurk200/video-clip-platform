import { useState, useMemo } from "react";
import { Grid3X3, List, ArrowUpDown } from "lucide-react";
import ClipCard from "./ClipCard";
import { SkeletonClipCard } from "@/components/ui/Skeleton";
import EmptyState from "@/components/ui/EmptyState";
import Button from "@/components/ui/Button";
import { Film } from "lucide-react";
import { cn } from "@/lib/utils";

const SORT_OPTIONS = [
  { value: "score-desc", label: "Highest Score" },
  { value: "score-asc", label: "Lowest Score" },
  { value: "duration-desc", label: "Longest" },
  { value: "duration-asc", label: "Shortest" },
  { value: "date-desc", label: "Newest" },
];

export default function ClipGrid({ clips, isLoading, onDelete, emptyAction }) {
  const [sortBy, setSortBy] = useState("score-desc");

  const sortedClips = useMemo(() => {
    if (!clips) return [];
    const sorted = [...clips];
    switch (sortBy) {
      case "score-desc": return sorted.sort((a, b) => b.viralScore - a.viralScore);
      case "score-asc": return sorted.sort((a, b) => a.viralScore - b.viralScore);
      case "duration-desc": return sorted.sort((a, b) => b.duration - a.duration);
      case "duration-asc": return sorted.sort((a, b) => a.duration - b.duration);
      case "date-desc": return sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      default: return sorted;
    }
  }, [clips, sortBy]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {Array.from({ length: 10 }).map((_, i) => (
          <SkeletonClipCard key={i} />
        ))}
      </div>
    );
  }

  if (!clips || clips.length === 0) {
    return (
      <EmptyState
        icon={Film}
        title="No clips yet"
        description="Upload a video to start extracting viral clips automatically."
        action={emptyAction}
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Sort bar */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-text-muted">{clips.length} clip{clips.length !== 1 ? "s" : ""}</p>
        <div className="flex items-center gap-2">
          <ArrowUpDown size={14} className="text-text-muted" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="input text-xs h-8 w-auto bg-bg-card"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {sortedClips.map((clip) => (
          <ClipCard key={clip.id} clip={clip} onDelete={onDelete} />
        ))}
      </div>
    </div>
  );
}
