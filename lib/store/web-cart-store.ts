// lib/store/web-cart-store.ts

'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Product } from '@/lib/types';

export interface WebCartItem {
  productId: string;
  name: string;
  sku: string;
  price: number;
  qty: number;
  image?: string;
  stock: number;
}

interface WebCartState {
  items: WebCartItem[];
  drawerOpen: boolean;

  add: (product: Product, qty?: number) => void;
  remove: (productId: string) => void;
  updateQty: (productId: string, qty: number) => void;
  clear: () => void;

  setDrawerOpen: (v: boolean) => void;

  // derived
  count: () => number;
  subtotal: () => number;
}

export const useWebCart = create<WebCartState>()(
  persist(
    (set, get) => ({
      items: [],
      drawerOpen: false,

      add: (product, qty = 1) => {
        set((s) => {
          const existing = s.items.find((i) => i.productId === product.id);
          if (existing) {
            return {
              items: s.items.map((i) =>
                i.productId === product.id
                  ? { ...i, qty: Math.min(product.stock, i.qty + qty) }
                  : i
              ),
            };
          }
          return {
            items: [
              ...s.items,
              {
                productId: product.id,
                name: product.name,
                sku: product.sku,
                price: product.sellingPrice,
                qty: Math.min(product.stock, qty),
                image: product.image,
                stock: product.stock,
              },
            ],
          };
        });
      },

      remove: (productId) => {
        set((s) => ({
          items: s.items.filter((i) => i.productId !== productId),
        }));
      },

      updateQty: (productId, qty) => {
        if (qty <= 0) {
          get().remove(productId);
          return;
        }
        set((s) => ({
          items: s.items.map((i) =>
            i.productId === productId
              ? { ...i, qty: Math.min(i.stock, qty) }
              : i
          ),
        }));
      },

      clear: () => set({ items: [], drawerOpen: false }),

      setDrawerOpen: (v) => set({ drawerOpen: v }),

      count: () => get().items.reduce((s, i) => s + i.qty, 0),
      subtotal: () =>
        get().items.reduce((s, i) => s + i.price * i.qty, 0),
    }),
    {
      name: 'shopos-web-cart',
      storage: createJSONStorage(() => localStorage),
      version: 1,
    }
  )
);