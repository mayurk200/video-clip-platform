import { Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";

// Layout
import MainLayout from "@/components/layout/MainLayout";

// Pages
import Home from "@/pages/Home";
import Upload from "@/pages/Upload";
import Clips from "@/pages/Clips";
import ClipDetail from "@/pages/ClipDetail";
import Analytics from "@/pages/Analytics";
import SettingsPage from "@/pages/Settings";
import Monitor from "@/pages/Monitor";
import NotFound from "@/pages/NotFound";

export default function App() {
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: "#171717",
            color: "#EDEDED",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "8px",
            fontSize: "13px",
            padding: "10px 14px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
          },
          success: { iconTheme: { primary: "#10B981", secondary: "#171717" } },
          error: { iconTheme: { primary: "#EF4444", secondary: "#171717" } },
        }}
      />

      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/clips" element={<Clips />} />
          <Route path="/clips/:id" element={<ClipDetail />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/monitor" element={<Monitor />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </>
  );
}
