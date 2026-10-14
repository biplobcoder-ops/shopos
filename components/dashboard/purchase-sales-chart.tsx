// components/dashboard/purchase-sales-chart.tsx

'use client';

import { useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { format, subMonths, startOfMonth, isSameMonth } from 'date-fns';
import { useSaleStore } from '@/lib/store/sale-store';
import { usePurchaseStore } from '@/lib/store/purchase-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Props {
  months?: number;
  title?: string;
  height?: number;
}

export function PurchaseSalesChart({
  months = 12,
  title = 'Purchase vs Sales (12 months)',
  height = 280,
}: Props) {
  const sales = useSaleStore((s) => s.sales);
  const purchases = usePurchaseStore((s) => s.purchases);

  const data = useMemo(() => {
    const now = startOfMonth(new Date());
    const buckets: { month: string; sales: number; purchase: number }[] = [];
    for (let i = months - 1; i >= 0; i--) {
      const d = subMonths(now, i);
      buckets.push({
        month: format(d, 'MMM yy'),
        sales: 0,
        purchase: 0,
      });
    }
    sales.forEach((s) => {
      const idx = buckets.findIndex((b, i) =>
        isSameMonth(subMonths(now, months - 1 - i), new Date(s.date))
      );
      if (idx >= 0) buckets[idx].sales += s.total;
    });
    purchases.forEach((p) => {
      const idx = buckets.findIndex((b, i) =>
        isSameMonth(subMonths(now, months - 1 - i), new Date(p.date))
      );
      if (idx >= 0) buckets[idx].purchase += p.total;
    });
    return buckets;
  }, [sales, purchases, months]);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-2">
        <div style={{ width: '100%', height }}>
          <ResponsiveContainer>
            <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 11 }}
                stroke="hsl(var(--muted-foreground))"
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fontSize: 11 }}
                stroke="hsl(var(--muted-foreground))"
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => (v >= 1000 ? `$${(v / 1000).toFixed(0)}k` : `$${v}`)}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: 8,
                  fontSize: 12,
                }}
                formatter={(v: any, name: any) => [
                  `$${Number(v).toLocaleString()}`,
                  name === 'sales' ? 'Sales' : 'Purchase',
                ]}
              />
              <Legend
                wrapperStyle={{ fontSize: 12 }}
                formatter={(v) => (v === 'sales' ? 'Sales' : 'Purchase')}
              />
              <Bar dataKey="sales" fill="#6366f1" radius={[4, 4, 0, 0]} />
              <Bar dataKey="purchase" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}