import { cn } from "@/lib/utils";

export default function KPICard({ icon: Icon, label, value, subtitle, trend, className }) {
  return (
    <div className={cn(
      "glass-panel-solid rounded-xl p-5 flex flex-col gap-3 animate-fade-in",
      className
    )}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-text-muted uppercase tracking-wider">{label}</span>
        {Icon && (
          <div className="w-8 h-8 rounded-lg bg-white/[0.04] border border-border flex items-center justify-center">
            <Icon size={16} className="text-text-muted" />
          </div>
        )}
      </div>
      <div className="flex items-end gap-2">
        <span className="text-2xl font-bold text-text-primary tracking-tight">{value}</span>
        {trend && (
          <span className={cn(
            "text-xs font-medium mb-1",
            trend > 0 ? "text-success" : trend < 0 ? "text-danger" : "text-text-muted"
          )}>
            {trend > 0 ? "+" : ""}{trend}%
          </span>
        )}
      </div>
      {subtitle && <span className="text-xs text-text-faint">{subtitle}</span>}
    </div>
  );
}
