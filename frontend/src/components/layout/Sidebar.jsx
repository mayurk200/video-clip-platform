import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Upload,
  Scissors,
  BarChart3,
  Settings,
} from "lucide-react";
import useUIStore from "@/store/uiSlice";

const NAV_ITEMS = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/upload", icon: Upload, label: "Upload" },
  { to: "/analytics", icon: BarChart3, label: "Analytics" },
  { to: "/settings", icon: Settings, label: "Settings" },
];

/**
 * Collapsible sidebar navigation.
 */
export default function Sidebar() {
  const sidebarOpen = useUIStore((s) => s.sidebarOpen);

  return (
    <motion.aside
      animate={{ width: sidebarOpen ? 256 : 72 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="fixed top-16 left-0 bottom-0 bg-[var(--color-bg-secondary)] border-r border-[var(--color-border)] z-40 flex flex-col py-4 overflow-hidden"
    >
      <nav className="flex-1 flex flex-col gap-1 px-3">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200
              ${isActive
                ? "bg-[var(--color-primary-light)] text-[var(--color-primary)]"
                : "text-[var(--color-text-secondary)] hover:bg-white/5 hover:text-[var(--color-text-primary)]"
              }`
            }
          >
            <Icon size={20} className="flex-shrink-0" />
            {sidebarOpen && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm font-medium whitespace-nowrap"
              >
                {label}
              </motion.span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Version badge */}
      {sidebarOpen && (
        <div className="px-6 pb-2">
          <span className="text-xs text-[var(--color-text-muted)]">v1.0.0 — ClipForge AI</span>
        </div>
      )}
    </motion.aside>
  );
}
