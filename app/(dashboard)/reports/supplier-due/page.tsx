// app/(dashboard)/reports/supplier-due/page.tsx

'use client';

import { useMemo } from 'react';
import { toast } from 'sonner';
import { Factory, TrendingDown, Wallet, AlertCircle } from 'lucide-react';

import { ReportShell } from '@/components/reports/report-shell';
import { Card, CardContent } from '@/components/ui/card';
import { StatCard } from '@/components/dashboard/stat-card';
import { EmptyState } from '@/components/shared/empty-state';
import { useDateFilter } from '@/lib/hooks/use-date-filter';
import { useSupplierStore } from '@/lib/store/supplier-store';
import { usePurchaseStore } from '@/lib/store/purchase-store';
import { useSettingsStore } from '@/lib/store/settings-store';
import { formatCurrency } from '@/lib/format';
import { downloadCSV } from '@/lib/export';
import { downloadPDF } from '@/components/pdf/pdf-download';
import { ReportPDF } from '@/components/pdf/report-pdf';

export default function SupplierDueReportPage() {
  const { suppliers } = useSupplierStore();
  const { purchases } = usePurchaseStore();
  const { businessInfo } = useSettingsStore();
  const filter = useDateFilter({ defaultPreset: 'thisMonth' });

  const rangePurchases = useMemo(
    () => purchases.filter((p) => filter.inRange(p.date)),
    [purchases, filter.range] // eslint-disable-line
  );

  const dueSuppliers = useMemo(
    () => suppliers.filter((s) => s.due > 0).sort((a, b) => b.due - a.due),
    [suppliers]
  );

  const stats = useMemo(() => {
    const totalDue = dueSuppliers.reduce((s, x) => s + x.due, 0);
    const totalPaid = suppliers.reduce((s, x) => s + x.paid, 0);
    const periodDueAdded = rangePurchases.reduce((s, x) => s + x.due, 0);
    return {
      count: dueSuppliers.length,
      totalDue,
      totalPaid,
      periodDueAdded,
    };
  }, [dueSuppliers, suppliers, rangePurchases]);

  const handleExportCSV = () => {
    downloadCSV(
      dueSuppliers.map((s) => ({
        name: s.name,
        contactPerson: s.contactPerson ?? '',
        phone: s.phone,
        email: s.email ?? '',
        due: s.due,
        paid: s.paid,
        totalPurchase: s.totalPurchase,
      })),
      `supplier-due-report-${new Date().toISOString().slice(0, 10)}.csv`
    );
    toast.success('CSV downloaded');
  };

  const handleExportPDF = async () => {
    await downloadPDF({
      filename: `supplier-due-report-${new Date().toISOString().slice(0, 10)}.pdf`,
      component: (
        <ReportPDF
          business={businessInfo}
          title="Supplier Due Report"
          periodFrom={filter.range.from}
          periodTo={filter.range.to}
          summary={[
            { label: 'Suppliers with Due', value: String(stats.count) },
            { label: 'Total Payable', value: formatCurrency(stats.totalDue) },
            { label: 'Due Added (Period)', value: formatCurrency(stats.periodDueAdded) },
          ]}
          columns={[
            { key: 'name', label: 'Supplier', width: '34%' },
            { key: 'phone', label: 'Phone', width: '24%' },
            { key: 'total', label: 'Total Purchase', width: '21%', align: 'right' },
            { key: 'due', label: 'Due', width: '21%', align: 'right' },
          ]}
          rows={dueSuppliers.slice(0, 200).map((s) => ({
            name: s.name,
            phone: s.phone,
            total: formatCurrency(s.totalPurchase),
            due: formatCurrency(s.due),
          }))}
        />
      ),
    });
  };

  return (
    <ReportShell
      title="Supplier Due Report"
      description="Outstanding payables to suppliers."
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
        <StatCard title="Suppliers with Due" value={stats.count} icon={Factory} variant="indigo" format="number" />
        <StatCard title="Total Payable" value={stats.totalDue} icon={AlertCircle} variant="red" />
        <StatCard title="Total Paid Out" value={stats.totalPaid} icon={Wallet} variant="emerald" />
        <StatCard title="Due Added (Period)" value={stats.periodDueAdded} icon={TrendingDown} variant="amber" />
      </div>

      {dueSuppliers.length === 0 ? (
        <Card>
          <CardContent className="p-6">
            <EmptyState title="No outstanding supplier dues" />
          </CardContent>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40">
                <tr className="text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="text-left font-semibold px-4 py-2.5">Supplier</th>
                  <th className="text-left font-semibold px-4 py-2.5 hidden md:table-cell">
                    Contact
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
                {dueSuppliers.slice(0, 200).map((s) => (
                  <tr key={s.id} className="border-t border-border hover:bg-muted/30">
                    <td className="px-4 py-2.5 font-medium truncate max-w-[260px]">
                      {s.name}
                    </td>
                    <td className="px-4 py-2.5 hidden md:table-cell text-xs text-muted-foreground">
                      {s.contactPerson || s.phone}
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums hidden sm:table-cell">
                      {formatCurrency(s.totalPurchase)}
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums hidden lg:table-cell text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(s.paid)}
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums font-semibold text-red-600 dark:text-red-400">
                      {formatCurrency(s.due)}
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