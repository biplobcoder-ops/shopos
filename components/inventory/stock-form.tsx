// components/inventory/stock-form.tsx

'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import {
  Loader2,
  Save,
  ArrowDownToLine,
  ArrowUpFromLine,
  SlidersHorizontal,
  Search,
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { BarcodeScanButton } from '@/components/shared/barcode-scan-button';
import { useProductStore } from '@/lib/store/product-store';
import { useStockStore } from '@/lib/store/stock-store';
import { formatCurrency } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { MovementType, Product } from '@/lib/types';

type Mode = 'stock-in' | 'stock-out' | 'adjustment';

interface Props {
  mode: Mode;
}

const COPY: Record<
  Mode,
  { title: string; subtitle: string; type: MovementType; signedLabel: string }
> = {
  'stock-in': {
    title: 'Stock In',
    subtitle: 'Add incoming stock to a product.',
    type: 'stock-in',
    signedLabel: 'Quantity to add',
  },
  'stock-out': {
    title: 'Stock Out',
    subtitle: 'Remove stock from a product.',
    type: 'stock-out',
    signedLabel: 'Quantity to remove',
  },
  adjustment: {
    title: 'Stock Adjustment',
    subtitle: 'Set the final stock level to a specific number.',
    type: 'adjustment',
    signedLabel: 'New stock value',
  },
};

