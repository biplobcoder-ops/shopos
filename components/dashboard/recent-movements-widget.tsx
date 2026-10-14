// components/dashboard/recent-movements-widget.tsx

'use client';

import Link from 'next/link';
import { ArrowDownRight, ArrowUpRight, Activity } from 'lucide-react';
import { useStockStore } from '@/lib/store/stock-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/shared/empty-state';
import { formatDateTime } from '@/lib/format';
import { cn } from '@/lib/utils';

interface Props {
  limit?: number;
}

export function RecentMovementsWidget({ limit = 8 }: Props) {
  const movements = useStockStore((s) => s.movements);
  const list = movements.slice(0, limit);

  return (
    <Card>
      <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Activity className="h-4 w-4 text-brand-500" />
          Recent Stock Movements
        </CardTitle>
        <Button asChild variant="ghost" size="sm" className="text-xs h-7">
          <Link href="/inventory/movements">View all</Link>
        </Button>
      </CardHeader>
      <CardContent className="pt-0">
        {list.length === 0 ? (
          <EmptyState title="No movements yet" className="py-6" />
        ) : (
          <ul className="divide-y divide-border">
            {list.map((m) => (
              <li key={m.id} className="py-2.5 flex items-center gap-3">
                <div
                  className={cn(
                    'h-8 w-8 shrink-0 rounded-full flex items-center justify-center',
                    m.qty >= 0
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                      : 'bg-red-500/10 text-red-600 dark:text-red-400'
                  )}
                >
                  {m.qty >= 0 ? (
                    <ArrowUpRight className="h-4 w-4" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium truncate">{m.productName}</div>
                  <div className="text-xs text-muted-foreground mt-0.5 truncate">
                    {m.type} · {m.reference} · {formatDateTime(m.date)}
                  </div>
                </div>
                <div
                  className={cn(
                    'text-sm font-semibold tabular-nums shrink-0',
                    m.qty >= 0
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-red-600 dark:text-red-400'
                  )}
                >
                  {m.qty > 0 ? '+' : ''}
                  {m.qty}
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}