// components/dashboard/hourly-sales-chart.tsx

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
} from 'recharts';
import { isToday } from 'date-fns';
import { useSaleStore } from '@/lib/store/sale-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Props {
  cashierEmail?: string;
}

export function HourlySalesChart({ cashierEmail }: Props) {
  const sales = useSaleStore((s) => s.sales);

  const data = useMemo(() => {
    const buckets = Array.from({ length: 12 }).map((_, i) => ({
      hour: `${9 + i}:00`,
      total: 0,
    }));
    sales
      .filter((s) => isToday(new Date(s.date)))
      .filter((s) => (cashierEmail ? s.cashier === cashierEmail : true))
      .forEach((s) => {
        const h = new Date(s.date).getHours();
        const idx = h - 9;
        if (idx >= 0 && idx < 12) buckets[idx].total += s.total;
      });
    return buckets;
  }, [sales, cashierEmail]);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold">Today's Hourly Sales</CardTitle>
      </CardHeader>
      <CardContent className="pt-2">
        <div style={{ width: '100%', height: 260 }}>
          <ResponsiveContainer>
            <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis
                dataKey="hour"
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
                formatter={(v: any) => [`$${Number(v).toLocaleString()}`, 'Sales']}
              />
              <Bar dataKey="total" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}