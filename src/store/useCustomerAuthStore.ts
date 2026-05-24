import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CustomerSession {
  id: string;
  username: string;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
}

interface CustomerAuthState {
  customer: CustomerSession | null;
  isAuthenticated: boolean;
  login: (customer: CustomerSession) => void;
  logout: () => void;
}

export const useCustomerAuthStore = create<CustomerAuthState>()(
  persist(
    (set) => ({
      customer: null,
      isAuthenticated: false,
      login: (customer) => set({ customer, isAuthenticated: true }),
      logout: () => set({ customer: null, isAuthenticated: false }),
    }),
    { name: 'origenaxm-customer-auth' }
  )
);
