// components/dashboard/recent-orders-widget.tsx

'use client';

import Link from 'next/link';
import { useOrderStore } from '@/lib/store/order-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge, statusVariant } from '@/components/shared/status-badge';
import { EmptyState } from '@/components/shared/empty-state';
import { PackageCheck } from 'lucide-react';
import { formatCurrency, formatDateTime } from '@/lib/format';

interface Props {
  limit?: number;
}

export function RecentOrdersWidget({ limit = 6 }: Props) {
  const orders = useOrderStore((s) => s.orders);

  const list = orders.slice(0, limit);

  return (
    <Card>
      <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-sm font-semibold">Recent Orders</CardTitle>
        <Button asChild variant="ghost" size="sm" className="text-xs h-7">
          <Link href="/orders">View all</Link>
        </Button>
      </CardHeader>
      <CardContent className="pt-0">
        {list.length === 0 ? (
          <EmptyState icon={PackageCheck} title="No orders" className="py-6" />
        ) : (
          <ul className="divide-y divide-border">
            {list.map((o) => (
              <li key={o.id} className="py-2.5 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-sm font-medium truncate">
                    {o.orderNo} · {o.customerName}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {formatDateTime(o.date)} · {o.items.length} item
                    {o.items.length > 1 ? 's' : ''}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold tabular-nums">
                    {formatCurrency(o.total)}
                  </div>
                  <StatusBadge variant={statusVariant(o.status)} className="mt-1">
                    {o.status}
                  </StatusBadge>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}