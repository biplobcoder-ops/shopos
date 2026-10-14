// app/(dashboard)/purchase/create/page.tsx

'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  Plus,
  Trash2,
  Save,
  Package,
  UserPlus,
  Search,
} from 'lucide-react';

import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
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
import { EmptyState } from '@/components/shared/empty-state';
import { useProductStore } from '@/lib/store/product-store';
import { useSupplierStore } from '@/lib/store/supplier-store';
import { usePurchaseStore } from '@/lib/store/purchase-store';
import { useSettingsStore } from '@/lib/store/settings-store';
import { useSession } from 'next-auth/react';
import { formatCurrency } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { PurchaseItem, Product } from '@/lib/types';

interface DraftItem extends PurchaseItem {
  stock: number;
}

export default function CreatePurchasePage() {
  const router = useRouter();
  const products = useProductStore((s) => s.products);
  const { suppliers, add: addSupplier } = useSupplierStore();
  const createPurchase = usePurchaseStore((s) => s.createPurchase);
  const { taxInfo } = useSettingsStore();
  const { data: session } = useSession();

  const [supplierId, setSupplierId] = useState<string>('');
  const [items, setItems] = useState<DraftItem[]>([]);
  const [discount, setDiscount] = useState<number>(0);
  const [taxRate, setTaxRate] = useState<number>(
    taxInfo.enabled ? taxInfo.rate : 0
  );
  const [paidStr, setPaidStr] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [productPickerOpen, setProductPickerOpen] = useState(false);
  const [productQuery, setProductQuery] = useState('');
  const [creatingSupplier, setCreatingSupplier] = useState(false);
  const [newSupplierName, setNewSupplierName] = useState('');
  const [newSupplierPhone, setNewSupplierPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const selectedSupplier = suppliers.find((s) => s.id === supplierId);

  const filteredProducts = useMemo(() => {
    const q = productQuery.trim().toLowerCase();
    if (!q) return products.slice(0, 50);
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.barcode.includes(q)
    );
  }, [products, productQuery]);

  const addProductToDraft = (p: Product) => {
    setItems((prev) => {
      const existing = prev.find((it) => it.productId === p.id);
      if (existing) {
        return prev.map((it) =>
          it.productId === p.id
            ? {
                ...it,
                qty: it.qty + 1,
                subtotal: (it.qty + 1) * it.purchasePrice,
              }
            : it
        );
      }
      return [
        ...prev,
        {
          productId: p.id,
          name: p.name,
          sku: p.sku,
          purchasePrice: p.purchasePrice,
          qty: 1,
          subtotal: p.purchasePrice,
          stock: p.stock,
        },
      ];
    });
    setProductPickerOpen(false);
    setProductQuery('');
  };

  /** Handle barcode scan — auto-add product to purchase items */
  const handleBarcodeScan = (code: string) => {
    const trimmed = code.trim();
    const found =
      products.find((p) => p.barcode === trimmed) ||
      products.find((p) => p.sku.toLowerCase() === trimmed.toLowerCase());

    if (!found) {
      toast.error(`No product found for "${trimmed}"`);
      return;
    }
    addProductToDraft(found);
    toast.success(`Added: ${found.name}`);
  };

  const updateItem = (productId: string, patch: Partial<DraftItem>) => {
    setItems((prev) =>
      prev.map((it) => {
        if (it.productId !== productId) return it;
        const next = { ...it, ...patch };
        next.subtotal = next.qty * next.purchasePrice;
        return next;
      })
    );
  };

  const removeItem = (productId: string) => {
    setItems((prev) => prev.filter((it) => it.productId !== productId));
  };

  const subtotal = items.reduce((s, it) => s + it.subtotal, 0);
  const taxAmount = Math.round((subtotal - discount) * (taxRate / 100) * 100) / 100;
  const total = Math.max(0, subtotal - discount + taxAmount);
  const paid = paidStr === '' ? total : Number(paidStr) || 0;
  const due = Math.max(0, total - paid);

  const handleCreateSupplier = () => {
    const name = newSupplierName.trim();
    if (!name) {
      toast.error('Supplier name required');
      return;
    }
    const created = addSupplier({
      name,
      phone: newSupplierPhone.trim() || '—',
      due: 0,
      paid: 0,
      totalPurchase: 0,
    });
    setSupplierId(created.id);
    setCreatingSupplier(false);
    setNewSupplierName('');
    setNewSupplierPhone('');
    toast.success('Supplier created');
  };

  const handleSubmit = () => {
    if (!supplierId || !selectedSupplier) {
      toast.error('Select a supplier');
      return;
    }
    if (items.length === 0) {
      toast.error('Add at least one product');
      return;
    }
    if (items.some((it) => it.qty < 1)) {
      toast.error('Quantity must be at least 1');
      return;
    }
    if (paid < 0) {
      toast.error('Invalid paid amount');
      return;
    }

    setSubmitting(true);
    try {
      const purchase = createPurchase({
        supplierId: selectedSupplier.id,
        supplierName: selectedSupplier.name,
        items: items.map(({ stock, ...rest }) => rest),
        subtotal,
        discount,
        tax: taxAmount,
        total,
        paid,
        notes: notes.trim() || undefined,
        user: session?.user?.email ?? 'system',
      });
      toast.success(`Purchase created · ${purchase.purchaseNo}`);
      router.push('/purchase');
    } catch {
      toast.error('Failed to create purchase');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Create Purchase"
        description="Add products with cost and quantity. Stock is updated automatically."
        actions={
          <Button
            variant="ghost"
            className="h-9"
            onClick={() => router.push('/purchase')}
          >
            Cancel
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left: supplier + items */}
        <div className="lg:col-span-2 space-y-4">
          {/* Supplier */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Supplier</CardTitle>
            </CardHeader>
            <CardContent>
              {!creatingSupplier ? (
                <div className="flex gap-2">
                  <Select value={supplierId} onValueChange={setSupplierId}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select supplier" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px]">
                      {suppliers.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          <div className="flex items-center justify-between gap-3 w-full">
                            <span className="truncate">{s.name}</span>
                            <span className="text-xs text-muted-foreground">
                              {s.phone}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    onClick={() => setCreatingSupplier(true)}
                    title="Add new supplier"
                  >
                    <UserPlus className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    New Supplier
                  </div>
                  <Input
                    placeholder="Supplier name *"
                    value={newSupplierName}
                    onChange={(e) => setNewSupplierName(e.target.value)}
                    className="h-9"
                  />
                  <Input
                    placeholder="Phone"
                    value={newSupplierPhone}
                    onChange={(e) => setNewSupplierPhone(e.target.value)}
                    className="h-9"
                  />
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 h-8"
                      onClick={() => setCreatingSupplier(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1 h-8"
                      onClick={handleCreateSupplier}
                    >
                      Create Supplier
                    </Button>
                  </div>
                </div>
              )}

              {selectedSupplier && (
                <div className="mt-3 rounded-lg border bg-muted/40 p-3 grid grid-cols-3 gap-3 text-xs">
                  <div>
                    <div className="text-muted-foreground">Phone</div>
                    <div className="font-medium mt-0.5">
                      {selectedSupplier.phone}
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Current Due</div>
                    <div className="font-semibold tabular-nums mt-0.5 text-red-600 dark:text-red-400">
                      {formatCurrency(selectedSupplier.due)}
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Total Purchase</div>
                    <div className="font-medium tabular-nums mt-0.5">
                      {formatCurrency(selectedSupplier.totalPurchase)}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Items */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <CardTitle className="text-sm">
                  Purchase Items ({items.length})
                </CardTitle>
                <div className="flex items-center gap-2">
                  {/* Barcode Scan Button */}
                  <BarcodeScanButton
                    onScan={handleBarcodeScan}
                    label="Scan"
                    variant="default"
                    size="sm"
                    className="h-8"
                  />

                  {/* Add Product Picker */}
                  <Popover
                    open={productPickerOpen}
                    onOpenChange={setProductPickerOpen}
                  >
                    <PopoverTrigger asChild>
                      <Button size="sm" variant="outline" className="h-8">
                        <Plus className="h-3.5 w-3.5 mr-1" />
                        Add Product
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[380px] p-0" align="end">
                      <Command shouldFilter={false}>
                        <CommandInput
                          placeholder="Search products..."
                          value={productQuery}
                          onValueChange={setProductQuery}
                        />
                        <CommandList>
                          <CommandEmpty>No products found.</CommandEmpty>
                          <CommandGroup>
                            {filteredProducts.map((p) => (
                              <CommandItem
                                key={p.id}
                                value={p.id}
                                onSelect={() => addProductToDraft(p)}
                              >
                                <div className="flex items-center justify-between gap-3 w-full">
                                  <div className="min-w-0">
                                    <div className="text-sm truncate">
                                      {p.name}
                                    </div>
                                    <div className="text-[10px] text-muted-foreground">
                                      {p.sku} · stock {p.stock}
                                    </div>
                                  </div>
                                  <div className="text-xs font-semibold tabular-nums shrink-0">
                                    {formatCurrency(p.purchasePrice)}
                                  </div>
                                </div>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {items.length === 0 ? (
                <EmptyState
                  icon={Package}
                  title="No items yet"
                  description='Scan a barcode or click "Add Product" to start.'
                  className="py-8"
                />
              ) : (
                <div className="rounded-lg border overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-muted/40">
                        <tr className="text-xs uppercase tracking-wider text-muted-foreground">
                          <th className="text-left font-semibold px-3 py-2">
                            Item
                          </th>
                          <th className="text-right font-semibold px-3 py-2">
                            Cost
                          </th>
                          <th className="text-right font-semibold px-3 py-2">
                            Qty
                          </th>
                          <th className="text-right font-semibold px-3 py-2">
                            Subtotal
                          </th>
                          <th className="w-10"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {items.map((it) => (
                          <tr
                            key={it.productId}
                            className="border-t border-border"
                          >
                            <td className="px-3 py-2">
                              <div className="font-medium truncate max-w-[260px]">
                                {it.name}
                              </div>
                              <div className="text-[10px] text-muted-foreground">
                                {it.sku} · stock {it.stock}
                              </div>
                            </td>
                            <td className="px-3 py-2 text-right">
                              <Input
                                type="number"
                                min={0}
                                step="0.01"
                                value={it.purchasePrice}
                                onChange={(e) =>
                                  updateItem(it.productId, {
                                    purchasePrice:
                                      Number(e.target.value) || 0,
                                  })
                                }
                                className="h-8 w-24 ml-auto text-right tabular-nums"
                              />
                            </td>
                            <td className="px-3 py-2 text-right">
                              <Input
                                type="number"
                                min={1}
                                value={it.qty}
                                onChange={(e) =>
                                  updateItem(it.productId, {
                                    qty: Math.max(
                                      1,
                                      Number(e.target.value) || 1
                                    ),
                                  })
                                }
                                className="h-8 w-20 ml-auto text-right tabular-nums"
                              />
                            </td>
                            <td className="px-3 py-2 text-right tabular-nums font-semibold">
                              {formatCurrency(it.subtotal)}
                            </td>
                            <td className="px-2 py-2 text-right">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-red-500 hover:text-red-500 hover:bg-red-500/10"
                                onClick={() => removeItem(it.productId)}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right: summary */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="tabular-nums font-medium">
                  {formatCurrency(subtotal)}
                </span>
              </div>

              <div className="flex items-center justify-between text-sm gap-2">
                <span className="text-muted-foreground">Discount</span>
                <Input
                  type="number"
                  min={0}
                  value={discount || ''}
                  onChange={(e) => setDiscount(Number(e.target.value) || 0)}
                  placeholder="0"
                  className="h-8 w-28 text-right tabular-nums"
                />
              </div>

              <div className="flex items-center justify-between text-sm gap-2">
                <span className="text-muted-foreground">GST %</span>
                <Input
                  type="number"
                  min={0}
                  max={50}
                  value={taxRate}
                  onChange={(e) => setTaxRate(Number(e.target.value) || 0)}
                  className="h-8 w-28 text-right tabular-nums"
                />
              </div>

              {taxAmount > 0 && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">GST amount</span>
                  <span className="tabular-nums">
                    {formatCurrency(taxAmount)}
                  </span>
                </div>
              )}

              <Separator />

              <div className="flex items-center justify-between">
                <span className="font-semibold">Total</span>
                <span className="text-lg font-bold tabular-nums text-amber-600 dark:text-amber-400">
                  {formatCurrency(total)}
                </span>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="paid">Paid Amount</Label>
                <Input
                  id="paid"
                  type="number"
                  min={0}
                  step="0.01"
                  value={paidStr}
                  onChange={(e) => setPaidStr(e.target.value)}
                  placeholder={String(total)}
                  className="h-9 text-right tabular-nums"
                />
                <div className="flex gap-1.5 flex-wrap">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs"
                    onClick={() => setPaidStr(total.toFixed(2))}
                  >
                    Full
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs"
                    onClick={() => setPaidStr('0')}
                  >
                    None
                  </Button>
                </div>
              </div>

              <div className="rounded-lg border p-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Due</span>
                  <span
                    className={cn(
                      'tabular-nums font-semibold',
                      due > 0
                        ? 'text-red-600 dark:text-red-400'
                        : 'text-muted-foreground'
                    )}
                  >
                    {formatCurrency(due)}
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Optional"
                />
              </div>

              <Button
                className="w-full h-10"
                onClick={handleSubmit}
                disabled={submitting || items.length === 0 || !supplierId}
              >
                <Save className="h-4 w-4 mr-2" />
                {submitting ? 'Creating...' : 'Create Purchase'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}