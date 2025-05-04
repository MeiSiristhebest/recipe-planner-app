import { create } from "zustand"

type UIState = {
  isDarkMode: boolean
  isSidebarOpen: boolean
  setDarkMode: (isDarkMode: boolean) => void
  toggleDarkMode: () => void
  setSidebarOpen: (isOpen: boolean) => void
  toggleSidebar: () => void
}

export const useUIStore = create<UIState>((set) => ({
  isDarkMode: false,
  isSidebarOpen: false,
  setDarkMode: (isDarkMode) => set({ isDarkMode }),
  toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
  setSidebarOpen: (isSidebarOpen) => set({ isSidebarOpen }),
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
}))
