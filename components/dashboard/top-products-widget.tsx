// components/dashboard/top-products-widget.tsx

'use client';

import { useMemo } from 'react';
import { Trophy } from 'lucide-react';
import { useSaleStore } from '@/lib/store/sale-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/shared/empty-state';
import { formatCurrency } from '@/lib/format';

interface Props {
  limit?: number;
}

export function TopProductsWidget({ limit = 6 }: Props) {
  const sales = useSaleStore((s) => s.sales);

  const top = useMemo(() => {
    const map = new Map<string, { name: string; qty: number; revenue: number }>();
    sales.forEach((s) => {
      s.items.forEach((it) => {
        const cur = map.get(it.productId) ?? { name: it.name, qty: 0, revenue: 0 };
        cur.qty += it.qty;
        cur.revenue += it.subtotal;
        map.set(it.productId, cur);
      });
    });
    return Array.from(map.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, limit);
  }, [sales, limit]);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Trophy className="h-4 w-4 text-amber-500" />
          Top Selling Products
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {top.length === 0 ? (
          <EmptyState title="No sales yet" className="py-6" />
        ) : (
          <ul className="divide-y divide-border">
            {top.map((p, i) => (
              <li key={i} className="py-2.5 flex items-center gap-3">
                <div className="h-7 w-7 shrink-0 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center text-xs font-bold">
                  {i + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium truncate">{p.name}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {p.qty} sold
                  </div>
                </div>
                <div className="text-sm font-semibold tabular-nums">
                  {formatCurrency(p.revenue)}
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}