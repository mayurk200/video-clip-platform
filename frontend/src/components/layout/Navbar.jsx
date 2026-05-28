import { Link } from "react-router-dom";
import { Menu, Bell, LogOut, User } from "lucide-react";
import useUIStore from "@/store/uiSlice";

/**
 * Top navigation bar with branding, notifications, and user menu.
 */
export default function Navbar() {
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);

  return (
    <nav className="fixed top-0 left-0 right-0 h-16 glass z-50 flex items-center justify-between px-6">
      {/* Left: hamburger + logo */}
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg hover:bg-white/5 transition-colors"
          aria-label="Toggle sidebar"
        >
          <Menu size={20} />
        </button>
        <Link to="/dashboard" className="flex items-center gap-2">
          <span className="text-xl font-bold gradient-text">ClipForge</span>
          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-[var(--color-primary-light)] text-[var(--color-primary)]">
            AI
          </span>
        </Link>
      </div>

      {/* Right: notifications + user */}
      <div className="flex items-center gap-3">
        <button className="p-2 rounded-lg hover:bg-white/5 transition-colors relative" aria-label="Notifications">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[var(--color-accent)]" />
        </button>

        <div className="flex items-center gap-3 ml-2 pl-4 border-l border-[var(--color-border)]">
          <div className="w-8 h-8 rounded-full bg-[var(--color-primary)] flex items-center justify-center text-sm font-semibold">
            <User size={14} />
          </div>
          <span className="text-sm text-[var(--color-text-secondary)] hidden sm:block">
            Local User
          </span>
        </div>
      </div>
    </nav>
  );
}
