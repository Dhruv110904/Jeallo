import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      role: null,
      permissions: [],
      setAuth: (user, token) => set({
        user,
        token,
        role: user.roles?.[0] || null,
        permissions: user.permissions || [],
      }),
      logout: () => set({ 
        user: null, 
        token: null, 
        role: null, 
        permissions: [] 
      }),
    }),
    { name: 'jeallo-auth' }
  )
);
