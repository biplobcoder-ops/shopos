// lib/store/cart-store.ts

'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { CartItem, HeldCart, Product, Customer } from '@/lib/types';
import { uid } from '@/lib/utils';

interface CartState {
  items: CartItem[];
  customer: Customer | null;
  discount: number; // total invoice-level discount
  heldCarts: HeldCart[];

  addItem: (product: Product, qty?: number) => void;
  removeItem: (productId: string) => void;
  updateQty: (productId: string, qty: number) => void;
  updateItemDiscount: (productId: string, discount: number) => void;

  setCustomer: (customer: Customer | null) => void;
  setDiscount: (amount: number) => void;
  clear: () => void;

  holdCart: () => void;
  resumeCart: (id: string) => void;
  removeHeld: (id: string) => void;

  // derived
  subtotal: () => number;
  itemDiscountTotal: () => number;
  total: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      customer: null,
      discount: 0,
      heldCarts: [],

      addItem: (product, qty = 1) => {
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
          const newItem: CartItem = {
            productId: product.id,
            name: product.name,
            sku: product.sku,
            price: product.sellingPrice,
            purchasePrice: product.purchasePrice,
            qty: Math.min(product.stock, qty),
            discount: 0,
            stock: product.stock,
          };
          return { items: [...s.items, newItem] };
        });
      },

      removeItem: (productId) => {
        set((s) => ({ items: s.items.filter((i) => i.productId !== productId) }));
      },

      updateQty: (productId, qty) => {
        if (qty <= 0) {
          get().removeItem(productId);
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

      updateItemDiscount: (productId, discount) => {
        set((s) => ({
          items: s.items.map((i) =>
            i.productId === productId ? { ...i, discount: Math.max(0, discount) } : i
          ),
        }));
      },

      setCustomer: (customer) => set({ customer }),
      setDiscount: (amount) => set({ discount: Math.max(0, amount) }),
      clear: () => set({ items: [], customer: null, discount: 0 }),

      holdCart: () => {
        const { items, customer, discount, heldCarts } = get();
        if (!items.length) return;
        const held: HeldCart = {
          id: uid('held'),
          items,
          customerId: customer?.id ?? null,
          discount,
          createdAt: new Date().toISOString(),
        };
        set({
          heldCarts: [held, ...heldCarts].slice(0, 20),
          items: [],
          customer: null,
          discount: 0,
        });
      },

      resumeCart: (id) => {
        const held = get().heldCarts.find((h) => h.id === id);
        if (!held) return;
        set({
          items: held.items,
          discount: held.discount,
          customer: null, // customer not stored fully, will need re-select
          heldCarts: get().heldCarts.filter((h) => h.id !== id),
        });
      },

      removeHeld: (id) => {
        set((s) => ({ heldCarts: s.heldCarts.filter((h) => h.id !== id) }));
      },

      subtotal: () =>
        get().items.reduce((sum, i) => sum + i.price * i.qty, 0),

      itemDiscountTotal: () =>
        get().items.reduce((sum, i) => sum + i.discount, 0),

      total: () => {
        const sub = get().subtotal();
        const itemDisc = get().itemDiscountTotal();
        const invDisc = get().discount;
        return Math.max(0, sub - itemDisc - invDisc);
      },
    }),
    {
      name: 'shopos-cart',
      storage: createJSONStorage(() => localStorage),
      version: 1,
    }
  )
);