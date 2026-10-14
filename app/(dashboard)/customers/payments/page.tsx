// app/(dashboard)/customers/payments/page.tsx

'use client';

import { useMemo, useState } from 'react';
import { Download, Wallet, Search } from 'lucide-react';

import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/shared/empty-state';
import { useSaleStore } from '@/lib/store/sale-store';
import { useCustomerStore } from '@/lib/store/customer-store';
import { formatCurrency, formatDateTime } from '@/lib/format';
import { downloadCSV } from '@/lib/export';

interface PaymentRow {
  id: string;
  date: string;
  customerName: string;
  customerId: string;
  reference: string;
  amount: number;
  method: string;
}

export default function CustomerPaymentsPage() {
  const sales = useSaleStore((s) => s.sales);
  const { customers } = useCustomerStore();

  const [query, setQuery] = useState('');

  // Build payments list from sales (paid > 0)
  const payments: PaymentRow[] = useMemo(
    () =>
      sales
        .filter((s) => s.paid > 0 && s.customerId)
        .map((s) => ({
          id: s.id,
          date: s.date,
          customerName: s.customerName,
          customerId: s.customerId!,
          reference: s.invoiceNo,
          amount: s.paid,
          method: s.paymentMethod,
        }))
        .sort((a, b) => (a.date < b.date ? 1 : -1)),
    [sales]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return payments;
    return payments.filter(
      (p) =>
        p.customerName.toLowerCase().includes(q) ||
        p.reference.toLowerCase().includes(q)
    );
  }, [payments, query]);

  const totalPaid = filtered.reduce((s, p) => s + p.amount, 0);

  const handleExport = () => {
    downloadCSV(
      filtered.map((p) => ({
        date: p.date,
        customer: p.customerName,
        reference: p.reference,
        amount: p.amount,
        method: p.method,
      })),
      `customer-payments-${new Date().toISOString().slice(0, 10)}.csv`
    );
  };

  return (
    <div>
      <PageHeader
        title="Payment History"
        description={`${filtered.length} payments · ${formatCurrency(totalPaid)} collected`}
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
          placeholder="Search customer or invoice..."
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
              description="Payments will appear when invoices are paid."
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
                  <th className="text-left font-semibold px-4 py-2.5">Customer</th>
                  <th className="text-left font-semibold px-4 py-2.5 hidden md:table-cell">
                    Reference
                  </th>
                  <th className="text-left font-semibold px-4 py-2.5 hidden lg:table-cell">
                    Method
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
                    <td className="px-4 py-2.5 font-medium">{p.customerName}</td>
                    <td className="px-4 py-2.5 hidden md:table-cell text-muted-foreground">
                      {p.reference}
                    </td>
                    <td className="px-4 py-2.5 hidden lg:table-cell">
                      <Badge
                        variant="secondary"
                        className="text-[10px] uppercase"
                      >
                        {p.method}
                      </Badge>
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums font-semibold text-emerald-600 dark:text-emerald-400">
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