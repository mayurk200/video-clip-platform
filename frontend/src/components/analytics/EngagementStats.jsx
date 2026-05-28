import { motion } from "framer-motion";
import { TrendingUp, Film, Scissors, Clock } from "lucide-react";

/**
 * Dashboard engagement stats cards.
 */
export default function EngagementStats({ stats = {} }) {
  const cards = [
    { label: "Total Videos", value: stats.totalVideos || 0, icon: Film, color: "var(--color-primary)" },
    { label: "Clips Generated", value: stats.totalClips || 0, icon: Scissors, color: "var(--color-accent)" },
    { label: "Avg Viral Score", value: stats.avgViralScore || 0, icon: TrendingUp, color: "#F59E0B" },
    { label: "Processing Time", value: `${stats.avgProcessingTime || 0}s`, icon: Clock, color: "var(--color-info)" },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map(({ label, value, icon: Icon, color }, i) => (
        <motion.div
          key={label}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-xl p-5"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider">{label}</p>
              <p className="text-2xl font-bold text-[var(--color-text-primary)] mt-1">{value}</p>
            </div>
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: `${color}20` }}
            >
              <Icon size={20} style={{ color }} />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
