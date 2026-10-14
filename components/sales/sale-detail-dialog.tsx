// components/sales/sale-detail-dialog.tsx

'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Download, Printer, X } from 'lucide-react';
import { StatusBadge, statusVariant } from '@/components/shared/status-badge';
import { InvoicePDF } from '@/components/pdf/invoice-pdf';
import { ReceiptPDF } from '@/components/pdf/receipt-pdf';
import { downloadPDF, printPDF } from '@/components/pdf/pdf-download';
import { useSettingsStore } from '@/lib/store/settings-store';
import { formatCurrency, formatDateTime } from '@/lib/format';
import type { Sale } from '@/lib/types';

interface Props {
  sale: Sale | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

export function SaleDetailDialog({ sale, open, onOpenChange }: Props) {
  const { businessInfo, receiptInfo } = useSettingsStore();
  const [busy, setBusy] = useState<string | null>(null);

  if (!sale) return null;

  const handleDownloadInvoice = async () => {
    setBusy('invoice');
    await downloadPDF({
      filename: `${sale.invoiceNo}-invoice.pdf`,
      component: (
        <InvoicePDF sale={sale} business={businessInfo} receiptFooter={receiptInfo.footerText} />
      ),
    });
    setBusy(null);
  };

  const handleDownloadReceipt = async () => {
    setBusy('receipt');
    await downloadPDF({
      filename: `${sale.invoiceNo}-receipt.pdf`,
      component: (
        <ReceiptPDF
          sale={sale}
          business={businessInfo}
          headerText={receiptInfo.headerText}
          footerText={receiptInfo.footerText}
          showCashier={receiptInfo.showCashier}
        />
      ),
    });
    setBusy(null);
  };

  const handlePrintInvoice = async () => {
    setBusy('print-invoice');
    await printPDF({
      component: (
        <InvoicePDF sale={sale} business={businessInfo} receiptFooter={receiptInfo.footerText} />
      ),
    });
    setBusy(null);
  };

  const handlePrintReceipt = async () => {
    setBusy('print-receipt');
    await printPDF({
      component: (
        <ReceiptPDF
          sale={sale}
          business={businessInfo}
          headerText={receiptInfo.headerText}
          footerText={receiptInfo.footerText}
          showCashier={receiptInfo.showCashier}
        />
      ),
    });
    setBusy(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between gap-3">
            <div>
              <DialogTitle className="flex items-center gap-2">
                {sale.invoiceNo}
                <StatusBadge variant={statusVariant(sale.status)}>{sale.status}</StatusBadge>
              </DialogTitle>
              <p className="text-xs text-muted-foreground mt-1">
                {formatDateTime(sale.date)} · Cashier: {sale.cashier}
              </p>
            </div>
          </div>
        </DialogHeader>

        {/* Customer + Payment */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="rounded-lg border p-3">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Customer
            </div>
            <div className="font-semibold text-sm mt-0.5">{sale.customerName}</div>
            {sale.customerId && (
              <div className="text-muted-foreground mt-0.5">{sale.customerId}</div>
            )}
          </div>
          <div className="rounded-lg border p-3">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Payment
            </div>
            <div className="font-semibold text-sm mt-0.5 uppercase">
              {sale.paymentMethod}
            </div>
            <div className="text-muted-foreground mt-0.5">
              {sale.due > 0 ? 'Partially Paid' : 'Paid'}
            </div>
          </div>
        </div>

        {/* Items */}
        <div className="rounded-lg border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/40">
              <tr className="text-xs uppercase tracking-wider text-muted-foreground">
                <th className="text-left font-semibold px-3 py-2">Item</th>
                <th className="text-right font-semibold px-3 py-2">Price</th>
                <th className="text-right font-semibold px-3 py-2">Qty</th>
                <th className="text-right font-semibold px-3 py-2">Disc</th>
                <th className="text-right font-semibold px-3 py-2">Total</th>
              </tr>
            </thead>
            <tbody>
              {sale.items.map((it, i) => (
                <tr key={i} className="border-t border-border">
                  <td className="px-3 py-2">
                    <div className="font-medium truncate max-w-[220px]">{it.name}</div>
                    <div className="text-[10px] text-muted-foreground">{it.sku}</div>
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums">
                    {formatCurrency(it.price)}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums">{it.qty}</td>
                  <td className="px-3 py-2 text-right tabular-nums text-red-600 dark:text-red-400">
                    {it.discount > 0 ? `-${formatCurrency(it.discount)}` : '—'}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums font-semibold">
                    {formatCurrency(it.subtotal)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="space-y-1.5 text-sm">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="tabular-nums">{formatCurrency(sale.subtotal)}</span>
          </div>
          {sale.discount > 0 && (
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Discount</span>
              <span className="tabular-nums text-red-600 dark:text-red-400">
                -{formatCurrency(sale.discount)}
              </span>
            </div>
          )}
          {sale.tax > 0 && (
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">VAT</span>
              <span className="tabular-nums">{formatCurrency(sale.tax)}</span>
            </div>
          )}
          <Separator />
          <div className="flex justify-between font-semibold">
            <span>Grand Total</span>
            <span className="tabular-nums text-brand-600 dark:text-brand-400">
              {formatCurrency(sale.total)}
            </span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Paid</span>
            <span className="tabular-nums">{formatCurrency(sale.paid)}</span>
          </div>
          {sale.due > 0 && (
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Due</span>
              <span className="tabular-nums font-semibold text-red-600 dark:text-red-400">
                {formatCurrency(sale.due)}
              </span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <Button
            variant="outline"
            className="h-10"
            onClick={handleDownloadInvoice}
            disabled={busy !== null}
          >
            <Download className="h-4 w-4 mr-2" />
            Invoice PDF
          </Button>
          <Button
            variant="outline"
            className="h-10"
            onClick={handleDownloadReceipt}
            disabled={busy !== null}
          >
            <Download className="h-4 w-4 mr-2" />
            Receipt PDF
          </Button>
          <Button
            variant="outline"
            className="h-10"
            onClick={handlePrintInvoice}
            disabled={busy !== null}
          >
            <Printer className="h-4 w-4 mr-2" />
            Print Invoice
          </Button>
          <Button
            variant="outline"
            className="h-10"
            onClick={handlePrintReceipt}
            disabled={busy !== null}
          >
            <Printer className="h-4 w-4 mr-2" />
            Print Receipt
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}