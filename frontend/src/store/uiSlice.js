import { create } from "zustand";

const useUIStore = create((set, get) => ({
  sidebarCollapsed: localStorage.getItem("cf_sidebar") === "collapsed",
  commandPaletteOpen: false,
  mobileMenuOpen: false,

  toggleSidebar: () => {
    const next = !get().sidebarCollapsed;
    localStorage.setItem("cf_sidebar", next ? "collapsed" : "expanded");
    set({ sidebarCollapsed: next });
  },

  setSidebarCollapsed: (v) => {
    localStorage.setItem("cf_sidebar", v ? "collapsed" : "expanded");
    set({ sidebarCollapsed: v });
  },

  openCommandPalette: () => set({ commandPaletteOpen: true }),
  closeCommandPalette: () => set({ commandPaletteOpen: false }),
  toggleCommandPalette: () => set((s) => ({ commandPaletteOpen: !s.commandPaletteOpen })),

  openMobileMenu: () => set({ mobileMenuOpen: true }),
  closeMobileMenu: () => set({ mobileMenuOpen: false }),
}));

export default useUIStore;
