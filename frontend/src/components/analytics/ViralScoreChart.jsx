import { motion } from "framer-motion";

/**
 * Viral score chart — horizontal bar chart showing individual dimension scores.
 */
export default function ViralScoreChart({ scores = {} }) {
  const dimensions = [
    { key: "emotion", label: "Emotion", color: "#EF4444" },
    { key: "curiosity", label: "Curiosity", color: "#F59E0B" },
    { key: "hook", label: "Hook Strength", color: "#6C3AED" },
    { key: "engagement", label: "Engagement", color: "#3B82F6" },
    { key: "storytelling", label: "Storytelling", color: "#06D6A0" },
    { key: "controversy", label: "Controversy", color: "#EC4899" },
  ];

  return (
    <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-xl p-5">
      <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-4">Viral Score Breakdown</h3>
      <div className="space-y-3">
        {dimensions.map(({ key, label, color }) => {
          const value = scores[key] || 0;
          return (
            <div key={key}>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-[var(--color-text-secondary)]">{label}</span>
                <span className="font-medium" style={{ color }}>{value}</span>
              </div>
              <div className="h-2 rounded-full bg-[var(--color-bg-elevated)] overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${value}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="h-full rounded-full"
                  style={{ backgroundColor: color }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
