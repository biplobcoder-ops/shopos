// app/(dashboard)/suppliers/due/page.tsx

'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { AlertCircle, Download, Wallet, Phone } from 'lucide-react';

import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/shared/empty-state';
import { MakePaymentDialog } from '@/components/suppliers/make-payment-dialog';
import { useSupplierStore } from '@/lib/store/supplier-store';
import { formatCurrency } from '@/lib/format';
import { downloadCSV } from '@/lib/export';
import type { Supplier } from '@/lib/types';

export default function SupplierDuePage() {
  const { suppliers } = useSupplierStore();
  const [payTarget, setPayTarget] = useState<Supplier | null>(null);

  const dueList = useMemo(
    () => suppliers.filter((s) => s.due > 0).sort((a, b) => b.due - a.due),
    [suppliers]
  );

  const totalDue = dueList.reduce((s, x) => s + x.due, 0);

  const handleExport = () => {
    downloadCSV(
      dueList.map((s) => ({
        name: s.name,
        contactPerson: s.contactPerson ?? '',
        phone: s.phone,
        email: s.email ?? '',
        due: s.due,
        paid: s.paid,
        totalPurchase: s.totalPurchase,
      })),
      `supplier-due-${new Date().toISOString().slice(0, 10)}.csv`
    );
  };

  return (
    <div>
      <PageHeader
        title="Supplier Due List"
        description={`${dueList.length} suppliers · ${formatCurrency(totalDue)} total payable`}
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
              description="No suppliers have outstanding dues."
            />
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {dueList.map((s) => (
            <Card
              key={s.id}
              className="hover:shadow-md transition overflow-hidden border-l-4 border-l-amber-500"
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <Link
                    href={`/suppliers/${s.id}`}
                    className="min-w-0 group"
                  >
                    <div className="text-sm font-semibold truncate group-hover:text-brand-600 dark:group-hover:text-brand-400">
                      {s.name}
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                      <Phone className="h-3 w-3" />
                      {s.phone}
                    </div>
                  </Link>
                </div>

                {s.contactPerson && (
                  <div className="text-xs text-muted-foreground mt-2">
                    Contact: {s.contactPerson}
                  </div>
                )}

                <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <div className="text-muted-foreground">Total Purchase</div>
                    <div className="font-medium tabular-nums mt-0.5">
                      {formatCurrency(s.totalPurchase)}
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Paid</div>
                    <div className="font-medium tabular-nums mt-0.5 text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(s.paid)}
                    </div>
                  </div>
                </div>

                <div className="mt-3 rounded-lg bg-amber-500/5 border border-amber-500/20 p-2.5 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Payable</span>
                  <span className="font-bold tabular-nums text-red-600 dark:text-red-400">
                    {formatCurrency(s.due)}
                  </span>
                </div>

                <Button
                  size="sm"
                  className="w-full h-9 mt-3 bg-emerald-600 hover:bg-emerald-700"
                  onClick={() => setPayTarget(s)}
                >
                  <Wallet className="h-3.5 w-3.5 mr-2" />
                  Make Payment
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <MakePaymentDialog
        open={!!payTarget}
        onOpenChange={(v) => !v && setPayTarget(null)}
        supplierId={payTarget?.id ?? null}
      />
    </div>
  );
}