import { useEffect } from "react";
import useAuthStore from "@/store/authSlice";

/**
 * Hook to access auth state and actions.
 * Auto-fetches profile on mount if token exists.
 */
export default function useAuth() {
  const store = useAuthStore();

  useEffect(() => {
    if (store.token && !store.user) {
      store.fetchProfile();
    }
  }, [store.token]);

  return store;
}
