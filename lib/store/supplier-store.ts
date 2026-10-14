// lib/store/supplier-store.ts

'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Supplier } from '@/lib/types';
import { demoSuppliers } from '@/lib/demo-data';
import { uid } from '@/lib/utils';

interface SupplierState {
  suppliers: Supplier[];
  add: (data: Omit<Supplier, 'id' | 'createdAt'>) => Supplier;
  update: (id: string, data: Partial<Supplier>) => void;
  remove: (id: string) => void;
  recordPayment: (id: string, amount: number) => void;
  addDue: (id: string, amount: number, purchaseAmount: number) => void;
  reset: () => void;
}

export const useSupplierStore = create<SupplierState>()(
  persist(
    (set) => ({
      suppliers: demoSuppliers,

      add: (data) => {
        const s: Supplier = {
          ...data,
          id: uid('sup'),
          createdAt: new Date().toISOString(),
        };
        set((st) => ({ suppliers: [s, ...st.suppliers] }));
        return s;
      },

      update: (id, data) => {
        set((s) => ({
          suppliers: s.suppliers.map((x) => (x.id === id ? { ...x, ...data } : x)),
        }));
      },

      remove: (id) => {
        set((s) => ({ suppliers: s.suppliers.filter((x) => x.id !== id) }));
      },

      recordPayment: (id, amount) => {
        set((s) => ({
          suppliers: s.suppliers.map((x) =>
            x.id === id
              ? {
                  ...x,
                  due: Math.max(0, x.due - amount),
                  paid: x.paid + amount,
                }
              : x
          ),
        }));
      },

      addDue: (id, amount, purchaseAmount) => {
        set((s) => ({
          suppliers: s.suppliers.map((x) =>
            x.id === id
              ? {
                  ...x,
                  due: x.due + amount,
                  totalPurchase: x.totalPurchase + purchaseAmount,
                }
              : x
          ),
        }));
      },

      reset: () => set({ suppliers: demoSuppliers }),
    }),
    {
      name: 'shopos-suppliers',
      storage: createJSONStorage(() => localStorage),
      version: 1,
    }
  )
);