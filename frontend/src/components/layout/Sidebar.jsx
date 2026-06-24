import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Upload, Film, BarChart3, Settings,
  ChevronsLeft, ChevronsRight, Activity, Zap, Scissors, Terminal
} from "lucide-react";
import useUIStore from "@/store/uiSlice";
import useVideoStore from "@/store/videoSlice";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/upload", icon: Upload, label: "Upload" },
  { to: "/clips", icon: Film, label: "My Clips" },
  { to: "/analytics", icon: BarChart3, label: "Analytics" },
  { to: "/monitor", icon: Terminal, label: "Monitor" },
  { to: "/settings", icon: Settings, label: "Settings" },
];

export default function Sidebar() {
  const { sidebarCollapsed, toggleSidebar, closeMobileMenu } = useUIStore();
  const { videos } = useVideoStore();
  const location = useLocation();
  const processingCount = videos.filter((v) => v.status === "PROCESSING").length;

  return (
    <aside
      className={cn(
        "sidebar h-full bg-bg-primary border-r border-border flex flex-col shrink-0 relative z-30",
        sidebarCollapsed ? "collapsed" : ""
      )}
    >
      {/* Logo */}
      <div className="h-14 flex items-center gap-2.5 px-4 border-b border-border shrink-0">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-glow-sm shrink-0">
          <Scissors size={16} className="text-white" />
        </div>
        {!sidebarCollapsed && (
          <span className="text-sm font-bold tracking-tight text-white whitespace-nowrap">
            ClipForge<span className="text-accent">.ai</span>
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3 px-3 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => {
          const isActive = to === "/" ? location.pathname === "/" : location.pathname.startsWith(to);
          return (
            <NavLink
              key={to}
              to={to}
              onClick={closeMobileMenu}
              className={cn("sidebar-nav-item", isActive && "active")}
              title={sidebarCollapsed ? label : undefined}
            >
              <Icon size={18} className={cn("sidebar-icon shrink-0", isActive && "text-accent")} />
              {!sidebarCollapsed && <span>{label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="p-3 border-t border-border space-y-2">
        {/* Processing Widget */}
        {!sidebarCollapsed ? (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.02] border border-border">
            <Activity
              size={14}
              className={cn(processingCount > 0 ? "text-accent animate-pulse" : "text-text-faint")}
            />
            <span className="text-xs text-text-secondary">
              {processingCount > 0
                ? `${processingCount} processing`
                : "Queue empty"}
            </span>
          </div>
        ) : (
          <div className="flex justify-center py-2" title={`${processingCount} in queue`}>
            <Activity
              size={16}
              className={cn(processingCount > 0 ? "text-accent animate-pulse" : "text-text-faint")}
            />
          </div>
        )}

        {/* Collapse Button */}
        <button
          onClick={toggleSidebar}
          className="sidebar-nav-item w-full justify-center"
          aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {sidebarCollapsed ? <ChevronsRight size={16} /> : <ChevronsLeft size={16} />}
          {!sidebarCollapsed && <span>Collapse</span>}
        </button>
      </div>
    </aside>
  );
}
