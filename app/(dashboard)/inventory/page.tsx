// app/(dashboard)/inventory/page.tsx

'use client';

import { useMemo, useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  SlidersHorizontal,
  History,
  AlertTriangle,
  PackageX,
  Warehouse,
  Search,
  X,
} from 'lucide-react';

import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StatusBadge } from '@/components/shared/status-badge';
import { EmptyState } from '@/components/shared/empty-state';
import { BarcodeScanButton } from '@/components/shared/barcode-scan-button';
import { useProductStore } from '@/lib/store/product-store';
import { formatCurrency } from '@/lib/format';
import { getStockStatus, cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function InventoryPage() {
  const products = useProductStore((s) => s.products);
  const categories = useProductStore((s) => s.categories);

  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<string>('all');
  const [tab, setTab] = useState<'all' | 'low' | 'out' | 'healthy'>('all');
  const [scannedProductId, setScannedProductId] = useState<string>('');

  const tableRef = useRef<HTMLDivElement>(null);

  const stats = useMemo(() => {
    const totalValue = products.reduce(
      (s, p) => s + p.stock * p.purchasePrice,
      0
    );
    const totalUnits = products.reduce((s, p) => s + p.stock, 0);
    const low = products.filter(
      (p) => p.stock > 0 && p.stock <= p.minStock
    ).length;
    const out = products.filter((p) => p.stock <= 0).length;
    return { totalValue, totalUnits, low, out };
  }, [products]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((p) => {
      if (tab === 'low' && !(p.stock > 0 && p.stock <= p.minStock))
        return false;
      if (tab === 'out' && p.stock > 0) return false;
      if (tab === 'healthy' && p.stock <= p.minStock) return false;
      if (category !== 'all' && p.category !== category) return false;
      if (scannedProductId && p.id !== scannedProductId) return false;
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.barcode.includes(q)
      );
    });
  }, [products, query, category, tab, scannedProductId]);

  /** Scroll to scanned product after render */
  useEffect(() => {
    if (scannedProductId && tableRef.current) {
      const row = tableRef.current.querySelector(
        `[data-product-id="${scannedProductId}"]`
      );
      if (row) {
        (row as HTMLElement).scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }
    }
  }, [scannedProductId, filtered]);

  const handleBarcodeScan = (code: string) => {
    const trimmed = code.trim();
    const found =
      products.find((p) => p.barcode === trimmed) ||
      products.find((p) => p.sku.toLowerCase() === trimmed.toLowerCase());

    if (!found) {
      toast.error(`No product found for "${trimmed}"`);
      return;
    }
    setScannedProductId(found.id);
    setTab('all');
    setCategory('all');
    setQuery('');
    toast.success(`Found: ${found.name}`, {
      description: `Stock: ${found.stock} ${found.unit}`,
    });
  };

  const clearScan = () => setScannedProductId('');

  return (
    <div>
      <PageHeader
        title="Inventory Overview"
        description={`${products.length} products · ${stats.totalUnits} units in stock · ${formatCurrency(stats.totalValue)} value`}
        actions={
          <>
            <BarcodeScanButton
              onScan={handleBarcodeScan}
              label="Scan"
              variant="outline"
              className="h-9"
            />
            <Button asChild variant="outline" className="h-9">
              <Link href="/inventory/stock-in">
                <ArrowDownToLine className="h-4 w-4 mr-2" />
                Stock In
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-9">
              <Link href="/inventory/stock-out">
                <ArrowUpFromLine className="h-4 w-4 mr-2" />
                Stock Out
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-9">
              <Link href="/inventory/adjustment">
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                Adjust
              </Link>
            </Button>
          </>
        }
      />

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider">
                  Stock Value
                </div>
                <div className="text-lg font-bold mt-1 tabular-nums">
                  {formatCurrency(stats.totalValue)}
                </div>
              </div>
              <Warehouse className="h-5 w-5 text-brand-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider">
                  Total Units
                </div>
                <div className="text-lg font-bold mt-1 tabular-nums">
                  {stats.totalUnits}
                </div>
              </div>
              <Warehouse className="h-5 w-5 text-cyan-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider">
                  Low Stock
                </div>
                <div className="text-lg font-bold mt-1 tabular-nums text-amber-600 dark:text-amber-400">
                  {stats.low}
                </div>
              </div>
              <AlertTriangle className="h-5 w-5 text-amber-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider">
                  Out of Stock
                </div>
                <div className="text-lg font-bold mt-1 tabular-nums text-red-600 dark:text-red-400">
                  {stats.out}
                </div>
              </div>
              <PackageX className="h-5 w-5 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Scan alert */}
      {scannedProductId && (
        <div className="mb-4 rounded-lg border border-brand-500/30 bg-brand-500/5 p-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm">
            <Search className="h-4 w-4 text-brand-600 dark:text-brand-400" />
            <span className="font-medium">
              Filtered by scan:{' '}
              <span className="font-semibold">
                {products.find((p) => p.id === scannedProductId)?.name}
              </span>
            </span>
          </div>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 text-xs"
            onClick={clearScan}
          >
            <X className="h-3.5 w-3.5 mr-1" />
            Clear
          </Button>
        </div>
      )}

      {/* Tabs + filters */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
        <Tabs value={tab} onValueChange={(v) => setTab(v as any)}>
          <TabsList className="h-9">
            <TabsTrigger value="all" className="text-xs">
              All ({products.length})
            </TabsTrigger>
            <TabsTrigger value="low" className="text-xs">
              Low ({stats.low})
            </TabsTrigger>
            <TabsTrigger value="out" className="text-xs">
              Out ({stats.out})
            </TabsTrigger>
            <TabsTrigger value="healthy" className="text-xs">
              Healthy
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex items-center gap-2 flex-1">
          <Input
            placeholder="Search by name, SKU..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-9 max-w-xs"
          />
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="h-9 w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.name}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            asChild
            variant="outline"
            size="sm"
            className="h-9 ml-auto"
          >
            <Link href="/inventory/movements">
              <History className="h-3.5 w-3.5 mr-1.5" />
              Movements
            </Link>
          </Button>
        </div>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <Card>
          <CardContent className="p-6">
            <EmptyState
              title="No products"
              description="Try different filters or scan a barcode."
            />
          </CardContent>
        </Card>
      ) : (
        <Card className="overflow-hidden" ref={tableRef}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40">
                <tr className="text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="text-left font-semibold px-4 py-2.5">
                    Product
                  </th>
                  <th className="text-left font-semibold px-4 py-2.5 hidden md:table-cell">
                    Category
                  </th>
                  <th className="text-right font-semibold px-4 py-2.5">
                    Stock
                  </th>
                  <th className="text-right font-semibold px-4 py-2.5 hidden lg:table-cell">
                    Min
                  </th>
                  <th className="text-right font-semibold px-4 py-2.5 hidden sm:table-cell">
                    Cost
                  </th>
                  <th className="text-right font-semibold px-4 py-2.5">
                    Value
                  </th>
                  <th className="text-right font-semibold px-4 py-2.5">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => {
                  const st = getStockStatus(p.stock, p.minStock);
                  const isScanned = scannedProductId === p.id;
                  return (
                    <tr
                      key={p.id}
                      data-product-id={p.id}
                      className={cn(
                        'border-t border-border hover:bg-muted/30 transition-colors',
                        isScanned &&
                          'bg-brand-500/10 ring-2 ring-brand-500/40 ring-inset'
                      )}
                    >
                      <td className="px-4 py-2.5">
                        <div className="font-medium truncate max-w-[260px]">
                          {p.name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {p.sku}
                        </div>
                      </td>
                      <td className="px-4 py-2.5 hidden md:table-cell text-muted-foreground">
                        {p.category}
                      </td>
                      <td className="px-4 py-2.5 text-right tabular-nums font-semibold">
                        {p.stock} {p.unit}
                      </td>
                      <td className="px-4 py-2.5 text-right tabular-nums hidden lg:table-cell text-muted-foreground">
                        {p.minStock}
                      </td>
                      <td className="px-4 py-2.5 text-right tabular-nums hidden sm:table-cell text-muted-foreground">
                        {formatCurrency(p.purchasePrice)}
                      </td>
                      <td className="px-4 py-2.5 text-right tabular-nums font-medium">
                        {formatCurrency(p.stock * p.purchasePrice)}
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        <StatusBadge
                          variant={
                            st.variant === 'success'
                              ? 'success'
                              : st.variant === 'warning'
                              ? 'warning'
                              : 'danger'
                          }
                        >
                          {st.label}
                        </StatusBadge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}