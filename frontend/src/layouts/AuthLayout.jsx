import { Outlet, Navigate } from "react-router-dom";
import { motion } from "framer-motion";

/**
 * Auth layout — centered card for Login / Register pages.
 */
export default function AuthLayout() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg-primary)] px-4">
      {/* Background gradient orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-purple-600/10 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        <Outlet />
      </motion.div>
    </div>
  );
}
