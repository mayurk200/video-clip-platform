import { motion } from "framer-motion";
import { getScoreColor } from "@/lib/utils";

/**
 * Animated circular viral score badge.
 */
export default function ViralScoreBadge({ score, size = 56 }) {
  const color = getScoreColor(score);
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        {/* Background ring */}
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--color-bg-elevated)" strokeWidth={4} />
        {/* Score arc */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={4}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />
      </svg>
      <span
        className="absolute text-xs font-bold"
        style={{ color }}
      >
        {score}
      </span>
    </div>
  );
}
