// components/dashboard/recent-sales-widget.tsx

'use client';

import Link from 'next/link';
import { Receipt } from 'lucide-react';
import { useSaleStore } from '@/lib/store/sale-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/shared/empty-state';
import { formatCurrency, formatDateTime } from '@/lib/format';
import { cn } from '@/lib/utils';

interface Props {
  limit?: number;
  /** If provided, only show sales where cashier matches this email */
  cashierEmail?: string;
  title?: string;
}

export function RecentSalesWidget({ limit = 6, cashierEmail, title = 'Recent Sales' }: Props) {
  const sales = useSaleStore((s) => s.sales);

  const filtered = cashierEmail
    ? sales.filter((s) => s.cashier === cashierEmail)
    : sales;

  const list = filtered.slice(0, limit);

  return (
    <Card>
      <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-sm font-semibold">{title}</CardTitle>
        <Button asChild variant="ghost" size="sm" className="text-xs h-7">
          <Link href="/sales">View all</Link>
        </Button>
      </CardHeader>
      <CardContent className="pt-0">
        {list.length === 0 ? (
          <EmptyState icon={Receipt} title="No sales yet" className="py-6" />
        ) : (
          <ul className="divide-y divide-border">
            {list.map((s) => (
              <li key={s.id} className="py-2.5 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-sm font-medium truncate">
                    {s.invoiceNo} · {s.customerName}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {formatDateTime(s.date)} · {s.paymentMethod}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold tabular-nums">
                    {formatCurrency(s.total)}
                  </div>
                  {s.due > 0 && (
                    <div className={cn('text-[11px] text-red-600 dark:text-red-400 mt-0.5 tabular-nums')}>
                      Due {formatCurrency(s.due)}
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}