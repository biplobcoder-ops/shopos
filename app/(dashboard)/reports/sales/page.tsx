// app/(dashboard)/reports/sales/page.tsx

'use client';

import { useMemo } from 'react';
import { toast } from 'sonner';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { DollarSign, Receipt, TrendingUp, Users } from 'lucide-react';
import { format, startOfDay, isSameDay, subDays } from 'date-fns';

import { ReportShell } from '@/components/reports/report-shell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/shared/empty-state';
import { useDateFilter } from '@/lib/hooks/use-date-filter';
import { useSaleStore } from '@/lib/store/sale-store';
import { useSettingsStore } from '@/lib/store/settings-store';
import { formatCurrency, formatDateTime } from '@/lib/format';
import { downloadCSV } from '@/lib/export';
import { downloadPDF } from '@/components/pdf/pdf-download';
import { ReportPDF } from '@/components/pdf/report-pdf';
import { StatCard } from '@/components/dashboard/stat-card';

export default function SalesReportPage() {
  const { sales } = useSaleStore();
  const { businessInfo } = useSettingsStore();
  const filter = useDateFilter({ defaultPreset: '30d' });

  const filtered = useMemo(
    () => sales.filter((s) => filter.inRange(s.date)),
    [sales, filter.range] // eslint-disable-line
  );

  const stats = useMemo(() => {
    const total = filtered.reduce((s, x) => s + x.total, 0);
    const due = filtered.reduce((s, x) => s + x.due, 0);
    const paid = filtered.reduce((s, x) => s + x.paid, 0);
    const count = filtered.length;
    const avg = count > 0 ? total / count : 0;
    return { total, due, paid, count, avg };
  }, [filtered]);

  const chartData = useMemo(() => {
    const days = Math.min(
      60,
      Math.max(
        1,
        Math.ceil(
          (filter.range.to.getTime() - filter.range.from.getTime()) /
            (1000 * 60 * 60 * 24)
        )
      )
    );
    const buckets: { date: string; total: number; count: number }[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = subDays(startOfDay(new Date()), i);
      buckets.push({ date: format(d, 'dd MMM'), total: 0, count: 0 });
    }
    filtered.forEach((s) => {
      const d = new Date(s.date);
      const idx = buckets.findIndex((b) =>
        isSameDay(new Date(new Date().getFullYear(), new Date().getMonth(), parseInt(b.date.slice(0, 2))), d)
      );
      // simpler: rebuild from dates
    });
    // Rebuild simpler
    const map = new Map<string, { total: number; count: number }>();
    for (let i = days - 1; i >= 0; i--) {
      const d = subDays(startOfDay(new Date()), i);
      map.set(format(d, 'dd MMM'), { total: 0, count: 0 });
    }
    filtered.forEach((s) => {
      const key = format(new Date(s.date), 'dd MMM');
      const cur = map.get(key);
      if (cur) {
        cur.total += s.total;
        cur.count += 1;
      }
    });
    return Array.from(map.entries()).map(([date, v]) => ({
      date,
      total: v.total,
      count: v.count,
    }));
  }, [filtered]);

  const handleExportCSV = () => {
    downloadCSV(
      filtered.map((s) => ({
        invoiceNo: s.invoiceNo,
        date: s.date,
        customer: s.customerName,
        items: s.items.length,
        subtotal: s.subtotal,
        discount: s.discount,
        tax: s.tax,
        total: s.total,
        paid: s.paid,
        due: s.due,
        paymentMethod: s.paymentMethod,
        cashier: s.cashier,
      })),
      `sales-report-${new Date().toISOString().slice(0, 10)}.csv`
    );
    toast.success('CSV downloaded');
  };

  const handleExportPDF = async () => {
    await downloadPDF({
      filename: `sales-report-${new Date().toISOString().slice(0, 10)}.pdf`,
      component: (
        <ReportPDF
          business={businessInfo}
          title="Sales Report"
          periodFrom={filter.range.from}
          periodTo={filter.range.to}
          summary={[
            { label: 'Total Sales', value: formatCurrency(stats.total) },
            { label: 'Transactions', value: String(stats.count) },
            { label: 'Total Paid', value: formatCurrency(stats.paid) },
          ]}
          columns={[
            { key: 'invoiceNo', label: 'Invoice', width: '16%' },
            { key: 'date', label: 'Date', width: '20%' },
            { key: 'customer', label: 'Customer', width: '24%' },
            { key: 'total', label: 'Total', width: '15%', align: 'right' },
            { key: 'due', label: 'Due', width: '15%', align: 'right' },
          ]}
          rows={filtered.slice(0, 200).map((s) => ({
            invoiceNo: s.invoiceNo,
            date: formatDateTime(s.date),
            customer: s.customerName,
            total: formatCurrency(s.total),
            due: s.due > 0 ? formatCurrency(s.due) : '—',
          }))}
        />
      ),
    });
  };

  return (
    <ReportShell
      title="Sales Report"
      description="Analyze sales performance over a selected period."
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
        <StatCard title="Total Sales" value={stats.total} icon={DollarSign} variant="indigo" />
        <StatCard
          title="Transactions"
          value={stats.count}
          icon={Receipt}
          variant="cyan"
          format="number"
        />
        <StatCard title="Total Paid" value={stats.paid} icon={TrendingUp} variant="emerald" />
        <StatCard
          title="Total Due"
          value={stats.due}
          icon={Users}
          variant="red"
        />
      </div>

      <Card className="mb-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Daily Sales Trend</CardTitle>
        </CardHeader>
        <CardContent className="pt-2">
          <div style={{ width: '100%', height: 280 }}>
            <ResponsiveContainer>
              <LineChart data={chartData}>
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
                />
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke="#6366f1"
                  strokeWidth={2}
                  dot={{ r: 2.5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="p-6">
            <EmptyState title="No sales in this period" />
          </CardContent>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40">
                <tr className="text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="text-left font-semibold px-4 py-2.5">Invoice</th>
                  <th className="text-left font-semibold px-4 py-2.5 hidden md:table-cell">
                    Date
                  </th>
                  <th className="text-left font-semibold px-4 py-2.5">Customer</th>
                  <th className="text-left font-semibold px-4 py-2.5 hidden lg:table-cell">
                    Method
                  </th>
                  <th className="text-right font-semibold px-4 py-2.5">Total</th>
                  <th className="text-right font-semibold px-4 py-2.5 hidden sm:table-cell">
                    Paid
                  </th>
                  <th className="text-right font-semibold px-4 py-2.5">Due</th>
                </tr>
              </thead>
              <tbody>
                {filtered.slice(0, 200).map((s) => (
                  <tr key={s.id} className="border-t border-border hover:bg-muted/30">
                    <td className="px-4 py-2.5 font-medium">{s.invoiceNo}</td>
                    <td className="px-4 py-2.5 hidden md:table-cell text-xs text-muted-foreground">
                      {formatDateTime(s.date)}
                    </td>
                    <td className="px-4 py-2.5 truncate max-w-[200px]">
                      {s.customerName}
                    </td>
                    <td className="px-4 py-2.5 hidden lg:table-cell uppercase text-xs text-muted-foreground">
                      {s.paymentMethod}
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums font-semibold">
                      {formatCurrency(s.total)}
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums hidden sm:table-cell text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(s.paid)}
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums">
                      {s.due > 0 ? (
                        <span className="font-semibold text-red-600 dark:text-red-400">
                          {formatCurrency(s.due)}
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
          {filtered.length > 200 && (
            <div className="px-4 py-2 text-xs text-muted-foreground border-t">
              Showing first 200 of {filtered.length}. Use CSV export for full list.
            </div>
          )}
        </Card>
      )}
    </ReportShell>
  );
}