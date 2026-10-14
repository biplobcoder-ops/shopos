// lib/store/sale-store.ts

'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Sale, SaleItem, PaymentMethod, SaleReturn } from '@/lib/types';
import { demoSales } from '@/lib/demo-data';
import { uid } from '@/lib/utils';
import { useStockStore } from './stock-store';
import { useCustomerStore } from './customer-store';

interface SaleState {
  sales: Sale[];
  returns: SaleReturn[];

  /** Create a sale: adds to sales[], reduces stock, updates customer due if any */
  createSale: (input: {
    customerId: string | null;
    customerName: string;
    items: SaleItem[];
    subtotal: number;
    discount: number;
    tax: number;
    total: number;
    paid: number;
    paymentMethod: PaymentMethod;
    cashier: string;
  }) => Sale;

  /** Full or partial return of a sale */
  recordReturn: (input: {
    saleId: string;
    items: SaleItem[];
    reason: string;
  }) => void;

  reset: () => void;
}

function nextInvoiceNo(sales: Sale[]): string {
  const nums = sales
    .map((s) => parseInt(s.invoiceNo.replace(/\D/g, ''), 10))
    .filter((n) => !isNaN(n));
  const max = nums.length ? Math.max(...nums) : 5000;
  return `INV-${max + 1}`;
}

export const useSaleStore = create<SaleState>()(
  persist(
    (set, get) => ({
      sales: demoSales,
      returns: [],

      createSale: (input) => {
        const invoiceNo = nextInvoiceNo(get().sales);
        const due = Math.max(0, input.total - input.paid);

        const sale: Sale = {
          id: uid('sale'),
          invoiceNo,
          customerId: input.customerId,
          customerName: input.customerName,
          items: input.items,
          subtotal: input.subtotal,
          discount: input.discount,
          tax: input.tax,
          total: input.total,
          paid: input.paid,
          due,
          paymentMethod: input.paymentMethod,
          cashier: input.cashier,
          date: new Date().toISOString(),
          status: 'completed',
        };

        // Reduce stock for each item
        useStockStore.getState().bulkRecord(
          input.items.map((it) => ({
            productId: it.productId,
            type: 'sale' as const,
            qty: -it.qty,
            reference: invoiceNo,
          })),
          input.cashier
        );

        // Update customer due if there's a due and a known customer
        if (due > 0 && input.customerId) {
          useCustomerStore.getState().addDue(input.customerId, due, input.total);
        } else if (input.customerId) {
          // no due → just count towards total purchase
          useCustomerStore.getState().addDue(input.customerId, 0, input.total);
        }

        set((s) => ({ sales: [sale, ...s.sales] }));
        return sale;
      },

      recordReturn: ({ saleId, items, reason }) => {
        const sale = get().sales.find((s) => s.id === saleId);
        if (!sale) return;

        const amount = items.reduce((sum, it) => sum + it.subtotal, 0);

        const ret: SaleReturn = {
          id: uid('sret'),
          saleId,
          invoiceNo: sale.invoiceNo,
          items,
          amount,
          reason,
          date: new Date().toISOString(),
        };

        // Restore stock
        useStockStore.getState().bulkRecord(
          items.map((it) => ({
            productId: it.productId,
            type: 'sale-return' as const,
            qty: it.qty,
            reference: `RET-${sale.invoiceNo}`,
          })),
          'system'
        );

        // Mark sale status
        const isPartial = items.length < sale.items.length;
        set((s) => ({
          returns: [ret, ...s.returns],
          sales: s.sales.map((x) =>
            x.id === saleId
              ? { ...x, status: isPartial ? 'partial-return' : 'returned' }
              : x
          ),
        }));

        // Reduce customer due if customer had due
        if (sale.customerId && sale.due > 0) {
          const refund = Math.min(amount, sale.due);
          if (refund > 0) {
            useCustomerStore.getState().recordPayment(sale.customerId, refund);
          }
        }
      },

      reset: () => set({ sales: demoSales, returns: [] }),
    }),
    {
      name: 'shopos-sales',
      storage: createJSONStorage(() => localStorage),
      version: 1,
    }
  )
);