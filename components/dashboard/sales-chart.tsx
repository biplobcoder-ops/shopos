// components/dashboard/sales-chart.tsx

'use client';

import { useMemo } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { format, subDays, startOfDay, isSameDay } from 'date-fns';
import { useSaleStore } from '@/lib/store/sale-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Props {
  days?: number;
  title?: string;
  height?: number;
}

export function SalesChart({ days = 30, title = 'Sales (Last 30 days)', height = 280 }: Props) {
  const sales = useSaleStore((s) => s.sales);

  const data = useMemo(() => {
    const today = startOfDay(new Date());
    const buckets: { date: string; full: string; total: number; count: number }[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = subDays(today, i);
      buckets.push({
        date: format(d, 'dd MMM'),
        full: format(d, 'dd MMM yyyy'),
        total: 0,
        count: 0,
      });
    }
    sales.forEach((sale) => {
      const d = new Date(sale.date);
      const idx = buckets.findIndex((b) => isSameDay(new Date(b.full), d));
      if (idx >= 0) {
        buckets[idx].total += sale.total;
        buckets[idx].count += 1;
      }
    });
    return buckets;
  }, [sales, days]);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-2">
        <div style={{ width: '100%', height }}>
          <ResponsiveContainer>
            <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11 }}
                stroke="hsl(var(--muted-foreground))"
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
                minTickGap={20}
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
                labelFormatter={(_, payload) =>
                  payload?.[0]?.payload?.full ?? ''
                }
              />
              <Line
                type="monotone"
                dataKey="total"
                stroke="#6366f1"
                strokeWidth={2}
                dot={{ r: 2.5, fill: '#6366f1' }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}