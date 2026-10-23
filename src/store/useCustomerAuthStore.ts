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
  /** JWT de cliente que devuelve la API al iniciar sesión o registrarse. */
  token: string;
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
    {
      name: 'origenaxm-customer-auth',
      // v1: la sesión trae token. Las guardadas antes no lo tienen y no sirven para la API,
      // así que se descartan y el cliente vuelve a iniciar sesión una vez.
      version: 1,
      migrate: () => ({ customer: null, isAuthenticated: false }),
    }
  )
);
