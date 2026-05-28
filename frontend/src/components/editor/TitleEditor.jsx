import { useState } from "react";

/**
 * Title and hook editor for a clip.
 */
export default function TitleEditor({ title = "", hook = "", onTitleChange, onHookChange }) {
  return (
    <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-xl p-5 space-y-4">
      <div>
        <label className="block text-sm font-semibold text-[var(--color-text-primary)] mb-2">Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => onTitleChange?.(e.target.value)}
          placeholder="Enter clip title…"
          className="w-full px-4 py-2.5 rounded-lg bg-[var(--color-bg-input)] border border-[var(--color-border)] text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:border-[var(--color-border-active)] focus:outline-none"
        />
      </div>
      <div>
        <label className="block text-sm font-semibold text-[var(--color-text-primary)] mb-2">Hook</label>
        <textarea
          value={hook}
          onChange={(e) => onHookChange?.(e.target.value)}
          placeholder="Opening hook text…"
          rows={3}
          className="w-full px-4 py-2.5 rounded-lg bg-[var(--color-bg-input)] border border-[var(--color-border)] text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:border-[var(--color-border-active)] focus:outline-none resize-none"
        />
      </div>
    </div>
  );
}
