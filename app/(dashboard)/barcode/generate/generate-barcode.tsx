// app/(dashboard)/barcode/generate/generate-barcode.tsx

'use client';

import { useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { Download, Printer, RefreshCw, Search, X } from 'lucide-react';

import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { EmptyState } from '@/components/shared/empty-state';
import { BarcodePreview } from '@/components/barcode/barcode-preview';
import { useProductStore } from '@/lib/store/product-store';
import { downloadPDF, printPDF } from '@/components/pdf/pdf-download';
import { BarcodeLabelPDF } from '@/components/pdf/barcode-label-pdf';
import type { Product } from '@/lib/types';
import { cn } from '@/lib/utils';

export function GenerateBarcode() {
  const search = useSearchParams();
  const products = useProductStore((s) => s.products);
  const updateProduct = useProductStore((s) => s.updateProduct);

  const initialProductId = search.get('product');

  const [query, setQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>(
    initialProductId ? [initialProductId] : []
  );
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

  const toggle = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleGenerate = (p: Product) => {
    const rand = () => Math.floor(Math.random() * 10);
    const base = '890' + Array.from({ length: 9 }).map(rand).join('');
    updateProduct(p.id, { barcode: base.padEnd(12, '0').slice(0, 12) });
    toast.success(`New barcode generated for ${p.name}`);
  };

  const handleDownload = async () => {
    if (!selectedProducts.length) {
      toast.error('Select at least one product');
      return;
    }
    await downloadPDF({
      filename: `barcode-labels-${new Date().toISOString().slice(0, 10)}.pdf`,
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

  const handlePrint = async () => {
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

  return (
    <div>
      <PageHeader
        title="Generate Barcodes"
        description="Select products, preview EAN-13 codes, and export printable label sheets."
        actions={
          <>
            <Button
              variant="outline"
              className="h-9"
              onClick={handlePrint}
              disabled={!selectedProducts.length}
            >
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
            <Button
              className="h-9"
              onClick={handleDownload}
              disabled={!selectedProducts.length}
            >
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">
                Products ({filtered.length})
              </CardTitle>
              <div className="relative mt-2">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="pl-9 h-9"
                />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {filtered.length === 0 ? (
                <EmptyState title="No products match" className="py-8" />
              ) : (
                <ul className="max-h-[500px] overflow-y-auto divide-y divide-border -mx-2">
                  {filtered.map((p) => {
                    const selected = selectedIds.includes(p.id);
                    return (
                      <li
                        key={p.id}
                        className={cn(
                          'flex items-center gap-3 px-3 py-2.5 hover:bg-accent/50 transition',
                          selected && 'bg-brand-500/5'
                        )}
                      >
                        <Checkbox
                          checked={selected}
                          onCheckedChange={() => toggle(p.id)}
                        />
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-medium truncate">
                            {p.name}
                          </div>
                          <div className="text-xs text-muted-foreground truncate">
                            {p.sku} · {p.barcode}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 shrink-0"
                          title="Regenerate barcode"
                          onClick={() => handleGenerate(p)}
                        >
                          <RefreshCw className="h-3.5 w-3.5" />
                        </Button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Label Options</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="copies">Copies per product</Label>
                <Input
                  id="copies"
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
              <div className="space-y-2 pt-1">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <Checkbox
                    checked={showName}
                    onCheckedChange={(v) => setShowName(!!v)}
                  />
                  Show product name
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <Checkbox
                    checked={showSku}
                    onCheckedChange={(v) => setShowSku(!!v)}
                  />
                  Show SKU
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <Checkbox
                    checked={showPrice}
                    onCheckedChange={(v) => setShowPrice(!!v)}
                  />
                  Show price
                </label>
              </div>
              <div className="text-xs text-muted-foreground pt-1">
                {selectedProducts.length} product
                {selectedProducts.length === 1 ? '' : 's'} selected ·{' '}
                {selectedProducts.length * copies} label
                {selectedProducts.length * copies === 1 ? '' : 's'} to print
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Preview</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedProducts.length === 0 ? (
                <div className="text-xs text-muted-foreground text-center py-6">
                  Select a product to preview
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="text-xs text-muted-foreground">
                    First selected: {selectedProducts[0].name}
                  </div>
                  <BarcodePreview
                    value={selectedProducts[0].barcode}
                    height={50}
                    fontSize={12}
                  />
                  <div className="text-[10px] text-center text-muted-foreground">
                    A4 sheet fits 30 labels (3 × 10 grid)
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {selectedIds.length > 0 && (
            <Button
              variant="ghost"
              className="w-full h-9 text-xs"
              onClick={() => setSelectedIds([])}
            >
              <X className="h-3.5 w-3.5 mr-1" />
              Clear selection
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}