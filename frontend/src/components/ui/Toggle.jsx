import { cn } from "@/lib/utils";

export default function Toggle({ checked, onChange, disabled = false, label, description, id }) {
  const toggleId = id || `toggle-${Math.random().toString(36).slice(2, 9)}`;

  return (
    <div className="flex items-center justify-between gap-4">
      {(label || description) && (
        <div className="flex-1 min-w-0">
          {label && <label htmlFor={toggleId} className="text-sm font-medium text-white cursor-pointer">{label}</label>}
          {description && <p className="text-xs text-text-muted mt-0.5">{description}</p>}
        </div>
      )}
      <label className={cn("toggle", disabled && "opacity-50 pointer-events-none")} htmlFor={toggleId}>
        <input
          type="checkbox"
          id={toggleId}
          checked={checked}
          onChange={(e) => onChange?.(e.target.checked)}
          disabled={disabled}
          role="switch"
          aria-checked={checked}
        />
        <span className="toggle-track" />
        <span className="toggle-thumb" />
      </label>
    </div>
  );
}
