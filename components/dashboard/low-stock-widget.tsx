// components/dashboard/low-stock-widget.tsx

'use client';

import Link from 'next/link';
import { AlertTriangle, PackageX } from 'lucide-react';
import { useProductStore } from '@/lib/store/product-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/shared/status-badge';
import { EmptyState } from '@/components/shared/empty-state';
import { formatCurrency } from '@/lib/format';

interface Props {
  limit?: number;
}

export function LowStockWidget({ limit = 8 }: Props) {
  const products = useProductStore((s) => s.products);

  const list = products
    .filter((p) => p.stock <= p.minStock)
    .sort((a, b) => a.stock - b.stock)
    .slice(0, limit);

  const outOfStock = products.filter((p) => p.stock <= 0).length;

  return (
    <Card>
      <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          Low Stock Alerts
        </CardTitle>
        <Button asChild variant="ghost" size="sm" className="text-xs h-7">
          <Link href="/inventory">View all</Link>
        </Button>
      </CardHeader>
      <CardContent className="pt-0">
        {list.length === 0 ? (
          <EmptyState
            icon={PackageX}
            title="All good"
            description="No products are low on stock."
            className="py-6"
          />
        ) : (
          <ul className="divide-y divide-border">
            {list.map((p) => (
              <li key={p.id} className="py-2.5 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-sm font-medium truncate">{p.name}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {p.sku} · Min {p.minStock} · {formatCurrency(p.sellingPrice)}
                  </div>
                </div>
                <StatusBadge variant={p.stock <= 0 ? 'danger' : 'warning'}>
                  {p.stock <= 0 ? 'Out' : `${p.stock} left`}
                </StatusBadge>
              </li>
            ))}
          </ul>
        )}
        {outOfStock > 0 && (
          <div className="mt-3 rounded-md bg-red-500/10 px-3 py-2 text-xs text-red-600 dark:text-red-400">
            {outOfStock} product{outOfStock > 1 ? 's are' : ' is'} out of stock
          </div>
        )}
      </CardContent>
    </Card>
  );
}