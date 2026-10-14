// app/(dashboard)/reports/customer-due/page.tsx

'use client';

import { useMemo } from 'react';
import { toast } from 'sonner';
import { Users, TrendingDown, Wallet, AlertCircle } from 'lucide-react';

import { ReportShell } from '@/components/reports/report-shell';
import { Card, CardContent } from '@/components/ui/card';
import { StatCard } from '@/components/dashboard/stat-card';
import { EmptyState } from '@/components/shared/empty-state';
import { useDateFilter } from '@/lib/hooks/use-date-filter';
import { useCustomerStore } from '@/lib/store/customer-store';
import { useSaleStore } from '@/lib/store/sale-store';
import { useSettingsStore } from '@/lib/store/settings-store';
import { formatCurrency } from '@/lib/format';
import { downloadCSV } from '@/lib/export';
import { downloadPDF } from '@/components/pdf/pdf-download';
import { ReportPDF } from '@/components/pdf/report-pdf';
import { cn } from '@/lib/utils';

export default function CustomerDueReportPage() {
  const { customers } = useCustomerStore();
  const { sales } = useSaleStore();
  const { businessInfo } = useSettingsStore();
  const filter = useDateFilter({ defaultPreset: 'thisMonth' });

  const rangeSales = useMemo(
    () => sales.filter((s) => filter.inRange(s.date)),
    [sales, filter.range] // eslint-disable-line
  );

  const dueCustomers = useMemo(
    () => customers.filter((c) => c.due > 0).sort((a, b) => b.due - a.due),
    [customers]
  );

  const stats = useMemo(() => {
    const totalDue = dueCustomers.reduce((s, c) => s + c.due, 0);
    const totalPaid = customers.reduce((s, c) => s + c.paid, 0);
    const periodDueAdded = rangeSales.reduce((s, x) => s + x.due, 0);
    return {
      count: dueCustomers.length,
      totalDue,
      totalPaid,
      periodDueAdded,
    };
  }, [dueCustomers, customers, rangeSales]);

  const handleExportCSV = () => {
    downloadCSV(
      dueCustomers.map((c) => ({
        name: c.name,
        phone: c.phone,
        email: c.email ?? '',
        due: c.due,
        paid: c.paid,
        totalPurchase: c.totalPurchase,
      })),
      `customer-due-report-${new Date().toISOString().slice(0, 10)}.csv`
    );
    toast.success('CSV downloaded');
  };

  const handleExportPDF = async () => {
    await downloadPDF({
      filename: `customer-due-report-${new Date().toISOString().slice(0, 10)}.pdf`,
      component: (
        <ReportPDF
          business={businessInfo}
          title="Customer Due Report"
          periodFrom={filter.range.from}
          periodTo={filter.range.to}
          summary={[
            { label: 'Customers with Due', value: String(stats.count) },
            { label: 'Total Outstanding', value: formatCurrency(stats.totalDue) },
            { label: 'Due Added (Period)', value: formatCurrency(stats.periodDueAdded) },
          ]}
          columns={[
            { key: 'name', label: 'Customer', width: '34%' },
            { key: 'phone', label: 'Phone', width: '24%' },
            { key: 'total', label: 'Total Purchase', width: '21%', align: 'right' },
            { key: 'due', label: 'Due', width: '21%', align: 'right' },
          ]}
          rows={dueCustomers.slice(0, 200).map((c) => ({
            name: c.name,
            phone: c.phone,
            total: formatCurrency(c.totalPurchase),
            due: formatCurrency(c.due),
          }))}
        />
      ),
    });
  };

  return (
    <ReportShell
      title="Customer Due Report"
      description="Outstanding customer balances and period activity."
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
        <StatCard title="Customers with Due" value={stats.count} icon={Users} variant="indigo" format="number" />
        <StatCard title="Total Outstanding" value={stats.totalDue} icon={AlertCircle} variant="red" />
        <StatCard title="Total Collected" value={stats.totalPaid} icon={Wallet} variant="emerald" />
        <StatCard title="Due Added (Period)" value={stats.periodDueAdded} icon={TrendingDown} variant="amber" />
      </div>

      {dueCustomers.length === 0 ? (
        <Card>
          <CardContent className="p-6">
            <EmptyState title="No outstanding customer dues" />
          </CardContent>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40">
                <tr className="text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="text-left font-semibold px-4 py-2.5">Customer</th>
                  <th className="text-left font-semibold px-4 py-2.5 hidden md:table-cell">
                    Phone
                  </th>
                  <th className="text-right font-semibold px-4 py-2.5 hidden sm:table-cell">
                    Total Purchase
                  </th>
                  <th className="text-right font-semibold px-4 py-2.5 hidden lg:table-cell">
                    Paid
                  </th>
                  <th className="text-right font-semibold px-4 py-2.5">Due</th>
                </tr>
              </thead>
              <tbody>
                {dueCustomers.slice(0, 200).map((c) => (
                  <tr key={c.id} className="border-t border-border hover:bg-muted/30">
                    <td className="px-4 py-2.5 font-medium truncate max-w-[260px]">
                      {c.name}
                    </td>
                    <td className="px-4 py-2.5 hidden md:table-cell text-muted-foreground">
                      {c.phone}
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums hidden sm:table-cell">
                      {formatCurrency(c.totalPurchase)}
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums hidden lg:table-cell text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(c.paid)}
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums font-semibold text-red-600 dark:text-red-400">
                      {formatCurrency(c.due)}
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