export function StockForm({ mode }: Props) {
  const products = useProductStore((s) => s.products);
  const record = useStockStore((s) => s.record);
  const copy = COPY[mode];

  const [productId, setProductId] = useState<string>('');
  const [qty, setQty] = useState<string>('');
  const [reason, setReason] = useState('');
  const [reference, setReference] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);

  const selected = products.find((p) => p.id === productId);

  /** Handle scanned barcode — find product and auto-select */
  const handleBarcodeScan = (code: string) => {
    const trimmed = code.trim();
    const found =
      products.find((p) => p.barcode === trimmed) ||
      products.find((p) => p.sku.toLowerCase() === trimmed.toLowerCase());

    if (!found) {
      toast.error(`No product found for "${trimmed}"`);
      return;
    }
    setProductId(found.id);
    toast.success(`Selected: ${found.name}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) {
      toast.error('Select a product');
      return;
    }
    const q = Number(qty);
    if (!q || q <= 0) {
      toast.error('Enter a valid quantity');
      return;
    }
    if (mode === 'stock-out' && q > selected.stock) {
      toast.error(`Only ${selected.stock} units available`);
      return;
    }
    if (mode === 'adjustment' && reason.trim().length < 3) {
      toast.error('Reason is required for adjustment');
      return;
    }

    setSubmitting(true);
    try {
      let delta = 0;
      if (mode === 'stock-in') delta = q;
      else if (mode === 'stock-out') delta = -q;
      else delta = q - selected.stock;

      if (delta === 0) {
        toast.info('Stock level unchanged');
        setSubmitting(false);
        return;
      }

      record({
        productId: selected.id,
        type: copy.type,
        qty: delta,
        reference:
          reference.trim() ||
          `${copy.type.toUpperCase()}-${Date.now().toString().slice(-6)}`,
        note: reason.trim() || undefined,
        user: 'current-user',
      });

      toast.success(`${copy.title} recorded for ${selected.name}`);
      setQty('');
      setReason('');
      setReference('');
      setProductId('');
    } catch {
      toast.error('Failed to record movement');
    } finally {
      setSubmitting(false);
    }
  };

  const Icon =
    mode === 'stock-in'
      ? ArrowDownToLine
      : mode === 'stock-out'
      ? ArrowUpFromLine
      : SlidersHorizontal;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Icon className="h-4 w-4 text-brand-500" />
              {copy.title}
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              {copy.subtitle}
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Barcode Scan Row */}
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="flex-1">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Scan or Select Product
                  </Label>
                </div>
              </div>

              <div className="flex gap-2">
                {/* Product Picker */}
                <Popover open={pickerOpen} onOpenChange={setPickerOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      role="combobox"
                      className="flex-1 justify-start h-10 font-normal"
                    >
                      <Search className="h-4 w-4 mr-2 text-muted-foreground shrink-0" />
                      <span
                        className={cn(
                          'truncate',
                          !selected && 'text-muted-foreground'
                        )}
                      >
                        {selected
                          ? selected.name
                          : 'Search or select product...'}
                      </span>
                      {selected && (
                        <span className="ml-auto text-xs text-muted-foreground tabular-nums shrink-0">
                          {selected.stock} {selected.unit}
                        </span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[400px] p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Search by name, SKU or barcode..." />
                      <CommandList>
                        <CommandEmpty>No products found.</CommandEmpty>
                        <CommandGroup>
                          {products.map((p) => (
                            <CommandItem
                              key={p.id}
                              value={`${p.name} ${p.sku} ${p.barcode}`}
                              onSelect={() => {
                                setProductId(p.id);
                                setPickerOpen(false);
                              }}
                            >
                              <div className="flex items-center justify-between gap-3 w-full">
                                <div className="min-w-0">
                                  <div className="text-sm truncate">
                                    {p.name}
                                  </div>
                                  <div className="text-[10px] text-muted-foreground">
                                    {p.sku} · {p.barcode}
                                  </div>
                                </div>
                                <div className="text-xs text-muted-foreground tabular-nums shrink-0">
                                  {p.stock} {p.unit}
                                </div>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>

                {/* Camera Scan Button */}
                <BarcodeScanButton
                  onScan={handleBarcodeScan}
                  label="Scan"
                  variant="outline"
                  size="default"
                  className="h-10 shrink-0"
                />
              </div>

              {selected && (
                <div className="rounded-lg border bg-muted/40 p-3 grid grid-cols-3 gap-3 text-xs">
                  <div>
                    <div className="text-muted-foreground">SKU</div>
                    <div className="font-medium mt-0.5">{selected.sku}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Barcode</div>
                    <div className="font-mono text-[10px] mt-0.5 truncate">
                      {selected.barcode}
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Current Stock</div>
                    <div className="font-semibold tabular-nums mt-0.5">
                      {selected.stock} {selected.unit}
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="qty">{copy.signedLabel} *</Label>
                  <Input
                    id="qty"
                    type="number"
                    min={mode === 'adjustment' ? 0 : 1}
                    value={qty}
                    onChange={(e) => setQty(e.target.value)}
                    placeholder={
                      mode === 'adjustment'
                        ? String(selected?.stock ?? 0)
                        : '0'
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="reference">Reference</Label>
                  <Input
                    id="reference"
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                    placeholder="Optional e.g. INV-1234, ADJ-001"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="reason">
                  {mode === 'adjustment' ? 'Reason *' : 'Note'}
                </Label>
                <Textarea
                  id="reason"
                  rows={2}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder={
                    mode === 'adjustment'
                      ? 'e.g. Damaged in transit / Found in stock count'
                      : 'Optional note'
                  }
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <Button type="submit" disabled={submitting || !selected}>
                  {submitting && (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  )}
                  <Save className="h-4 w-4 mr-2" />
                  Record {copy.title}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setProductId('');
                    setQty('');
                    setReason('');
                    setReference('');
                  }}
                >
                  Reset
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Preview Panel */}
      <div>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Preview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {!selected ? (
              <div className="text-xs text-muted-foreground text-center py-6">
                Scan or select a product to preview
              </div>
            ) : (
              <>
                <div className="text-sm font-medium truncate">
                  {selected.name}
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Current</span>
                  <span className="tabular-nums font-medium">
                    {selected.stock} {selected.unit}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Change</span>
                  <span
                    className={cn(
                      'tabular-nums font-medium',
                      (() => {
                        const q = Number(qty);
                        if (!q) return '';
                        let d = 0;
                        if (mode === 'stock-in') d = q;
                        else if (mode === 'stock-out') d = -q;
                        else d = q - selected.stock;
                        return d > 0
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : d < 0
                          ? 'text-red-600 dark:text-red-400'
                          : '';
                      })()
                    )}
                  >
                    {(() => {
                      const q = Number(qty);
                      if (!q) return '—';
                      let d = 0;
                      if (mode === 'stock-in') d = q;
                      else if (mode === 'stock-out') d = -q;
                      else d = q - selected.stock;
                      return d > 0 ? `+${d}` : d;
                    })()}
                  </span>
                </div>
                <div className="border-t pt-2 flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">New stock</span>
                  <span className="tabular-nums font-bold">
                    {(() => {
                      const q = Number(qty);
                      if (!q) return selected.stock;
                      let next = selected.stock;
                      if (mode === 'stock-in') next += q;
                      else if (mode === 'stock-out') next -= q;
                      else next = q;
                      return Math.max(0, next);
                    })()}{' '}
                    {selected.unit}
                  </span>
                </div>
                <div className="pt-2 border-t text-xs flex items-center justify-between">
                  <span className="text-muted-foreground">Price</span>
                  <span className="tabular-nums font-medium">
                    {formatCurrency(selected.sellingPrice)}
                  </span>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}