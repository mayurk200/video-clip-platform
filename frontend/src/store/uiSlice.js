import { create } from "zustand";

/**
 * UI store — sidebar state, modals, theme, global UI flags.
 */
const useUIStore = create((set) => ({
  sidebarOpen: true,
  activeModal: null, // "export" | "settings" | null
  theme: "dark",

  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  openModal: (name) => set({ activeModal: name }),
  closeModal: () => set({ activeModal: null }),
  setTheme: (theme) => set({ theme }),
}));

export default useUIStore;
