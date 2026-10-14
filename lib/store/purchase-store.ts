// lib/store/purchase-store.ts

'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Purchase, PurchaseItem, PurchaseReturn } from '@/lib/types';
import { demoPurchases } from '@/lib/demo-data';
import { uid } from '@/lib/utils';
import { useStockStore } from './stock-store';
import { useSupplierStore } from './supplier-store';

interface PurchaseState {
  purchases: Purchase[];
  returns: PurchaseReturn[];

  createPurchase: (input: {
    supplierId: string;
    supplierName: string;
    items: PurchaseItem[];
    subtotal: number;
    discount: number;
    tax: number;
    total: number;
    paid: number;
    notes?: string;
    user?: string;
  }) => Purchase;

  recordReturn: (input: {
    purchaseId: string;
    items: PurchaseItem[];
    reason: string;
  }) => void;

  reset: () => void;
}

function nextPurchaseNo(purchases: Purchase[]): string {
  const nums = purchases
    .map((p) => parseInt(p.purchaseNo.replace(/\D/g, ''), 10))
    .filter((n) => !isNaN(n));
  const max = nums.length ? Math.max(...nums) : 3000;
  return `PUR-${max + 1}`;
}

export const usePurchaseStore = create<PurchaseState>()(
  persist(
    (set, get) => ({
      purchases: demoPurchases,
      returns: [],

      createPurchase: (input) => {
        const purchaseNo = nextPurchaseNo(get().purchases);
        const due = Math.max(0, input.total - input.paid);

        const purchase: Purchase = {
          id: uid('pur'),
          purchaseNo,
          supplierId: input.supplierId,
          supplierName: input.supplierName,
          items: input.items,
          subtotal: input.subtotal,
          discount: input.discount,
          tax: input.tax,
          total: input.total,
          paid: input.paid,
          due,
          date: new Date().toISOString(),
          status: 'received',
          notes: input.notes,
        };

        // Increase stock
        useStockStore.getState().bulkRecord(
          input.items.map((it) => ({
            productId: it.productId,
            type: 'purchase' as const,
            qty: it.qty,
            reference: purchaseNo,
          })),
          input.user || 'system'
        );

        // Update supplier due
        if (input.supplierId) {
          useSupplierStore.getState().addDue(input.supplierId, due, input.total);
        }

        set((s) => ({ purchases: [purchase, ...s.purchases] }));
        return purchase;
      },

      recordReturn: ({ purchaseId, items, reason }) => {
        const pur = get().purchases.find((p) => p.id === purchaseId);
        if (!pur) return;

        const amount = items.reduce((sum, it) => sum + it.subtotal, 0);

        const ret: PurchaseReturn = {
          id: uid('pret'),
          purchaseId,
          purchaseNo: pur.purchaseNo,
          items,
          amount,
          reason,
          date: new Date().toISOString(),
        };

        // Decrease stock
        useStockStore.getState().bulkRecord(
          items.map((it) => ({
            productId: it.productId,
            type: 'purchase-return' as const,
            qty: -it.qty,
            reference: `RET-${pur.purchaseNo}`,
          })),
          'system'
        );

        const isPartial = items.length < pur.items.length;
        set((s) => ({
          returns: [ret, ...s.returns],
          purchases: s.purchases.map((x) =>
            x.id === purchaseId
              ? { ...x, status: isPartial ? 'partial-return' : 'returned' }
              : x
          ),
        }));

        // Reduce supplier due
        if (pur.due > 0) {
          const refund = Math.min(amount, pur.due);
          if (refund > 0) {
            useSupplierStore.getState().recordPayment(pur.supplierId, refund);
          }
        }
      },

      reset: () => set({ purchases: demoPurchases, returns: [] }),
    }),
    {
      name: 'shopos-purchases',
      storage: createJSONStorage(() => localStorage),
      version: 1,
    }
  )
);