// components/pos/sale-success-modal.tsx

'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Check, Download, Printer, Plus } from 'lucide-react';
import { downloadPDF, printPDF } from '@/components/pdf/pdf-download';
import { InvoicePDF } from '@/components/pdf/invoice-pdf';
import { ReceiptPDF } from '@/components/pdf/receipt-pdf';
import { useSettingsStore } from '@/lib/store/settings-store';
import type { Sale } from '@/lib/types';
import { formatCurrency } from '@/lib/format';

interface Props {
  sale: Sale | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

export function SaleSuccessModal({ sale, open, onOpenChange }: Props) {
  const { businessInfo, receiptInfo } = useSettingsStore();
  const [busy, setBusy] = useState<'invoice' | 'receipt' | 'print-invoice' | 'print-receipt' | null>(null);

  if (!sale) return null;

  const handleDownloadInvoice = async () => {
    setBusy('invoice');
    await downloadPDF({
      filename: `${sale.invoiceNo}-invoice.pdf`,
      component: (
        <InvoicePDF
          sale={sale}
          business={businessInfo}
          receiptFooter={receiptInfo.footerText}
        />
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
        <InvoicePDF
          sale={sale}
          business={businessInfo}
          receiptFooter={receiptInfo.footerText}
        />
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
      <DialogContent className="sm:max-w-md">
        <div className="flex flex-col items-center text-center pt-2">
          <div className="h-14 w-14 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-3">
            <Check className="h-7 w-7" />
          </div>
          <DialogTitle className="text-lg">Sale Complete</DialogTitle>
          <DialogDescription className="mt-1">
            {sale.invoiceNo} · {sale.customerName}
          </DialogDescription>
          <div className="mt-3 text-2xl font-bold tabular-nums text-brand-600 dark:text-brand-400">
            {formatCurrency(sale.total)}
          </div>
          {sale.due > 0 && (
            <div className="mt-1 text-xs text-red-600 dark:text-red-400">
              Due: {formatCurrency(sale.due)}
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2 mt-2">
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

        <Button
          className="h-11 w-full mt-1"
          onClick={() => onOpenChange(false)}
        >
          <Plus className="h-4 w-4 mr-2" />
          New Sale
        </Button>
      </DialogContent>
    </Dialog>
  );
}