import { Outlet } from "react-router-dom";
import TopNav from "./TopNav";

export default function MainLayout() {
  return (
    <div className="h-screen bg-[#000000] text-zinc-200 flex flex-col overflow-hidden relative w-full">
      <TopNav toggleSidebar={() => {}} />
      <main className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar relative">
        <div className="w-full min-h-full p-4 sm:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
