import { Search, Bell, Activity, Zap, ChevronDown, Scissors, Settings as SettingsIcon } from "lucide-react";
import { Link } from "react-router-dom";
import useVideoStore from "@/store/videoSlice";

export default function TopNav({ toggleSidebar }) {
  const { videos } = useVideoStore();
  const processingCount = videos.filter(v => v.status === "PROCESSING").length;

  return (
    <header className="h-16 border-b border-white/[0.08] bg-[#0A0A0A]/80 backdrop-blur-md sticky top-0 z-40 flex items-center px-4 sm:px-6 gap-4 sm:gap-8">
      
      {/* Logo */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.3)]">
          <Scissors size={18} className="text-white" />
        </div>
        <span className="text-lg font-bold tracking-tight text-white hidden sm:block">ClipForge<span className="text-blue-500">.ai</span></span>
      </div>

      {/* Spacer for mobile when search is hidden */}
      <div className="flex-1 sm:hidden"></div>

      {/* Right Actions */}
      <div className="flex items-center justify-end gap-3 sm:gap-6 ml-auto shrink-0">
        
        {/* Queue Status */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-md bg-white/[0.03] border border-white/[0.05]">
          <Activity size={14} className={processingCount > 0 ? "text-blue-400" : "text-zinc-500"} />
          <span className="text-xs font-medium text-zinc-300">
            {processingCount} <span className="text-zinc-500">in queue</span>
          </span>
        </div>

        {/* Credits */}
        <div className="hidden sm:flex items-center gap-2">
          <Zap size={16} className="text-yellow-500" />
          <span className="text-sm font-semibold text-zinc-200">1,450 <span className="text-zinc-500 font-normal hidden lg:inline">credits</span></span>
        </div>

        <div className="h-5 w-px bg-white/[0.1] hidden sm:block"></div>

        {/* Settings */}
        <Link to="/settings" className="text-zinc-400 hover:text-white transition-colors p-1">
          <SettingsIcon size={20} />
        </Link>

        {/* Notifications */}
        <button className="relative text-zinc-400 hover:text-white transition-colors p-1">
          <Bell size={20} />
          <span className="absolute top-0 right-0 w-2 h-2 bg-blue-500 rounded-full border border-[#0A0A0A]"></span>
        </button>

        {/* Profile */}
        <button className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-zinc-700 to-zinc-600 border border-white/[0.1] overflow-hidden">
            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix&backgroundColor=transparent" alt="User" className="w-full h-full object-cover" />
          </div>
          <ChevronDown size={14} className="text-zinc-500 group-hover:text-zinc-300 transition-colors hidden sm:block" />
        </button>
      </div>
    </header>
  );
}
