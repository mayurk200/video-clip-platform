import { useState } from "react";
import { CAPTION_STYLES } from "@/constants/captionStyles";

/**
 * Caption editor — choose style, edit text, preview positioning.
 */
export default function CaptionEditor({ captions = [], style = "hormozi", onStyleChange, onCaptionEdit }) {
  const [activeStyle, setActiveStyle] = useState(style);

  const handleStyleSelect = (styleId) => {
    setActiveStyle(styleId);
    onStyleChange?.(styleId);
  };

  return (
    <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-xl p-5">
      <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-4">Caption Style</h3>

      {/* Style selector */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        {Object.values(CAPTION_STYLES).map((s) => (
          <button
            key={s.id}
            onClick={() => handleStyleSelect(s.id)}
            className={`p-3 rounded-lg border text-left transition-all ${
              activeStyle === s.id
                ? "border-[var(--color-primary)] bg-[var(--color-primary-light)]"
                : "border-[var(--color-border)] hover:border-[var(--color-border-hover)] bg-[var(--color-bg-elevated)]"
            }`}
          >
            <p className="text-sm font-medium text-[var(--color-text-primary)]">{s.name}</p>
            <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{s.description}</p>
          </button>
        ))}
      </div>

      {/* Caption list (editable) */}
      <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-3">Edit Captions</h3>
      <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
        {captions.length === 0 ? (
          <p className="text-xs text-[var(--color-text-muted)]">No captions available. Process the clip first.</p>
        ) : (
          captions.map((cap, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-xs text-[var(--color-text-muted)] w-16 flex-shrink-0">
                {cap.start?.toFixed(1)}s
              </span>
              <input
                type="text"
                value={cap.word}
                onChange={(e) => onCaptionEdit?.(i, e.target.value)}
                className="flex-1 px-3 py-1.5 rounded-md bg-[var(--color-bg-input)] border border-[var(--color-border)] text-sm text-[var(--color-text-primary)] focus:border-[var(--color-border-active)] focus:outline-none"
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
