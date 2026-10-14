// components/dashboard/category-pie-chart.tsx

'use client';

import { useMemo } from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from 'recharts';
import { useSaleStore } from '@/lib/store/sale-store';
import { useProductStore } from '@/lib/store/product-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CHART_COLORS } from '@/lib/constants';

interface Props {
  title?: string;
  height?: number;
}

export function CategoryPieChart({ title = 'Sales by Category', height = 280 }: Props) {
  const sales = useSaleStore((s) => s.sales);
  const products = useProductStore((s) => s.products);

  const data = useMemo(() => {
    const map = new Map<string, number>();
    sales.forEach((sale) => {
      sale.items.forEach((it) => {
        const prod = products.find((p) => p.id === it.productId);
        const cat = prod?.category ?? 'Other';
        map.set(cat, (map.get(cat) ?? 0) + it.subtotal);
      });
    });
    return Array.from(map.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [sales, products]);

  if (!data.length) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">{title}</CardTitle>
        </CardHeader>
        <CardContent className="h-[280px] flex items-center justify-center text-sm text-muted-foreground">
          No sales data yet
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-2">
        <div style={{ width: '100%', height }}>
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                innerRadius={50}
                outerRadius={85}
                paddingAngle={2}
              >
                {data.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: 8,
                  fontSize: 12,
                }}
                formatter={(v: any) => [`$${Number(v).toLocaleString()}`, 'Revenue']}
              />
              <Legend
                wrapperStyle={{ fontSize: 11 }}
                layout="horizontal"
                verticalAlign="bottom"
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}