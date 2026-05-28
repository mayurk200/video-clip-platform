import { create } from "zustand";
import authService from "@/services/authService";

/**
 * Auth store — manages JWT token, user profile, login/register state.
 */
const useAuthStore = create((set, get) => ({
  user: null,
  token: localStorage.getItem("clipforge_token") || null,
  isAuthenticated: !!localStorage.getItem("clipforge_token"),
  isLoading: false,
  error: null,

  /** Login and persist token */
  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const { token, user } = await authService.login(email, password);
      localStorage.setItem("clipforge_token", token);
      set({ token, user, isAuthenticated: true, isLoading: false });
      return true;
    } catch (err) {
      set({ error: err.response?.data?.message || "Login failed", isLoading: false });
      return false;
    }
  },

  /** Register new user */
  register: async (name, email, password) => {
    set({ isLoading: true, error: null });
    try {
      const { token, user } = await authService.register(name, email, password);
      localStorage.setItem("clipforge_token", token);
      set({ token, user, isAuthenticated: true, isLoading: false });
      return true;
    } catch (err) {
      set({ error: err.response?.data?.message || "Registration failed", isLoading: false });
      return false;
    }
  },

  /** Fetch current user profile */
  fetchProfile: async () => {
    if (!get().token) return;
    try {
      const { user } = await authService.getProfile();
      set({ user, isAuthenticated: true });
    } catch {
      get().logout();
    }
  },

  /** Logout */
  logout: () => {
    localStorage.removeItem("clipforge_token");
    set({ user: null, token: null, isAuthenticated: false });
  },

  clearError: () => set({ error: null }),
}));

export default useAuthStore;
