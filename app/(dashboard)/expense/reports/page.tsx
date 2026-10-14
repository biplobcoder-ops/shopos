// app/(dashboard)/expense/reports/page.tsx

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
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { Wallet, TrendingDown, Calendar, PieChart as PieIcon } from 'lucide-react';
import { format, startOfMonth, subMonths, isSameMonth, startOfDay, subDays } from 'date-fns';

import { ReportShell } from '@/components/reports/report-shell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatCard } from '@/components/dashboard/stat-card';
import { EmptyState } from '@/components/shared/empty-state';
import { useDateFilter } from '@/lib/hooks/use-date-filter';
import { useExpenseStore } from '@/lib/store/expense-store';
import { useSettingsStore } from '@/lib/store/settings-store';
import { formatCurrency, formatDate } from '@/lib/format';
import { downloadCSV } from '@/lib/export';
import { downloadPDF } from '@/components/pdf/pdf-download';
import { ReportPDF } from '@/components/pdf/report-pdf';
import { CHART_COLORS } from '@/lib/constants';

export default function ExpenseReportsPage() {
  const { expenses, categories } = useExpenseStore();
  const { businessInfo } = useSettingsStore();
  const filter = useDateFilter({ defaultPreset: 'thisMonth' });

  const filtered = useMemo(
    () => expenses.filter((e) => filter.inRange(e.date)),
    [expenses, filter.range] // eslint-disable-line
  );

  const stats = useMemo(() => {
    const total = filtered.reduce((s, e) => s + e.amount, 0);
    const count = filtered.length;
    const avg = count > 0 ? total / count : 0;
    return { total, count, avg };
  }, [filtered]);

  // By category pie
  const byCategory = useMemo(() => {
    const map = new Map<string, number>();
    filtered.forEach((e) => {
      map.set(e.categoryName, (map.get(e.categoryName) ?? 0) + e.amount);
    });
    return Array.from(map.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [filtered]);

  // 6-month trend
  const monthlyTrend = useMemo(() => {
    const now = startOfMonth(new Date());
    const buckets: { month: string; total: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      buckets.push({ month: format(subMonths(now, i), 'MMM yy'), total: 0 });
    }
    expenses.forEach((e) => {
      const d = new Date(e.date);
      const idx = buckets.findIndex((_, i) =>
        isSameMonth(subMonths(now, 5 - i), d)
      );
      if (idx >= 0) buckets[idx].total += e.amount;
    });
    return buckets;
  }, [expenses]);

  const handleExportCSV = () => {
    downloadCSV(
      filtered.map((e) => ({
        date: e.date,
        category: e.categoryName,
        amount: e.amount,
        note: e.note ?? '',
        createdBy: e.createdBy,
      })),
      `expense-report-${new Date().toISOString().slice(0, 10)}.csv`
    );
    toast.success('CSV downloaded');
  };

  const handleExportPDF = async () => {
    await downloadPDF({
      filename: `expense-report-${new Date().toISOString().slice(0, 10)}.pdf`,
      component: (
        <ReportPDF
          business={businessInfo}
          title="Expense Report"
          periodFrom={filter.range.from}
          periodTo={filter.range.to}
          summary={[
            { label: 'Total Expenses', value: formatCurrency(stats.total) },
            { label: 'Entries', value: String(stats.count) },
            { label: 'Average', value: formatCurrency(stats.avg) },
          ]}
          columns={[
            { key: 'date', label: 'Date', width: '20%' },
            { key: 'category', label: 'Category', width: '25%' },
            { key: 'note', label: 'Note', width: '35%' },
            { key: 'amount', label: 'Amount', width: '20%', align: 'right' },
          ]}
          rows={filtered.slice(0, 200).map((e) => ({
            date: formatDate(e.date),
            category: e.categoryName,
            note: e.note ?? '—',
            amount: formatCurrency(e.amount),
          }))}
        />
      ),
    });
  };

  return (
    <ReportShell
      title="Expense Reports"
      description="Analyze expenses by category and over time."
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
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
        <StatCard title="Total Expenses" value={stats.total} icon={Wallet} variant="red" />
        <StatCard title="Entries" value={stats.count} icon={Calendar} variant="indigo" format="number" />
        <StatCard title="Average" value={stats.avg} icon={TrendingDown} variant="amber" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        {/* 6-month trend */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">6-Month Trend</CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <div style={{ width: '100%', height: 260 }}>
              <ResponsiveContainer>
                <BarChart data={monthlyTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} />
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
                    formatter={(v: any) => [`$${Number(v).toLocaleString()}`, 'Expense']}
                  />
                  <Bar dataKey="total" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* By category */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">By Category</CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            {byCategory.length === 0 ? (
              <div className="flex items-center justify-center h-[260px] text-sm text-muted-foreground">
                No data
              </div>
            ) : (
              <div style={{ width: '100%', height: 260 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={byCategory}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={45}
                      outerRadius={80}
                      paddingAngle={2}
                    >
                      {byCategory.map((_, i) => (
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
                      formatter={(v: any) => [`$${Number(v).toLocaleString()}`, 'Amount']}
                    />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Category table */}
      {byCategory.length === 0 ? (
        <Card>
          <CardContent className="p-6">
            <EmptyState title="No expenses in this period" />
          </CardContent>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40">
                <tr className="text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="text-left font-semibold px-4 py-2.5">Category</th>
                  <th className="text-right font-semibold px-4 py-2.5">Entries</th>
                  <th className="text-right font-semibold px-4 py-2.5">Total</th>
                  <th className="text-right font-semibold px-4 py-2.5">Share</th>
                </tr>
              </thead>
              <tbody>
                {byCategory.map((c) => {
                  const entries = filtered.filter(
                    (e) => e.categoryName === c.name
                  ).length;
                  const share = stats.total > 0 ? (c.value / stats.total) * 100 : 0;
                  return (
                    <tr key={c.name} className="border-t border-border hover:bg-muted/30">
                      <td className="px-4 py-2.5 font-medium">{c.name}</td>
                      <td className="px-4 py-2.5 text-right tabular-nums text-muted-foreground">
                        {entries}
                      </td>
                      <td className="px-4 py-2.5 text-right tabular-nums font-semibold">
                        {formatCurrency(c.value)}
                      </td>
                      <td className="px-4 py-2.5 text-right tabular-nums">
                        {share.toFixed(1)}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </ReportShell>
  );
}