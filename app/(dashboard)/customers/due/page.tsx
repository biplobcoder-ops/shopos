// app/(dashboard)/customers/due/page.tsx

'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  AlertCircle,
  Download,
  Wallet,
  Phone,
  MoreHorizontal,
} from 'lucide-react';

import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/shared/empty-state';
import { ReceivePaymentDialog } from '@/components/customers/payment-dialog';
import { useCustomerStore } from '@/lib/store/customer-store';
import { formatCurrency } from '@/lib/format';
import { downloadCSV } from '@/lib/export';
import { cn } from '@/lib/utils';
import type { Customer } from '@/lib/types';

export default function CustomerDuePage() {
  const { customers } = useCustomerStore();
  const [payTarget, setPayTarget] = useState<Customer | null>(null);

  const dueList = useMemo(
    () =>
      customers
        .filter((c) => c.due > 0)
        .sort((a, b) => b.due - a.due),
    [customers]
  );

  const totalDue = dueList.reduce((s, c) => s + c.due, 0);

  const handleExport = () => {
    downloadCSV(
      dueList.map((c) => ({
        name: c.name,
        phone: c.phone,
        email: c.email ?? '',
        due: c.due,
        paid: c.paid,
        totalPurchase: c.totalPurchase,
      })),
      `customer-due-${new Date().toISOString().slice(0, 10)}.csv`
    );
  };

  return (
    <div>
      <PageHeader
        title="Customer Due List"
        description={`${dueList.length} customers · ${formatCurrency(totalDue)} total outstanding`}
        actions={
          <Button variant="outline" className="h-9" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        }
      />

      {dueList.length === 0 ? (
        <Card>
          <CardContent className="p-6">
            <EmptyState
              icon={AlertCircle}
              title="All clear"
              description="No customers have outstanding dues."
            />
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {dueList.map((c) => (
            <Card
              key={c.id}
              className="hover:shadow-md transition overflow-hidden border-l-4 border-l-red-500"
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <Link
                    href={`/customers/${c.id}`}
                    className="min-w-0 group"
                  >
                    <div className="text-sm font-semibold truncate group-hover:text-brand-600 dark:group-hover:text-brand-400">
                      {c.name}
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                      <Phone className="h-3 w-3" />
                      {c.phone}
                    </div>
                  </Link>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <div className="text-muted-foreground">Total Purchase</div>
                    <div className="font-medium tabular-nums mt-0.5">
                      {formatCurrency(c.totalPurchase)}
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Paid</div>
                    <div className="font-medium tabular-nums mt-0.5 text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(c.paid)}
                    </div>
                  </div>
                </div>

                <div className="mt-3 rounded-lg bg-red-500/5 border border-red-500/20 p-2.5 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Due</span>
                  <span className="font-bold tabular-nums text-red-600 dark:text-red-400">
                    {formatCurrency(c.due)}
                  </span>
                </div>

                <Button
                  size="sm"
                  className="w-full h-9 mt-3 bg-emerald-600 hover:bg-emerald-700"
                  onClick={() => setPayTarget(c)}
                >
                  <Wallet className="h-3.5 w-3.5 mr-2" />
                  Receive Payment
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <ReceivePaymentDialog
        open={!!payTarget}
        onOpenChange={(v) => !v && setPayTarget(null)}
        customerId={payTarget?.id ?? null}
      />
    </div>
  );
}