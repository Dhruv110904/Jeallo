import { create } from 'zustand';

export const useNotifStore = create((set) => ({
  unreadCount: 0,
  notifications: [],
  setNotifications: (notifications) => set({ 
    notifications,
    unreadCount: notifications.filter(n => !n.read_at).length
  }),
  add: (notification) => set((state) => ({
    notifications: [notification, ...state.notifications],
    unreadCount: state.unreadCount + 1
  })),
  markRead: (id) => set((state) => ({
    notifications: state.notifications.map(n => n.id === id ? { ...n, read_at: new Date() } : n),
    unreadCount: Math.max(0, state.unreadCount - 1)
  })),
  clearAll: () => set({ notifications: [], unreadCount: 0 })
}));
