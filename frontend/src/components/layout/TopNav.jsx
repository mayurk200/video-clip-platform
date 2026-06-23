import { useLocation } from "react-router-dom";
import { Search, Bell, Menu, Command } from "lucide-react";
import useUIStore from "@/store/uiSlice";
import { cn } from "@/lib/utils";

const PAGE_TITLES = {
  "/": "Dashboard",
  "/upload": "Upload",
  "/clips": "My Clips",
  "/analytics": "Analytics",
  "/settings": "Settings",
};

export default function TopNav() {
  const location = useLocation();
  const { openCommandPalette, openMobileMenu } = useUIStore();

  const pageTitle = PAGE_TITLES[location.pathname] ||
    (location.pathname.startsWith("/clips/") ? "Clip Detail" : "ClipForge");

  return (
    <header className="h-14 border-b border-border bg-bg-primary/80 backdrop-blur-md sticky top-0 z-30 flex items-center px-4 sm:px-6 gap-4">
      {/* Mobile menu button */}
      <button
        onClick={openMobileMenu}
        className="lg:hidden btn btn-ghost btn-icon btn-sm"
        aria-label="Open menu"
      >
        <Menu size={18} />
      </button>

      {/* Page Title */}
      <h1 className="text-sm font-semibold text-text-primary">{pageTitle}</h1>

      <div className="flex-1" />

      {/* Search Trigger */}
      <button
        onClick={openCommandPalette}
        className="hidden sm:flex items-center gap-3 h-8 px-3 rounded-lg bg-white/[0.03] border border-border hover:bg-white/[0.06] hover:border-border-hover transition-all cursor-pointer"
      >
        <Search size={14} className="text-text-muted" />
        <span className="text-xs text-text-faint">Search...</span>
        <kbd className="hidden md:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-white/[0.06] border border-border text-[10px] text-text-muted font-mono">
          <Command size={10} />K
        </kbd>
      </button>

      {/* Mobile search */}
      <button
        onClick={openCommandPalette}
        className="sm:hidden btn btn-ghost btn-icon btn-sm"
        aria-label="Search"
      >
        <Search size={18} />
      </button>

      {/* Notifications */}
      <button className="relative btn btn-ghost btn-icon btn-sm" aria-label="Notifications">
        <Bell size={18} />
        <span className="absolute top-1 right-1 w-2 h-2 bg-accent rounded-full border-2 border-bg-primary" />
      </button>

      {/* Profile */}
      <button className="w-8 h-8 rounded-full bg-gradient-to-tr from-zinc-700 to-zinc-600 border border-border overflow-hidden hover:border-border-hover transition-colors shrink-0">
        <img
          src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix&backgroundColor=transparent"
          alt="User"
          className="w-full h-full object-cover"
        />
      </button>
    </header>
  );
}
