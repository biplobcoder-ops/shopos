// app/(dashboard)/suppliers/payments/page.tsx

'use client';

import { useMemo, useState } from 'react';
import { Download, Wallet, Search } from 'lucide-react';

import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { EmptyState } from '@/components/shared/empty-state';
import { usePurchaseStore } from '@/lib/store/purchase-store';
import { formatCurrency, formatDateTime } from '@/lib/format';
import { downloadCSV } from '@/lib/export';

interface PaymentRow {
  id: string;
  date: string;
  supplierName: string;
  reference: string;
  amount: number;
}

export default function SupplierPaymentsPage() {
  const purchases = usePurchaseStore((s) => s.purchases);
  const [query, setQuery] = useState('');

  const payments: PaymentRow[] = useMemo(
    () =>
      purchases
        .filter((p) => p.paid > 0)
        .map((p) => ({
          id: p.id,
          date: p.date,
          supplierName: p.supplierName,
          reference: p.purchaseNo,
          amount: p.paid,
        }))
        .sort((a, b) => (a.date < b.date ? 1 : -1)),
    [purchases]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return payments;
    return payments.filter(
      (p) =>
        p.supplierName.toLowerCase().includes(q) ||
        p.reference.toLowerCase().includes(q)
    );
  }, [payments, query]);

  const totalPaid = filtered.reduce((s, p) => s + p.amount, 0);

  const handleExport = () => {
    downloadCSV(
      filtered.map((p) => ({
        date: p.date,
        supplier: p.supplierName,
        reference: p.reference,
        amount: p.amount,
      })),
      `supplier-payments-${new Date().toISOString().slice(0, 10)}.csv`
    );
  };

  return (
    <div>
      <PageHeader
        title="Supplier Payment History"
        description={`${filtered.length} payments · ${formatCurrency(totalPaid)} paid out`}
        actions={
          <Button variant="outline" className="h-9" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        }
      />

      <div className="relative max-w-sm mb-4">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search supplier or purchase no..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-9 h-9"
        />
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="p-6">
            <EmptyState
              icon={Wallet}
              title="No payments recorded"
              description="Payments will appear here when purchases are paid."
            />
          </CardContent>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40">
                <tr className="text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="text-left font-semibold px-4 py-2.5">Date</th>
                  <th className="text-left font-semibold px-4 py-2.5">Supplier</th>
                  <th className="text-left font-semibold px-4 py-2.5 hidden md:table-cell">
                    Reference
                  </th>
                  <th className="text-right font-semibold px-4 py-2.5">Amount</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr
                    key={p.id}
                    className="border-t border-border hover:bg-muted/30"
                  >
                    <td className="px-4 py-2.5 text-xs text-muted-foreground whitespace-nowrap">
                      {formatDateTime(p.date)}
                    </td>
                    <td className="px-4 py-2.5 font-medium">{p.supplierName}</td>
                    <td className="px-4 py-2.5 hidden md:table-cell text-muted-foreground">
                      {p.reference}
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums font-semibold text-amber-600 dark:text-amber-400">
                      {formatCurrency(p.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}