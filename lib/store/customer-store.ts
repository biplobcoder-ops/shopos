// lib/store/customer-store.ts

'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Customer } from '@/lib/types';
import { demoCustomers } from '@/lib/demo-data';
import { uid } from '@/lib/utils';

interface CustomerState {
  customers: Customer[];
  add: (data: Omit<Customer, 'id' | 'createdAt'>) => Customer;
  update: (id: string, data: Partial<Customer>) => void;
  remove: (id: string) => void;
  /** Record a payment from customer, reduces their due */
  recordPayment: (id: string, amount: number) => void;
  /** Add a due amount (from sale with due) */
  addDue: (id: string, amount: number, purchaseAmount: number) => void;
  reset: () => void;
}

export const useCustomerStore = create<CustomerState>()(
  persist(
    (set) => ({
      customers: demoCustomers,

      add: (data) => {
        const c: Customer = {
          ...data,
          id: uid('cust'),
          createdAt: new Date().toISOString(),
        };
        set((s) => ({ customers: [c, ...s.customers] }));
        return c;
      },

      update: (id, data) => {
        set((s) => ({
          customers: s.customers.map((c) => (c.id === id ? { ...c, ...data } : c)),
        }));
      },

      remove: (id) => {
        set((s) => ({ customers: s.customers.filter((c) => c.id !== id) }));
      },

      recordPayment: (id, amount) => {
        set((s) => ({
          customers: s.customers.map((c) =>
            c.id === id
              ? {
                  ...c,
                  due: Math.max(0, c.due - amount),
                  paid: c.paid + amount,
                }
              : c
          ),
        }));
      },

      addDue: (id, amount, purchaseAmount) => {
        set((s) => ({
          customers: s.customers.map((c) =>
            c.id === id
              ? {
                  ...c,
                  due: c.due + amount,
                  totalPurchase: c.totalPurchase + purchaseAmount,
                }
              : c
          ),
        }));
      },

      reset: () => set({ customers: demoCustomers }),
    }),
    {
      name: 'shopos-customers',
      storage: createJSONStorage(() => localStorage),
      version: 1,
    }
  )
);