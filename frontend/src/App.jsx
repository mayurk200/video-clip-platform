import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Dashboard from "@/pages/Dashboard";

export default function App() {
  return (
    <>
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: "#12121E",
            color: "#F0F0F8",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: "12px",
            fontSize: "14px",
            padding: "12px 16px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
          },
          success: { iconTheme: { primary: "#10B981", secondary: "#12121E" } },
          error: { iconTheme: { primary: "#EF4444", secondary: "#12121E" } },
        }}
      />
      <div className="min-h-screen bg-[var(--color-bg-base)] text-[var(--color-text-primary)] font-sans antialiased">
        <main className="mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </>
  );
}
