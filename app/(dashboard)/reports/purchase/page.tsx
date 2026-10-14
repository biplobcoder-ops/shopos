// app/(dashboard)/reports/purchase/page.tsx

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
import { DollarSign, Truck, TrendingDown, Users } from 'lucide-react';
import { format, startOfDay, subDays } from 'date-fns';

import { ReportShell } from '@/components/reports/report-shell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/shared/empty-state';
import { StatCard } from '@/components/dashboard/stat-card';
import { useDateFilter } from '@/lib/hooks/use-date-filter';
import { usePurchaseStore } from '@/lib/store/purchase-store';
import { useSettingsStore } from '@/lib/store/settings-store';
import { formatCurrency, formatDateTime } from '@/lib/format';
import { downloadCSV } from '@/lib/export';
import { downloadPDF } from '@/components/pdf/pdf-download';
import { ReportPDF } from '@/components/pdf/report-pdf';

export default function PurchaseReportPage() {
  const { purchases } = usePurchaseStore();
  const { businessInfo } = useSettingsStore();
  const filter = useDateFilter({ defaultPreset: '30d' });

  const filtered = useMemo(
    () => purchases.filter((p) => filter.inRange(p.date)),
    [purchases, filter.range] // eslint-disable-line
  );

  const stats = useMemo(() => {
    const total = filtered.reduce((s, x) => s + x.total, 0);
    const due = filtered.reduce((s, x) => s + x.due, 0);
    const paid = filtered.reduce((s, x) => s + x.paid, 0);
    const count = filtered.length;
    return { total, due, paid, count };
  }, [filtered]);

  const chartData = useMemo(() => {
    const days = 30;
    const map = new Map<string, number>();
    for (let i = days - 1; i >= 0; i--) {
      const d = subDays(startOfDay(new Date()), i);
      map.set(format(d, 'dd MMM'), 0);
    }
    filtered.forEach((p) => {
      const key = format(new Date(p.date), 'dd MMM');
      if (map.has(key)) map.set(key, (map.get(key) ?? 0) + p.total);
    });
    return Array.from(map.entries()).map(([date, total]) => ({ date, total }));
  }, [filtered]);

  const handleExportCSV = () => {
    downloadCSV(
      filtered.map((p) => ({
        purchaseNo: p.purchaseNo,
        date: p.date,
        supplier: p.supplierName,
        items: p.items.length,
        subtotal: p.subtotal,
        discount: p.discount,
        tax: p.tax,
        total: p.total,
        paid: p.paid,
        due: p.due,
        status: p.status,
      })),
      `purchase-report-${new Date().toISOString().slice(0, 10)}.csv`
    );
    toast.success('CSV downloaded');
  };

  const handleExportPDF = async () => {
    await downloadPDF({
      filename: `purchase-report-${new Date().toISOString().slice(0, 10)}.pdf`,
      component: (
        <ReportPDF
          business={businessInfo}
          title="Purchase Report"
          periodFrom={filter.range.from}
          periodTo={filter.range.to}
          summary={[
            { label: 'Total Purchase', value: formatCurrency(stats.total) },
            { label: 'Orders', value: String(stats.count) },
            { label: 'Paid Out', value: formatCurrency(stats.paid) },
          ]}
          columns={[
            { key: 'purchaseNo', label: 'Purchase', width: '18%' },
            { key: 'date', label: 'Date', width: '20%' },
            { key: 'supplier', label: 'Supplier', width: '27%' },
            { key: 'total', label: 'Total', width: '15%', align: 'right' },
            { key: 'due', label: 'Due', width: '15%', align: 'right' },
          ]}
          rows={filtered.slice(0, 200).map((p) => ({
            purchaseNo: p.purchaseNo,
            date: formatDateTime(p.date),
            supplier: p.supplierName,
            total: formatCurrency(p.total),
            due: p.due > 0 ? formatCurrency(p.due) : '—',
          }))}
        />
      ),
    });
  };

  return (
    <ReportShell
      title="Purchase Report"
      description="Track purchases from suppliers over a period."
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
    >
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <StatCard title="Total Purchase" value={stats.total} icon={DollarSign} variant="amber" />
        <StatCard title="Orders" value={stats.count} icon={Truck} variant="cyan" format="number" />
        <StatCard title="Paid Out" value={stats.paid} icon={TrendingDown} variant="emerald" />
        <StatCard title="Outstanding" value={stats.due} icon={Users} variant="red" />
      </div>

      <Card className="mb-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Daily Purchase Trend</CardTitle>
        </CardHeader>
        <CardContent className="pt-2">
          <div style={{ width: '100%', height: 280 }}>
            <ResponsiveContainer>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11 }}
                  stroke="hsl(var(--muted-foreground))"
                  tickLine={false}
                  axisLine={false}
                  interval="preserveStartEnd"
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
                  formatter={(v: any) => [`$${Number(v).toLocaleString()}`, 'Purchase']}
                />
                <Bar dataKey="total" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="p-6">
            <EmptyState title="No purchases in this period" />
          </CardContent>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40">
                <tr className="text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="text-left font-semibold px-4 py-2.5">Purchase</th>
                  <th className="text-left font-semibold px-4 py-2.5 hidden md:table-cell">
                    Date
                  </th>
                  <th className="text-left font-semibold px-4 py-2.5">Supplier</th>
                  <th className="text-right font-semibold px-4 py-2.5">Total</th>
                  <th className="text-right font-semibold px-4 py-2.5 hidden sm:table-cell">
                    Paid
                  </th>
                  <th className="text-right font-semibold px-4 py-2.5">Due</th>
                </tr>
              </thead>
              <tbody>
                {filtered.slice(0, 200).map((p) => (
                  <tr key={p.id} className="border-t border-border hover:bg-muted/30">
                    <td className="px-4 py-2.5 font-medium">{p.purchaseNo}</td>
                    <td className="px-4 py-2.5 hidden md:table-cell text-xs text-muted-foreground">
                      {formatDateTime(p.date)}
                    </td>
                    <td className="px-4 py-2.5 truncate max-w-[200px]">
                      {p.supplierName}
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums font-semibold">
                      {formatCurrency(p.total)}
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums hidden sm:table-cell text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(p.paid)}
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums">
                      {p.due > 0 ? (
                        <span className="font-semibold text-red-600 dark:text-red-400">
                          {formatCurrency(p.due)}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
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