// app/(dashboard)/barcode/print/page.tsx

'use client';

import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Printer, Download, Search } from 'lucide-react';

import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { EmptyState } from '@/components/shared/empty-state';
import { useProductStore } from '@/lib/store/product-store';
import { downloadPDF, printPDF } from '@/components/pdf/pdf-download';
import { BarcodeLabelPDF } from '@/components/pdf/barcode-label-pdf';
import { BarcodePreview } from '@/components/barcode/barcode-preview';
import { cn } from '@/lib/utils';

export default function PrintLabelsPage() {
  const products = useProductStore((s) => s.products);

  const [query, setQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [copies, setCopies] = useState(1);
  const [showPrice, setShowPrice] = useState(true);
  const [showSku, setShowSku] = useState(true);
  const [showName, setShowName] = useState(true);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.barcode.includes(q)
    );
  }, [products, query]);

  const selectedProducts = useMemo(
    () => products.filter((p) => selectedIds.includes(p.id)),
    [products, selectedIds]
  );

  const toggle = (id: string) =>
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  const toggleAll = () => {
    if (selectedIds.length === filtered.length) setSelectedIds([]);
    else setSelectedIds(filtered.map((p) => p.id));
  };

  const download = async () => {
    if (!selectedProducts.length) {
      toast.error('Select at least one product');
      return;
    }
    await downloadPDF({
      filename: `labels-${new Date().toISOString().slice(0, 10)}.pdf`,
      component: (
        <BarcodeLabelPDF
          products={selectedProducts}
          copiesPerProduct={copies}
          showPrice={showPrice}
          showSku={showSku}
          showName={showName}
        />
      ),
    });
  };

  const print = async () => {
    if (!selectedProducts.length) {
      toast.error('Select at least one product');
      return;
    }
    await printPDF({
      component: (
        <BarcodeLabelPDF
          products={selectedProducts}
          copiesPerProduct={copies}
          showPrice={showPrice}
          showSku={showSku}
          showName={showName}
        />
      ),
    });
  };

  const totalLabels = selectedProducts.length * copies;
  const sheets = Math.ceil(totalLabels / 30);

  return (
    <div>
      <PageHeader
        title="Print Barcode Labels"
        description="Create print-ready A4 label sheets with EAN-13 barcodes."
        actions={
          <>
            <Button
              variant="outline"
              className="h-9"
              onClick={download}
              disabled={!selectedProducts.length}
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
            <Button
              className="h-9"
              onClick={print}
              disabled={!selectedProducts.length}
            >
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm">
              Products ({filtered.length})
            </CardTitle>
            <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={toggleAll}>
              {selectedIds.length === filtered.length ? 'Deselect all' : 'Select all'}
            </Button>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="relative mb-3">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-9 h-9"
              />
            </div>
            {filtered.length === 0 ? (
              <EmptyState title="No products match" className="py-8" />
            ) : (
              <ul className="max-h-[520px] overflow-y-auto divide-y divide-border -mx-2">
                {filtered.map((p) => {
                  const selected = selectedIds.includes(p.id);
                  return (
                    <li
                      key={p.id}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2.5 hover:bg-accent/50 transition cursor-pointer',
                        selected && 'bg-brand-500/5'
                      )}
                      onClick={() => toggle(p.id)}
                    >
                      <Checkbox checked={selected} onCheckedChange={() => toggle(p.id)} />
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium truncate">{p.name}</div>
                        <div className="text-xs text-muted-foreground truncate">
                          {p.sku} · {p.barcode}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Print Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="copies2">Copies per product</Label>
                <Input
                  id="copies2"
                  type="number"
                  min={1}
                  max={50}
                  value={copies}
                  onChange={(e) =>
                    setCopies(Math.max(1, Math.min(50, Number(e.target.value) || 1)))
                  }
                  className="h-9"
                />
              </div>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <Checkbox checked={showName} onCheckedChange={(v) => setShowName(!!v)} />
                  Name
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <Checkbox checked={showSku} onCheckedChange={(v) => setShowSku(!!v)} />
                  SKU
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <Checkbox checked={showPrice} onCheckedChange={(v) => setShowPrice(!!v)} />
                  Price
                </label>
              </div>

              <div className="rounded-lg border bg-muted/40 p-3 space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Products</span>
                  <span className="font-medium tabular-nums">
                    {selectedProducts.length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total labels</span>
                  <span className="font-medium tabular-nums">{totalLabels}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">A4 sheets</span>
                  <span className="font-medium tabular-nums">{sheets}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {selectedProducts.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <BarcodePreview value={selectedProducts[0].barcode} height={50} />
                <div className="text-xs text-center mt-2 truncate">
                  {selectedProducts[0].name}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}