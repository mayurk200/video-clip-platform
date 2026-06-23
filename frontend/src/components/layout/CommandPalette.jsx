import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, LayoutDashboard, Upload, Film, BarChart3, Settings,
  ArrowRight, Command
} from "lucide-react";
import useUIStore from "@/store/uiSlice";

const ACTIONS = [
  { id: "dashboard", label: "Go to Dashboard", icon: LayoutDashboard, path: "/" },
  { id: "upload", label: "Upload Video", icon: Upload, path: "/upload" },
  { id: "clips", label: "View My Clips", icon: Film, path: "/clips" },
  { id: "analytics", label: "View Analytics", icon: BarChart3, path: "/analytics" },
  { id: "settings", label: "Open Settings", icon: Settings, path: "/settings" },
];

export default function CommandPalette() {
  const { commandPaletteOpen, closeCommandPalette } = useUIStore();
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  const filtered = query
    ? ACTIONS.filter((a) => a.label.toLowerCase().includes(query.toLowerCase()))
    : ACTIONS;

  useEffect(() => {
    if (commandPaletteOpen) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [commandPaletteOpen]);

  // Global keyboard shortcut
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        useUIStore.getState().toggleCommandPalette();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const runAction = useCallback((action) => {
    closeCommandPalette();
    navigate(action.path);
  }, [closeCommandPalette, navigate]);

  const handleKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((i) => (i + 1) % filtered.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((i) => (i - 1 + filtered.length) % filtered.length);
    } else if (e.key === "Enter" && filtered[selectedIndex]) {
      runAction(filtered[selectedIndex]);
    } else if (e.key === "Escape") {
      closeCommandPalette();
    }
  };

  return (
    <AnimatePresence>
      {commandPaletteOpen && (
        <motion.div
          className="command-palette-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          onClick={closeCommandPalette}
        >
          <motion.div
            className="w-full max-w-lg mx-4 bg-bg-elevated border border-border rounded-xl shadow-2xl overflow-hidden"
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.15 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Search Input */}
            <div className="flex items-center gap-3 px-4 border-b border-border">
              <Search size={16} className="text-text-muted shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => { setQuery(e.target.value); setSelectedIndex(0); }}
                onKeyDown={handleKeyDown}
                placeholder="Search commands..."
                className="flex-1 bg-transparent border-none outline-none text-sm text-text-primary h-12 placeholder:text-text-faint"
              />
              <kbd className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-white/[0.06] border border-border text-[10px] text-text-muted font-mono">
                ESC
              </kbd>
            </div>

            {/* Results */}
            <div className="py-2 px-2 max-h-[300px] overflow-y-auto">
              {filtered.length === 0 ? (
                <p className="text-sm text-text-muted text-center py-6">No results found</p>
              ) : (
                filtered.map((action, idx) => (
                  <button
                    key={action.id}
                    onClick={() => runAction(action)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                      idx === selectedIndex
                        ? "bg-white/[0.08] text-white"
                        : "text-text-secondary hover:bg-white/[0.04]"
                    }`}
                  >
                    <action.icon size={16} className={idx === selectedIndex ? "text-accent" : ""} />
                    <span className="flex-1 text-sm">{action.label}</span>
                    {idx === selectedIndex && <ArrowRight size={14} className="text-text-muted" />}
                  </button>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-2 border-t border-border flex items-center gap-4">
              <span className="text-[10px] text-text-faint flex items-center gap-1">
                <kbd className="px-1 py-0.5 rounded bg-white/[0.06] border border-border font-mono">↑↓</kbd> navigate
              </span>
              <span className="text-[10px] text-text-faint flex items-center gap-1">
                <kbd className="px-1 py-0.5 rounded bg-white/[0.06] border border-border font-mono">↵</kbd> select
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
