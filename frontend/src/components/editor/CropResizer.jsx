/**
 * Crop/resize controls for reframing — aspect ratio selector.
 */
export default function CropResizer({ aspectRatio = "9:16", onAspectChange }) {
  const ratios = [
    { id: "9:16", label: "9:16", desc: "Vertical" },
    { id: "1:1", label: "1:1", desc: "Square" },
    { id: "4:5", label: "4:5", desc: "Portrait" },
    { id: "16:9", label: "16:9", desc: "Landscape" },
  ];

  return (
    <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-xl p-5">
      <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-4">Aspect Ratio</h3>
      <div className="grid grid-cols-4 gap-2">
        {ratios.map((r) => (
          <button
            key={r.id}
            onClick={() => onAspectChange?.(r.id)}
            className={`flex flex-col items-center gap-1 p-3 rounded-lg border transition-all ${
              aspectRatio === r.id
                ? "border-[var(--color-primary)] bg-[var(--color-primary-light)]"
                : "border-[var(--color-border)] hover:border-[var(--color-border-hover)]"
            }`}
          >
            <span className="text-sm font-medium text-[var(--color-text-primary)]">{r.label}</span>
            <span className="text-xs text-[var(--color-text-muted)]">{r.desc}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
