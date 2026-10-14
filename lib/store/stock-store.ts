// lib/store/stock-store.ts

'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { StockMovement, MovementType } from '@/lib/types';
import { demoStockMovements } from '@/lib/demo-data';
import { uid } from '@/lib/utils';
import { useProductStore } from './product-store';

interface StockState {
  movements: StockMovement[];
  /**
   * Record a stock movement and automatically adjust product stock.
   * delta > 0 means stock-in, delta < 0 means stock-out.
   */
  record: (input: {
    productId: string;
    type: MovementType;
    qty: number; // signed
    reference: string;
    note?: string;
    user?: string;
  }) => void;
  bulkRecord: (
    items: Array<{
      productId: string;
      type: MovementType;
      qty: number;
      reference: string;
      note?: string;
    }>,
    user?: string
  ) => void;
  reset: () => void;
}

export const useStockStore = create<StockState>()(
  persist(
    (set, get) => ({
      movements: demoStockMovements,

      record: ({ productId, type, qty, reference, note, user }) => {
        const products = useProductStore.getState().products;
        const product = products.find((p) => p.id === productId);
        if (!product) return;

        const before = product.stock;
        const after = Math.max(0, before + qty);

        const movement: StockMovement = {
          id: uid('mv'),
          productId,
          productName: product.name,
          type,
          qty,
          before,
          after,
          reference,
          note,
          user: user || 'system',
          date: new Date().toISOString(),
        };

        // Apply stock change to product store
        useProductStore.getState().adjustStock(productId, qty);

        set((s) => ({ movements: [movement, ...s.movements] }));
      },

      bulkRecord: (items, user) => {
        const products = useProductStore.getState().products;
        const newMovements: StockMovement[] = [];

        items.forEach((item) => {
          const product = products.find((p) => p.id === item.productId);
          if (!product) return;
          const before = product.stock;
          const after = Math.max(0, before + item.qty);
          newMovements.push({
            id: uid('mv'),
            productId: item.productId,
            productName: product.name,
            type: item.type,
            qty: item.qty,
            before,
            after,
            reference: item.reference,
            note: item.note,
            user: user || 'system',
            date: new Date().toISOString(),
          });
          useProductStore.getState().adjustStock(item.productId, item.qty);
        });

        set((s) => ({ movements: [...newMovements, ...s.movements] }));
      },

      reset: () => set({ movements: demoStockMovements }),
    }),
    {
      name: 'shopos-stock',
      storage: createJSONStorage(() => localStorage),
      version: 1,
    }
  )
);