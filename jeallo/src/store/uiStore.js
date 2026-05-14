import { create } from 'zustand';

export const useUiStore = create((set) => ({
  isSidebarOpen: true,
  isSidebarCollapsed: false,
  activeModal: null,
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  toggleCollapse: () => set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
  setSidebar: (isOpen) => set({ isSidebarOpen: isOpen }),
  openModal: (modalId) => set({ activeModal: modalId }),
  closeModal: () => set({ activeModal: null }),
}));
