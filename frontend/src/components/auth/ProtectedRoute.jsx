import { Navigate, Outlet } from "react-router-dom";
import useAuthStore from "@/store/authSlice";

/**
 * Route guard — redirects to /login if not authenticated.
 */
export default function ProtectedRoute() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
