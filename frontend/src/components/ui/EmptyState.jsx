import { cn } from "@/lib/utils";

export default function EmptyState({ icon: Icon, title, description, action, className }) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-16 px-6 text-center", className)}>
      {Icon && (
        <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-border flex items-center justify-center mb-5">
          <Icon size={28} className="text-text-faint" />
        </div>
      )}
      {title && <h3 className="text-lg font-semibold text-text-primary mb-2">{title}</h3>}
      {description && <p className="text-sm text-text-muted max-w-sm mb-6">{description}</p>}
      {action}
    </div>
  );
}
