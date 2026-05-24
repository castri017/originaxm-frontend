import { create } from 'zustand';

interface CatalogStore {
  version: number;
  invalidate: () => void;
}

export const useCatalogStore = create<CatalogStore>((set) => ({
  version: 0,
  invalidate: () => set((s) => ({ version: s.version + 1 })),
}));
