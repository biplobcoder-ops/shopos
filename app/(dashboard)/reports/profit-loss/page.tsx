// app/(dashboard)/reports/profit-loss/page.tsx

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
  Legend,
} from 'recharts';
import { TrendingUp, TrendingDown, Wallet, Percent } from 'lucide-react';

import { ReportShell } from '@/components/reports/report-shell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatCard } from '@/components/dashboard/stat-card';
import { useDateFilter } from '@/lib/hooks/use-date-filter';
import { useSaleStore } from '@/lib/store/sale-store';
import { usePurchaseStore } from '@/lib/store/purchase-store';
import { useExpenseStore } from '@/lib/store/expense-store';
import { useSettingsStore } from '@/lib/store/settings-store';
import { formatCurrency, formatPercent } from '@/lib/format';
import { downloadCSV } from '@/lib/export';
import { downloadPDF } from '@/components/pdf/pdf-download';
import { ReportPDF } from '@/components/pdf/report-pdf';
import { cn } from '@/lib/utils';

export default function ProfitLossPage() {
  const { sales } = useSaleStore();
  const { purchases } = usePurchaseStore();
  const { expenses } = useExpenseStore();
  const { businessInfo } = useSettingsStore();
  const filter = useDateFilter({ defaultPreset: 'thisMonth' });

  const stats = useMemo(() => {
    const rangeSales = sales.filter((s) => filter.inRange(s.date));
    const rangePurchases = purchases.filter((p) => filter.inRange(p.date));
    const rangeExpenses = expenses.filter((e) => filter.inRange(e.date));

    // Revenue = sales total
    const revenue = rangeSales.reduce((s, x) => s + x.total, 0);

    // COGS = sum of (purchasePrice * qty) for sold items
    const cogs = rangeSales.reduce((sum, sale) => {
      return (
        sum +
        sale.items.reduce((cs, it) => cs + it.purchasePrice * it.qty, 0)
      );
    }, 0);

    const grossProfit = revenue - cogs;

    const purchaseTotal = rangePurchases.reduce((s, x) => s + x.total, 0);
    const expenseTotal = rangeExpenses.reduce((s, x) => s + x.amount, 0);

    const netProfit = grossProfit - expenseTotal;
    const margin = revenue > 0 ? (netProfit / revenue) * 100 : 0;

    return {
      revenue,
      cogs,
      grossProfit,
      purchaseTotal,
      expenseTotal,
      netProfit,
      margin,
      saleCount: rangeSales.length,
    };
  }, [sales, purchases, expenses, filter.range]); // eslint-disable-line

  const chartData = [
    {
      name: 'Revenue',
      value: stats.revenue,
    },
    {
      name: 'COGS',
      value: stats.cogs,
    },
    {
      name: 'Gross Profit',
      value: stats.grossProfit,
    },
    {
      name: 'Expenses',
      value: stats.expenseTotal,
    },
    {
      name: 'Net Profit',
      value: stats.netProfit,
    },
  ];

  const handleExportCSV = () => {
    downloadCSV(
      [
        { metric: 'Revenue', amount: stats.revenue },
        { metric: 'Cost of Goods Sold', amount: stats.cogs },
        { metric: 'Gross Profit', amount: stats.grossProfit },
        { metric: 'Total Purchases', amount: stats.purchaseTotal },
        { metric: 'Total Expenses', amount: stats.expenseTotal },
        { metric: 'Net Profit', amount: stats.netProfit },
        { metric: 'Profit Margin %', amount: stats.margin },
      ],
      `profit-loss-${new Date().toISOString().slice(0, 10)}.csv`
    );
    toast.success('CSV downloaded');
  };

  const handleExportPDF = async () => {
    await downloadPDF({
      filename: `profit-loss-${new Date().toISOString().slice(0, 10)}.pdf`,
      component: (
        <ReportPDF
          business={businessInfo}
          title="Profit & Loss"
          periodFrom={filter.range.from}
          periodTo={filter.range.to}
          summary={[
            { label: 'Revenue', value: formatCurrency(stats.revenue) },
            { label: 'Gross Profit', value: formatCurrency(stats.grossProfit) },
            { label: 'Net Profit', value: formatCurrency(stats.netProfit) },
          ]}
          columns={[
            { key: 'metric', label: 'Metric', width: '60%' },
            { key: 'amount', label: 'Amount', width: '40%', align: 'right' },
          ]}
          rows={[
            { metric: 'Revenue', amount: formatCurrency(stats.revenue) },
            { metric: 'Cost of Goods Sold', amount: formatCurrency(stats.cogs) },
            { metric: 'Gross Profit', amount: formatCurrency(stats.grossProfit) },
            { metric: 'Total Purchases (Inventory)', amount: formatCurrency(stats.purchaseTotal) },
            { metric: 'Total Expenses', amount: formatCurrency(stats.expenseTotal) },
            { metric: 'Net Profit', amount: formatCurrency(stats.netProfit) },
            { metric: 'Profit Margin %', amount: formatPercent(stats.margin) },
          ]}
        />
      ),
    });
  };

  const rows = [
    { label: 'Revenue', value: stats.revenue, bold: false, positive: true },
    { label: 'Cost of Goods Sold (COGS)', value: -stats.cogs, bold: false },
    { label: 'Gross Profit', value: stats.grossProfit, bold: true },
    { label: 'Total Purchases', value: stats.purchaseTotal, bold: false, muted: true },
    { label: 'Operating Expenses', value: -stats.expenseTotal, bold: false },
    { label: 'Net Profit', value: stats.netProfit, bold: true, highlight: true },
  ];

  return (
    <ReportShell
      title="Profit & Loss Report"
      description="Financial summary: revenue, costs, and net profit."
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
        <StatCard title="Revenue" value={stats.revenue} icon={TrendingUp} variant="indigo" />
        <StatCard title="COGS" value={stats.cogs} icon={TrendingDown} variant="amber" />
        <StatCard title="Gross Profit" value={stats.grossProfit} icon={Wallet} variant="emerald" />
        <StatCard
          title="Net Profit"
          value={stats.netProfit}
          icon={Percent}
          variant={stats.netProfit >= 0 ? 'emerald' : 'red'}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Financial Summary</CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="space-y-1">
              {rows.map((r, i) => (
                <div
                  key={i}
                  className={cn(
                    'flex items-center justify-between py-2 text-sm',
                    r.bold && 'font-semibold',
                    r.highlight &&
                      'border-t border-border pt-3 mt-2 text-base'
                  )}
                >
                  <span className={cn(r.muted && 'text-muted-foreground')}>
                    {r.label}
                  </span>
                  <span
                    className={cn(
                      'tabular-nums',
                      r.value < 0 && 'text-red-600 dark:text-red-400',
                      r.value > 0 && r.positive && 'text-emerald-600 dark:text-emerald-400',
                      r.highlight &&
                        (r.value >= 0
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-red-600 dark:text-red-400')
                    )}
                  >
                    {formatCurrency(r.value)}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-3 border-t text-xs text-muted-foreground">
              Profit Margin: <span className="font-semibold text-foreground">{formatPercent(stats.margin)}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Visual Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <div style={{ width: '100%', height: 280 }}>
              <ResponsiveContainer>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} />
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
                    formatter={(v: any) => [`$${Number(v).toLocaleString()}`, 'Amount']}
                  />
                  <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </ReportShell>
  );
}