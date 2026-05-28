import EngagementStats from "@/components/analytics/EngagementStats";
import ViralScoreChart from "@/components/analytics/ViralScoreChart";

/**
 * Analytics page — dashboard-level stats and score distributions.
 */
export default function Analytics() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Analytics</h1>
        <p className="text-sm text-[var(--color-text-secondary)] mt-1">Track your clip performance and viral scores.</p>
      </div>

      <EngagementStats stats={{}} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ViralScoreChart scores={{ emotion: 72, curiosity: 65, hook: 80, engagement: 58, storytelling: 45, controversy: 30 }} />
        <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-xl p-5">
          <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-4">Top Performing Clips</h3>
          <p className="text-xs text-[var(--color-text-muted)]">Clip performance data will appear here after processing.</p>
        </div>
      </div>
    </div>
  );
}
