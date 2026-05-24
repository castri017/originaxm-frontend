import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AdminAuthState {
  token: string | null;
  email: string | null;
  fullName: string | null;
  role: string | null;
  isAuthenticated: boolean;
  login: (token: string, email: string, fullName: string, role: string) => void;
  logout: () => void;
}

export const useAdminAuthStore = create<AdminAuthState>()(
  persist(
    (set) => ({
      token: null,
      email: null,
      fullName: null,
      role: null,
      isAuthenticated: false,
      login: (token, email, fullName, role) =>
        set({ token, email, fullName, role, isAuthenticated: true }),
      logout: () =>
        set({ token: null, email: null, fullName: null, role: null, isAuthenticated: false }),
    }),
    { name: 'origenaxm-admin-auth' }
  )
);
