/**
 * Settings page — user preferences, API keys, processing config.
 */
export default function Settings() {
  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Settings</h1>
        <p className="text-sm text-[var(--color-text-secondary)] mt-1">Manage your account and processing preferences.</p>
      </div>

      {/* Profile */}
      <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-xl p-5 space-y-4">
        <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">Profile</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-[var(--color-text-muted)] mb-1">Name</label>
            <input type="text" placeholder="Your name" className="w-full px-4 py-2.5 rounded-lg bg-[var(--color-bg-input)] border border-[var(--color-border)] text-[var(--color-text-primary)] focus:border-[var(--color-border-active)] focus:outline-none" />
          </div>
          <div>
            <label className="block text-xs text-[var(--color-text-muted)] mb-1">Email</label>
            <input type="email" placeholder="you@example.com" className="w-full px-4 py-2.5 rounded-lg bg-[var(--color-bg-input)] border border-[var(--color-border)] text-[var(--color-text-primary)] focus:border-[var(--color-border-active)] focus:outline-none" />
          </div>
        </div>
      </div>

      {/* Processing */}
      <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-xl p-5 space-y-4">
        <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">Processing Defaults</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-[var(--color-text-muted)] mb-1">Default Caption Style</label>
            <select className="w-full px-4 py-2.5 rounded-lg bg-[var(--color-bg-input)] border border-[var(--color-border)] text-[var(--color-text-primary)] focus:border-[var(--color-border-active)] focus:outline-none">
              <option value="hormozi">Alex Hormozi</option>
              <option value="minimal">Minimal Clean</option>
              <option value="gaming">Gaming Neon</option>
              <option value="podcast">Podcast Style</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-[var(--color-text-muted)] mb-1">Max Clips per Video</label>
            <input type="number" defaultValue={10} min={1} max={50} className="w-full px-4 py-2.5 rounded-lg bg-[var(--color-bg-input)] border border-[var(--color-border)] text-[var(--color-text-primary)] focus:border-[var(--color-border-active)] focus:outline-none" />
          </div>
        </div>
      </div>

      <button className="px-6 py-2.5 rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white font-medium transition-colors">
        Save Changes
      </button>
    </div>
  );
}
