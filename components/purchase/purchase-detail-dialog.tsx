// components/purchase/purchase-detail-dialog.tsx

'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { StatusBadge, statusVariant } from '@/components/shared/status-badge';
import { formatCurrency, formatDateTime } from '@/lib/format';
import type { Purchase } from '@/lib/types';

interface Props {
  purchase: Purchase | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

export function PurchaseDetailDialog({ purchase, open, onOpenChange }: Props) {
  if (!purchase) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {purchase.purchaseNo}
            <StatusBadge variant={statusVariant(purchase.status)}>
              {purchase.status}
            </StatusBadge>
          </DialogTitle>
          <p className="text-xs text-muted-foreground mt-1">
            {formatDateTime(purchase.date)}
          </p>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="rounded-lg border p-3">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Supplier
            </div>
            <div className="font-semibold text-sm mt-0.5">
              {purchase.supplierName}
            </div>
            <div className="text-muted-foreground mt-0.5">{purchase.supplierId}</div>
          </div>
          <div className="rounded-lg border p-3">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Payment
            </div>
            <div className="font-semibold text-sm mt-0.5">
              {purchase.due > 0 ? 'Partially Paid' : 'Paid'}
            </div>
            <div className="text-muted-foreground mt-0.5">
              Paid: {formatCurrency(purchase.paid)}
            </div>
          </div>
        </div>

        <div className="rounded-lg border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/40">
              <tr className="text-xs uppercase tracking-wider text-muted-foreground">
                <th className="text-left font-semibold px-3 py-2">Item</th>
                <th className="text-right font-semibold px-3 py-2">Cost</th>
                <th className="text-right font-semibold px-3 py-2">Qty</th>
                <th className="text-right font-semibold px-3 py-2">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {purchase.items.map((it, i) => (
                <tr key={i} className="border-t border-border">
                  <td className="px-3 py-2">
                    <div className="font-medium truncate max-w-[240px]">{it.name}</div>
                    <div className="text-[10px] text-muted-foreground">{it.sku}</div>
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums">
                    {formatCurrency(it.purchasePrice)}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums">{it.qty}</td>
                  <td className="px-3 py-2 text-right tabular-nums font-semibold">
                    {formatCurrency(it.subtotal)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="space-y-1.5 text-sm">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="tabular-nums">{formatCurrency(purchase.subtotal)}</span>
          </div>
          {purchase.discount > 0 && (
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Discount</span>
              <span className="tabular-nums text-red-600 dark:text-red-400">
                -{formatCurrency(purchase.discount)}
              </span>
            </div>
          )}
          {purchase.tax > 0 && (
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">VAT</span>
              <span className="tabular-nums">{formatCurrency(purchase.tax)}</span>
            </div>
          )}
          <Separator />
          <div className="flex justify-between font-semibold">
            <span>Total</span>
            <span className="tabular-nums text-amber-600 dark:text-amber-400">
              {formatCurrency(purchase.total)}
            </span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Paid</span>
            <span className="tabular-nums">{formatCurrency(purchase.paid)}</span>
          </div>
          {purchase.due > 0 && (
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Due</span>
              <span className="tabular-nums font-semibold text-red-600 dark:text-red-400">
                {formatCurrency(purchase.due)}
              </span>
            </div>
          )}
        </div>

        {purchase.notes && (
          <div className="rounded-lg border bg-muted/40 p-3 text-xs">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
              Notes
            </div>
            <div>{purchase.notes}</div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}