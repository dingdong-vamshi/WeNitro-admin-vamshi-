import { create } from "zustand";

type UiStore = {
  sidebarCollapsed: boolean;
  sidebarScrollTop: number;
  sidebarExpandedSections: Record<string, boolean>;
  mobileSidebarOpen: boolean;
  toggleSidebar: () => void;
  toggleMobileSidebar: () => void;
  setMobileSidebarOpen: (value: boolean) => void;
  setSidebarCollapsed: (value: boolean) => void;
  setSidebarScrollTop: (value: number) => void;
  setSidebarSectionExpanded: (title: string, value: boolean) => void;
};

export const useUiStore = create<UiStore>((set) => ({
  sidebarCollapsed: false,
  sidebarScrollTop: 0,
  sidebarExpandedSections: {},
  mobileSidebarOpen: false,
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  toggleMobileSidebar: () => set((state) => ({ mobileSidebarOpen: !state.mobileSidebarOpen })),
  setMobileSidebarOpen: (value) => set({ mobileSidebarOpen: value }),
  setSidebarCollapsed: (value) => set({ sidebarCollapsed: value }),
  setSidebarScrollTop: (value) => set({ sidebarScrollTop: value }),
  setSidebarSectionExpanded: (title, value) => set((state) => ({ sidebarExpandedSections: { ...state.sidebarExpandedSections, [title]: value } })),
}));
