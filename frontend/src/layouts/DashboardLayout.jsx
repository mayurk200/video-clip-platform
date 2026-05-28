import { Outlet } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import useUIStore from "@/store/uiSlice";

/**
 * Dashboard layout — top navbar + collapsible sidebar + content area.
 */
export default function DashboardLayout() {
  const sidebarOpen = useUIStore((s) => s.sidebarOpen);

  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)]">
      <Navbar />
      <div className="flex pt-16">
        <Sidebar />
        <main
          className="flex-1 transition-all duration-300 p-6"
          style={{ marginLeft: sidebarOpen ? "256px" : "72px" }}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}
