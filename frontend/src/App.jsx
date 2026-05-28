import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";

// Unified Single Page
import Dashboard from "@/pages/Dashboard";

export default function App() {
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "#1C1C28",
            color: "#F1F1F6",
            border: "1px solid rgba(255,255,255,0.08)",
          },
        }}
      />
      <div className="min-h-screen bg-[var(--color-bg-base)] text-[var(--color-text-primary)] font-sans antialiased">
        <main className="container mx-auto p-4 md:p-8 max-w-7xl">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </>
  );
}
