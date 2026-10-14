// app/(dashboard)/reports/stock/page.tsx

'use client';

import { useMemo } from 'react';
import { toast } from 'sonner';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { Package, Warehouse, AlertTriangle, PackageX } from 'lucide-react';

import { ReportShell } from '@/components/reports/report-shell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { StatCard } from '@/components/dashboard/stat-card';
import { EmptyState } from '@/components/shared/empty-state';
import { useDateFilter } from '@/lib/hooks/use-date-filter';
import { useProductStore } from '@/lib/store/product-store';
import { useSettingsStore } from '@/lib/store/settings-store';
import { formatCurrency } from '@/lib/format';
import { downloadCSV } from '@/lib/export';
import { downloadPDF } from '@/components/pdf/pdf-download';
import { ReportPDF } from '@/components/pdf/report-pdf';
import { useState } from 'react';

export default function StockReportPage() {
  const products = useProductStore((s) => s.products);
  const categories = useProductStore((s) => s.categories);
  const { businessInfo } = useSettingsStore();
  const filter = useDateFilter({ defaultPreset: 'thisMonth' });
  const [catFilter, setCatFilter] = useState<string>('all');

  const filtered = useMemo(() => {
    if (catFilter === 'all') return products;
    return products.filter((p) => p.category === catFilter);
  }, [products, catFilter]);

  const stats = useMemo(() => {
    const totalValue = filtered.reduce((s, p) => s + p.stock * p.purchasePrice, 0);
    const totalUnits = filtered.reduce((s, p) => s + p.stock, 0);
    const lowStock = filtered.filter((p) => p.stock > 0 && p.stock <= p.minStock).length;
    const out = filtered.filter((p) => p.stock <= 0).length;
    return { totalValue, totalUnits, lowStock, out, count: filtered.length };
  }, [filtered]);

  const chartData = useMemo(() => {
    const map = new Map<string, number>();
    filtered.forEach((p) => {
      map.set(p.category, (map.get(p.category) ?? 0) + p.stock * p.purchasePrice);
    });
    return Array.from(map.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [filtered]);

  const handleExportCSV = () => {
    downloadCSV(
      filtered.map((p) => ({
        name: p.name,
        sku: p.sku,
        barcode: p.barcode,
        category: p.category,
        brand: p.brand,
        stock: p.stock,
        unit: p.unit,
        minStock: p.minStock,
        purchasePrice: p.purchasePrice,
        stockValue: p.stock * p.purchasePrice,
      })),
      `stock-report-${new Date().toISOString().slice(0, 10)}.csv`
    );
    toast.success('CSV downloaded');
  };

  const handleExportPDF = async () => {
    await downloadPDF({
      filename: `stock-report-${new Date().toISOString().slice(0, 10)}.pdf`,
      component: (
        <ReportPDF
          business={businessInfo}
          title="Stock Report"
          periodFrom={filter.range.from}
          periodTo={filter.range.to}
          subtitle={catFilter !== 'all' ? `Category: ${catFilter}` : undefined}
          summary={[
            { label: 'Total Products', value: String(stats.count) },
            { label: 'Stock Value', value: formatCurrency(stats.totalValue) },
            { label: 'Low Stock', value: String(stats.lowStock) },
          ]}
          columns={[
            { key: 'name', label: 'Product', width: '30%' },
            { key: 'category', label: 'Category', width: '18%' },
            { key: 'stock', label: 'Stock', width: '12%', align: 'right' },
            { key: 'cost', label: 'Cost', width: '15%', align: 'right' },
            { key: 'value', label: 'Value', width: '25%', align: 'right' },
          ]}
          rows={filtered.slice(0, 200).map((p) => ({
            name: p.name,
            category: p.category,
            stock: String(p.stock),
            cost: formatCurrency(p.purchasePrice),
            value: formatCurrency(p.stock * p.purchasePrice),
          }))}
        />
      ),
    });
  };

  return (
    <ReportShell
      title="Stock Report"
      description="Inventory valuation and stock levels."
      preset={filter.preset}
      setPreset={filter.setPreset}
      customFrom={filter.customFrom}
      setCustomFrom={filter.setCustomFrom}
      customTo={filter.customTo}
      setCustomTo={filter.setCustomTo}
      from={filter.range.from}
      to={filter.range.to}
      onExportCSV={handleExportCSV}
      onExportPDF={handleExportPDF}
      extraActions={
        <Select value={catFilter} onValueChange={setCatFilter}>
          <SelectTrigger className="h-9 w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c.id} value={c.name}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      }
    >
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <StatCard title="Products" value={stats.count} icon={Package} variant="indigo" format="number" />
        <StatCard title="Stock Value" value={stats.totalValue} icon={Warehouse} variant="cyan" />
        <StatCard title="Low Stock" value={stats.lowStock} icon={AlertTriangle} variant="amber" format="number" />
        <StatCard title="Out of Stock" value={stats.out} icon={PackageX} variant="red" format="number" />
      </div>

      <Card className="mb-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Stock Value by Category</CardTitle>
        </CardHeader>
        <CardContent className="pt-2">
          <div style={{ width: '100%', height: 280 }}>
            <ResponsiveContainer>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} />
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
                  formatter={(v: any) => [`$${Number(v).toLocaleString()}`, 'Value']}
                />
                <Bar dataKey="value" fill="#06b6d4" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="p-6">
            <EmptyState title="No products" />
          </CardContent>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40">
                <tr className="text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="text-left font-semibold px-4 py-2.5">Product</th>
                  <th className="text-left font-semibold px-4 py-2.5 hidden md:table-cell">
                    Category
                  </th>
                  <th className="text-right font-semibold px-4 py-2.5">Stock</th>
                  <th className="text-right font-semibold px-4 py-2.5 hidden sm:table-cell">
                    Cost
                  </th>
                  <th className="text-right font-semibold px-4 py-2.5">Value</th>
                </tr>
              </thead>
              <tbody>
                {filtered.slice(0, 200).map((p) => (
                  <tr key={p.id} className="border-t border-border hover:bg-muted/30">
                    <td className="px-4 py-2.5">
                      <div className="font-medium truncate max-w-[260px]">{p.name}</div>
                      <div className="text-xs text-muted-foreground">{p.sku}</div>
                    </td>
                    <td className="px-4 py-2.5 hidden md:table-cell text-muted-foreground">
                      {p.category}
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums">
                      {p.stock} {p.unit}
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums hidden sm:table-cell text-muted-foreground">
                      {formatCurrency(p.purchasePrice)}
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums font-semibold">
                      {formatCurrency(p.stock * p.purchasePrice)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </ReportShell>
  );
}