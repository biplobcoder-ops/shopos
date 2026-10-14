// lib/hooks/use-supplier-ledger.ts

'use client';

import { useMemo } from 'react';
import { usePurchaseStore } from '@/lib/store/purchase-store';
import { useSupplierStore } from '@/lib/store/supplier-store';
import type { LedgerEntry } from '@/lib/types';

export function useSupplierLedger(supplierId: string | null) {
  const purchases = usePurchaseStore((s) => s.purchases);
  const supplier = useSupplierStore((s) =>
    s.suppliers.find((x) => x.id === supplierId)
  );

  const entries: LedgerEntry[] = useMemo(() => {
    if (!supplierId) return [];

    const list: LedgerEntry[] = [];

    purchases
      .filter((p) => p.supplierId === supplierId)
      .forEach((p) => {
        list.push({
          id: `pur-${p.id}`,
          partnerId: supplierId,
          partnerType: 'supplier',
          type: 'purchase',
          reference: p.purchaseNo,
          amount: p.total,
          paid: p.paid,
          balance: p.due,
          date: p.date,
          note: p.items.length + ' items',
        });
      });

    return list.sort((a, b) => (a.date < b.date ? 1 : -1));
  }, [purchases, supplierId]);

  const stats = useMemo(() => {
    const totalOrdered = purchases
      .filter((p) => p.supplierId === supplierId)
      .reduce((sum, p) => sum + p.total, 0);
    const totalPaid = purchases
      .filter((p) => p.supplierId === supplierId)
      .reduce((sum, p) => sum + p.paid, 0);
    const totalDue = supplier?.due ?? 0;
    return { totalPurchased: totalOrdered, totalPaid, totalDue };
  }, [purchases, supplierId, supplier]);

  return { entries, supplier, stats };
}