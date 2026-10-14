// app/(dashboard)/sales/invoices/page.tsx

'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { FileText, Download, Search, Printer } from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/shared/empty-state';
import { SaleDetailDialog } from '@/components/sales/sale-detail-dialog';
import { useSaleStore } from '@/lib/store/sale-store';
import { useSettingsStore } from '@/lib/store/settings-store';
import { formatCurrency, formatDate } from '@/lib/format';
import { downloadCSV } from '@/lib/export';
import { downloadPDF } from '@/components/pdf/pdf-download';
import { InvoicePDF } from '@/components/pdf/invoice-pdf';
import type { Sale } from '@/lib/types';

export default function InvoicesPage() {
  const sales = useSaleStore((s) => s.sales);
  const { businessInfo, receiptInfo } = useSettingsStore();

  const [query, setQuery] = useState('');
  const [detail, setDetail] = useState<Sale | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return sales;
    return sales.filter(
      (s) =>
        s.invoiceNo.toLowerCase().includes(q) ||
        s.customerName.toLowerCase().includes(q)
    );
  }, [sales, query]);

  const handleExport = () => {
    downloadCSV(
      filtered.map((s) => ({
        invoiceNo: s.invoiceNo,
        date: s.date,
        customer: s.customerName,
        total: s.total,
        paid: s.paid,
        due: s.due,
      })),
      `invoices-${new Date().toISOString().slice(0, 10)}.csv`
    );
  };

  const quickDownload = async (s: Sale) => {
    await downloadPDF({
      filename: `${s.invoiceNo}-invoice.pdf`,
      component: (
        <InvoicePDF sale={s} business={businessInfo} receiptFooter={receiptInfo.footerText} />
      ),
    });
  };

  return (
    <div>
      <PageHeader
        title="Invoices"
        description={`${filtered.length} invoices generated`}
        actions={
          <Button variant="outline" className="h-9" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        }
      />

      <div className="relative max-w-sm mb-4">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search invoice no or customer..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-9 h-9"
        />
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="p-6">
            <EmptyState icon={FileText} title="No invoices" />
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((s) => (
            <Card key={s.id} className="hover:shadow-md transition overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-sm font-bold">{s.invoiceNo}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {formatDate(s.date)}
                    </div>
                  </div>
                  <Badge
                    variant={s.due > 0 ? 'destructive' : 'secondary'}
                    className="text-[10px] uppercase shrink-0"
                  >
                    {s.due > 0 ? 'Due' : 'Paid'}
                  </Badge>
                </div>

                <div className="mt-3 text-xs">
                  <div className="text-muted-foreground">Bill To</div>
                  <div className="font-medium truncate">{s.customerName}</div>
                </div>

                <div className="mt-3 flex items-baseline justify-between">
                  <span className="text-xs text-muted-foreground">
                    {s.items.length} item{s.items.length > 1 ? 's' : ''}
                  </span>
                  <span className="text-lg font-bold tabular-nums">
                    {formatCurrency(s.total)}
                  </span>
                </div>

                <div className="mt-3 pt-3 border-t flex items-center gap-1.5">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 text-xs flex-1"
                    onClick={() => setDetail(s)}
                  >
                    View
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 text-xs flex-1"
                    onClick={() => quickDownload(s)}
                  >
                    <Download className="h-3.5 w-3.5 mr-1" />
                    PDF
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <SaleDetailDialog
        sale={detail}
        open={!!detail}
        onOpenChange={(v) => !v && setDetail(null)}
      />
    </div>
  );
}