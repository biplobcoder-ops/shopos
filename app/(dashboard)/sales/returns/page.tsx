// app/(dashboard)/sales/returns/page.tsx

'use client';

import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import {
  RotateCcw,
  Search,
  Check,
  X,
  PackageX,
  Loader2,
  AlertCircle,
} from 'lucide-react';

import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/shared/empty-state';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { BarcodeScanButton } from '@/components/shared/barcode-scan-button';
import { useSaleStore } from '@/lib/store/sale-store';
import { useProductStore } from '@/lib/store/product-store';
import { formatCurrency, formatDateTime } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { Sale, SaleItem } from '@/lib/types';

export default function SalesReturnsPage() {
  const { sales, returns, recordReturn } = useSaleStore();
  const products = useProductStore((s) => s.products);

  const [query, setQuery] = useState('');
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [selectedItems, setSelectedItems] = useState<Record<string, boolean>>({});
  const [qtyMap, setQtyMap] = useState<Record<string, number>>({});
  const [reason, setReason] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Only completed sales eligible for return
  const eligibleSales = useMemo(
    () => sales.filter((s) => s.status === 'completed'),
    [sales]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return eligibleSales;
    return eligibleSales.filter(
      (s) =>
        s.invoiceNo.toLowerCase().includes(q) ||
        s.customerName.toLowerCase().includes(q)
    );
  }, [eligibleSales, query]);

  const selectSale = (s: Sale) => {
    setSelectedSale(s);
    setSelectedItems({});
    const initialQty: Record<string, number> = {};
    s.items.forEach((it) => (initialQty[it.productId] = it.qty));
    setQtyMap(initialQty);
    setReason('');
  };

  const toggleItem = (productId: string) => {
    setSelectedItems((prev) => ({ ...prev, [productId]: !prev[productId] }));
  };

  const returnItems: SaleItem[] = useMemo(() => {
    if (!selectedSale) return [];
    return selectedSale.items
      .filter((it) => selectedItems[it.productId])
      .map((it) => {
        const qty = Math.min(it.qty, Math.max(1, qtyMap[it.productId] ?? it.qty));
        return {
          ...it,
          qty,
          subtotal: it.price * qty - it.discount,
        };
      });
  }, [selectedSale, selectedItems, qtyMap]);

  const returnTotal = returnItems.reduce((s, it) => s + it.subtotal, 0);

  /**
   * Handle barcode scan:
   * 1. Find product by barcode/SKU
   * 2. Find most recent completed sale that contains this product
   * 3. Auto-select that sale and tick the matched item
   */
  const handleBarcodeScan = (code: string) => {
    const trimmed = code.trim();
    const product =
      products.find((p) => p.barcode === trimmed) ||
      products.find((p) => p.sku.toLowerCase() === trimmed.toLowerCase());

    if (!product) {
      toast.error(`No product found for "${trimmed}"`);
      return;
    }

    // Find the most recent completed sale containing this product
    const match = eligibleSales
      .slice()
      .sort((a, b) => (a.date < b.date ? 1 : -1))
      .find((s) => s.items.some((it) => it.productId === product.id));

    if (!match) {
      toast.error(`No sale found containing ${product.name}`, {
        description: 'Cannot process return without a matching sale.',
      });
      return;
    }

    // Load the sale
    selectSale(match);

    // Auto-select the matched item
    setSelectedItems((prev) => ({ ...prev, [product.id]: true }));

    toast.success(`Matched: ${product.name}`, {
      description: `Invoice ${match.invoiceNo} · ${match.customerName}`,
    });
  };

  const handleSubmit = () => {
    if (!selectedSale) return;
    if (returnItems.length === 0) {
      toast.error('Select at least one item to return');
      return;
    }
    if (reason.trim().length < 3) {
      toast.error('Please provide a return reason');
      return;
    }
    setConfirmOpen(true);
  };

  const confirmReturn = () => {
    if (!selectedSale) return;
    setSubmitting(true);
    try {
      recordReturn({
        saleId: selectedSale.id,
        items: returnItems,
        reason: reason.trim(),
      });
      toast.success('Return recorded — stock restored');
      setSelectedSale(null);
      setSelectedItems({});
      setReason('');
      setConfirmOpen(false);
    } catch {
      toast.error('Failed to record return');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Sales Returns"
        description="Process returns and restore stock automatically."
        actions={
          <BarcodeScanButton
            onScan={handleBarcodeScan}
            label="Scan Product"
            variant="outline"
            className="h-9"
          />
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left: invoice picker */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Select Invoice</CardTitle>
              <div className="relative mt-2">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search invoice..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="pl-9 h-9"
                />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {filtered.length === 0 ? (
                <EmptyState
                  title="No eligible invoices"
                  description="Try scanning a product or clear filters."
                  className="py-8"
                />
              ) : (
                <ul className="max-h-[500px] overflow-y-auto -mx-2 divide-y divide-border">
                  {filtered.map((s) => (
                    <li
                      key={s.id}
                      onClick={() => selectSale(s)}
                      className={cn(
                        'px-3 py-2.5 cursor-pointer hover:bg-accent/50 transition',
                        selectedSale?.id === s.id && 'bg-brand-500/10'
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="text-sm font-medium">
                            {s.invoiceNo}
                          </div>
                          <div className="text-xs text-muted-foreground truncate">
                            {s.customerName}
                          </div>
                          <div className="text-[10px] text-muted-foreground mt-0.5">
                            {formatDateTime(s.date)}
                          </div>
                        </div>
                        <div className="text-sm font-semibold tabular-nums shrink-0">
                          {formatCurrency(s.total)}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right: return form */}
        <div className="lg:col-span-2">
          {!selectedSale ? (
            <Card>
              <CardContent className="p-6">
                <EmptyState
                  icon={RotateCcw}
                  title="No invoice selected"
                  description="Scan a product barcode or pick an invoice from the left to begin."
                />
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle className="text-sm">
                    Return from {selectedSale.invoiceNo}
                  </CardTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {selectedSale.customerName} ·{' '}
                    {formatDateTime(selectedSale.date)}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 text-xs"
                  onClick={() => setSelectedSale(null)}
                >
                  <X className="h-3.5 w-3.5 mr-1" />
                  Cancel
                </Button>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Items */}
                <div className="rounded-lg border overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/40">
                      <tr className="text-xs uppercase tracking-wider text-muted-foreground">
                        <th className="w-10 px-3 py-2"></th>
                        <th className="text-left font-semibold px-3 py-2">
                          Item
                        </th>
                        <th className="text-right font-semibold px-3 py-2">
                          Price
                        </th>
                        <th className="text-right font-semibold px-3 py-2">
                          Sold
                        </th>
                        <th className="text-right font-semibold px-3 py-2">
                          Return Qty
                        </th>
                        <th className="text-right font-semibold px-3 py-2">
                          Amount
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedSale.items.map((it) => {
                        const checked = !!selectedItems[it.productId];
                        const qty = qtyMap[it.productId] ?? it.qty;
                        return (
                          <tr
                            key={it.productId}
                            className={cn(
                              'border-t border-border',
                              checked && 'bg-brand-500/5'
                            )}
                          >
                            <td className="px-3 py-2">
                              <Checkbox
                                checked={checked}
                                onCheckedChange={() =>
                                  toggleItem(it.productId)
                                }
                              />
                            </td>
                            <td className="px-3 py-2">
                              <div className="font-medium truncate max-w-[200px]">
                                {it.name}
                              </div>
                              <div className="text-[10px] text-muted-foreground">
                                {it.sku}
                              </div>
                            </td>
                            <td className="px-3 py-2 text-right tabular-nums">
                              {formatCurrency(it.price)}
                            </td>
                            <td className="px-3 py-2 text-right tabular-nums">
                              {it.qty}
                            </td>
                            <td className="px-3 py-2 text-right">
                              <Input
                                type="number"
                                min={1}
                                max={it.qty}
                                disabled={!checked}
                                value={qty}
                                onChange={(e) =>
                                  setQtyMap((prev) => ({
                                    ...prev,
                                    [it.productId]: Math.min(
                                      it.qty,
                                      Math.max(
                                        1,
                                        Number(e.target.value) || 1
                                      )
                                    ),
                                  }))
                                }
                                className="h-8 w-20 ml-auto text-right tabular-nums"
                              />
                            </td>
                            <td className="px-3 py-2 text-right tabular-nums font-semibold">
                              {checked
                                ? formatCurrency(
                                    it.price * qty - it.discount
                                  )
                                : '—'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Reason */}
                <div className="space-y-1.5">
                  <Label htmlFor="reason">Reason for return *</Label>
                  <Textarea
                    id="reason"
                    rows={2}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="e.g. Damaged product, wrong item, customer request"
                  />
                </div>

                {/* Summary */}
                <div className="rounded-lg border bg-muted/40 p-3 flex items-center justify-between">
                  <div className="text-xs text-muted-foreground">
                    {returnItems.length} item
                    {returnItems.length === 1 ? '' : 's'} selected
                  </div>
                  <div className="text-lg font-bold tabular-nums">
                    {formatCurrency(returnTotal)}
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setSelectedSale(null)}
                    disabled={submitting}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleSubmit} disabled={submitting}>
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Record Return
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Returns History */}
      <div className="mt-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">
              Recent Returns ({returns.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {returns.length === 0 ? (
              <EmptyState title="No returns yet" className="py-8" />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/40">
                    <tr className="text-xs uppercase tracking-wider text-muted-foreground">
                      <th className="text-left font-semibold px-4 py-2.5">
                        Date
                      </th>
                      <th className="text-left font-semibold px-4 py-2.5">
                        Invoice
                      </th>
                      <th className="text-left font-semibold px-4 py-2.5 hidden md:table-cell">
                        Items
                      </th>
                      <th className="text-right font-semibold px-4 py-2.5">
                        Amount
                      </th>
                      <th className="text-left font-semibold px-4 py-2.5 hidden lg:table-cell">
                        Reason
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {returns.map((r) => (
                      <tr
                        key={r.id}
                        className="border-t border-border hover:bg-muted/30"
                      >
                        <td className="px-4 py-2.5 text-xs text-muted-foreground whitespace-nowrap">
                          {formatDateTime(r.date)}
                        </td>
                        <td className="px-4 py-2.5 font-medium">
                          {r.invoiceNo}
                        </td>
                        <td className="px-4 py-2.5 hidden md:table-cell text-muted-foreground">
                          {r.items.length} item
                          {r.items.length === 1 ? '' : 's'}
                        </td>
                        <td className="px-4 py-2.5 text-right tabular-nums font-semibold text-red-600 dark:text-red-400">
                          -{formatCurrency(r.amount)}
                        </td>
                        <td className="px-4 py-2.5 hidden lg:table-cell text-xs text-muted-foreground truncate max-w-[280px]">
                          {r.reason}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Confirm return?"
        description={`Return ${returnItems.length} item(s) worth ${formatCurrency(
          returnTotal
        )} from ${selectedSale?.invoiceNo}? Stock will be restored.`}
        confirmLabel="Confirm Return"
        loading={submitting}
        onConfirm={confirmReturn}
      />
    </div>
  );
}