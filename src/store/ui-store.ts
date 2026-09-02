import { create } from "zustand";

type UiStore = {
  sidebarCollapsed: boolean;
  mobileSidebarOpen: boolean;
  toggleSidebar: () => void;
  toggleMobileSidebar: () => void;
  setMobileSidebarOpen: (value: boolean) => void;
  setSidebarCollapsed: (value: boolean) => void;
};

export const useUiStore = create<UiStore>((set) => ({
  sidebarCollapsed: false,
  mobileSidebarOpen: false,
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  toggleMobileSidebar: () => set((state) => ({ mobileSidebarOpen: !state.mobileSidebarOpen })),
  setMobileSidebarOpen: (value) => set({ mobileSidebarOpen: value }),
  setSidebarCollapsed: (value) => set({ sidebarCollapsed: value }),
}));
