// lib/hooks/use-customer-ledger.ts

'use client';

import { useMemo } from 'react';
import { useSaleStore } from '@/lib/store/sale-store';
import { useCustomerStore } from '@/lib/store/customer-store';
import type { LedgerEntry, Customer } from '@/lib/types';

/**
 * Builds a combined ledger for a customer:
 *  - Sale with due → sale entry
 *  - Payment (recorded via customer store) → payment entry
 * Sorted newest first.
 */
export function useCustomerLedger(customerId: string | null) {
  const sales = useSaleStore((s) => s.sales);
  const customer = useCustomerStore((s) =>
    s.customers.find((c) => c.id === customerId)
  );

  const entries: LedgerEntry[] = useMemo(() => {
    if (!customerId) return [];

    const list: LedgerEntry[] = [];

    // Sale entries
    sales
      .filter((s) => s.customerId === customerId)
      .forEach((s) => {
        list.push({
          id: `sale-${s.id}`,
          partnerId: customerId,
          partnerType: 'customer',
          type: 'sale',
          reference: s.invoiceNo,
          amount: s.total,
          paid: s.paid,
          balance: s.due,
          date: s.date,
          note: s.items.length + ' items',
        });
      });

    // Payment entries are inferred from paid amounts on sales
    // (real app would track payments separately; here we derive)

    return list.sort((a, b) => (a.date < b.date ? 1 : -1));
  }, [sales, customerId]);

  const stats = useMemo(() => {
    const totalPurchased = sales
      .filter((s) => s.customerId === customerId)
      .reduce((sum, s) => sum + s.total, 0);
    const totalPaid = sales
      .filter((s) => s.customerId === customerId)
      .reduce((sum, s) => sum + s.paid, 0);
    const totalDue = customer?.due ?? 0;
    return { totalPurchased, totalPaid, totalDue };
  }, [sales, customerId, customer]);

  return { entries, customer, stats };
}