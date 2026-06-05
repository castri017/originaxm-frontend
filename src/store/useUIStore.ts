import { create } from 'zustand';

interface UIStore {
  searchOpen: boolean;
  openSearch: () => void;
  closeSearch: () => void;
}

export const useUIStore = create<UIStore>((set) => ({
  searchOpen: false,
  openSearch:  () => set({ searchOpen: true }),
  closeSearch: () => set({ searchOpen: false }),
}));
