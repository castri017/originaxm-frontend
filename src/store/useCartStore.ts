import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Product } from '../data/products';

export interface CartItem {
  product: Product;
  quantity: number;
  size: string;
}

interface CartState {
  items: CartItem[];
  addItem: (product: Product, quantity: number, size: string) => void;
  removeItem: (productId: string, size: string) => void;
  updateQuantity: (productId: string, size: string, quantity: number) => void;
  clearCart: () => void;
  getTotals: () => { subtotal: number; itemsCount: number };
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product, quantity, size) => {
        set((state) => {
          const existingItemIndex = state.items.findIndex(
            (item) => item.product.id === product.id && item.size === size
          );

          if (existingItemIndex >= 0) {
            const newItems = [...state.items];
            newItems[existingItemIndex].quantity += quantity;
            return { items: newItems };
          }
          return { items: [...state.items, { product, quantity, size }] };
        });
      },
      removeItem: (productId, size) => {
        set((state) => ({
          items: state.items.filter(
            (item) => !(item.product.id === productId && item.size === size)
          )
        }));
      },
      updateQuantity: (productId, size, quantity) => {
        set((state) => ({
          items: state.items.map((item) => 
            item.product.id === productId && item.size === size 
              ? { ...item, quantity: Math.max(1, quantity) } 
              : item
          )
        }));
      },
      clearCart: () => set({ items: [] }),
      getTotals: () => {
        const { items } = get();
        return items.reduce(
          (totals, item) => ({
            subtotal: totals.subtotal + (item.product.price * item.quantity),
            itemsCount: totals.itemsCount + item.quantity
          }),
          { subtotal: 0, itemsCount: 0 }
        );
      }
    }),
    {
      name: 'origenaxm-cart-storage',
    }
  )
);
