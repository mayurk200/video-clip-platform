/**
 * Thumbnail editor — select from extracted frames or upload custom.
 */
export default function ThumbnailEditor({ frames = [], selected, onSelect }) {
  return (
    <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-xl p-5">
      <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-4">Thumbnail</h3>
      {frames.length === 0 ? (
        <p className="text-xs text-[var(--color-text-muted)]">Thumbnails will be generated after processing.</p>
      ) : (
        <div className="grid grid-cols-3 gap-2">
          {frames.map((frame, i) => (
            <button
              key={i}
              onClick={() => onSelect?.(frame)}
              className={`aspect-video rounded-lg overflow-hidden border-2 transition-all ${
                selected === frame
                  ? "border-[var(--color-primary)]"
                  : "border-transparent hover:border-[var(--color-border-hover)]"
              }`}
            >
              <img src={frame} alt={`Thumbnail ${i + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
