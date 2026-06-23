import { cn } from "@/lib/utils";

const CATEGORIES = [
  { key: "emotion", label: "Emotion", weight: 0.25 },
  { key: "curiosity", label: "Curiosity", weight: 0.20 },
  { key: "hook", label: "Hook", weight: 0.20 },
  { key: "engagement", label: "Engagement", weight: 0.15 },
  { key: "storytelling", label: "Story", weight: 0.10 },
  { key: "controversy", label: "Controversy", weight: 0.10 },
];

function getBarColor(score) {
  if (score >= 75) return "bg-success";
  if (score >= 50) return "bg-warning";
  return "bg-danger";
}

export default function ScoreBreakdown({ scores, className }) {
  if (!scores) return null;

  return (
    <div className={cn("space-y-3", className)}>
      <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wider">Score Breakdown</h4>
      {CATEGORIES.map(({ key, label, weight }) => {
        const score = scores[key] ?? 0;
        return (
          <div key={key} className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-text-secondary">{label}</span>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-text-faint">{(weight * 100)}%</span>
                <span className="text-xs font-semibold text-text-primary">{score}</span>
              </div>
            </div>
            <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
              <div
                className={cn("h-full rounded-full transition-all duration-500", getBarColor(score))}
                style={{ width: `${score}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
