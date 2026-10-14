// app/(dashboard)/products/page.tsx

'use client';

import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import {
  Plus,
  LayoutGrid,
  List,
  Download,
  Trash2,
  Package,
} from 'lucide-react';
import { useProductStore } from '@/lib/store/product-store';
import type { Product } from '@/lib/types';

import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { DataTable } from '@/components/shared/data-table';
import { makeProductColumns } from '@/components/products/product-columns';
import { ProductGridView } from '@/components/products/product-grid-view';
import { ProductFormDialog } from '@/components/products/product-form-dialog';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { BarcodeScanButton } from '@/components/shared/barcode-scan-button';
import { downloadCSV, downloadJSON } from '@/lib/export';
import { cn } from '@/lib/utils';

export default function ProductsPage() {
  const {
    products,
    categories,
    brands,
    bulkRemove,
    removeProduct,
  } = useProductStore();

  // view mode
  const [view, setView] = useState<'table' | 'grid'>('table');

  // filters
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [brandFilter, setBrandFilter] = useState<string>('all');
  const [stockFilter, setStockFilter] = useState<string>('all');
  const [scannedFilter, setScannedFilter] = useState<string>('');

  // dialogs
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState<Product | null>(null);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [selectedRows, setSelectedRows] = useState<Product[]>([]);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (categoryFilter !== 'all' && p.category !== categoryFilter) return false;
      if (brandFilter !== 'all' && p.brand !== brandFilter) return false;
      if (stockFilter === 'low' && !(p.stock > 0 && p.stock <= p.minStock)) return false;
      if (stockFilter === 'out' && p.stock > 0) return false;
      if (stockFilter === 'in' && p.stock <= p.minStock) return false;
      // If scanned filter active — filter to that specific product
      if (scannedFilter && p.id !== scannedFilter) return false;
      return true;
    });
  }, [products, categoryFilter, brandFilter, stockFilter, scannedFilter]);

  const columns = useMemo(
    () =>
      makeProductColumns({
        onEdit: (p) => {
          setEditing(p);
          setFormOpen(true);
        },
        onDelete: (p) => setDeleting(p),
      }),
    []
  );

  const lowStockCount = products.filter((p) => p.stock > 0 && p.stock <= p.minStock).length;
  const outCount = products.filter((p) => p.stock <= 0).length;

  /** Handle barcode scan — filter to that product */
  const handleBarcodeScan = (code: string) => {
    const trimmed = code.trim();
    const found =
      products.find((p) => p.barcode === trimmed) ||
      products.find((p) => p.sku.toLowerCase() === trimmed.toLowerCase());

    if (!found) {
      toast.error(`No product found for "${trimmed}"`);
      return;
    }
    setScannedFilter(found.id);
    setCategoryFilter('all');
    setBrandFilter('all');
    setStockFilter('all');
    toast.success(`Found: ${found.name}`, {
      description: 'Product filtered. Clear scan to see all.',
    });
  };

  const clearScanFilter = () => {
    setScannedFilter('');
  };

  const handleExport = (format: 'csv' | 'json') => {
    const rows = filtered.map((p) => ({
      name: p.name,
      sku: p.sku,
      barcode: p.barcode,
      category: p.category,
      brand: p.brand,
      unit: p.unit,
      purchasePrice: p.purchasePrice,
      sellingPrice: p.sellingPrice,
      stock: p.stock,
      minStock: p.minStock,
      status: p.status,
    }));
    const date = new Date().toISOString().slice(0, 10);
    if (format === 'csv') {
      downloadCSV(rows, `products-${date}.csv`);
      toast.success('CSV downloaded');
    } else {
      downloadJSON(rows, `products-${date}.json`);
      toast.success('JSON downloaded');
    }
  };

  return (
    <div>
      <PageHeader
        title="Products"
        description={`${products.length} products · ${lowStockCount} low stock · ${outCount} out of stock`}
        actions={
          <>
            {/* Scan button */}
            <BarcodeScanButton
              onScan={handleBarcodeScan}
              label="Scan"
              variant="outline"
              className="h-9"
            />

            {/* View toggle */}
            <div className="inline-flex rounded-lg border bg-card h-9">
              <button
                onClick={() => setView('table')}
                className={cn(
                  'px-3 inline-flex items-center justify-center rounded-l-lg transition-colors',
                  view === 'table'
                    ? 'bg-brand-600 text-white'
                    : 'hover:bg-accent text-muted-foreground'
                )}
                title="Table view"
              >
                <List className="h-4 w-4" />
              </button>
              <button
                onClick={() => setView('grid')}
                className={cn(
                  'px-3 inline-flex items-center justify-center rounded-r-lg transition-colors',
                  view === 'grid'
                    ? 'bg-brand-600 text-white'
                    : 'hover:bg-accent text-muted-foreground'
                )}
                title="Grid view"
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="h-9">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Export {filtered.length} rows</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleExport('csv')}>
                  Download CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('json')}>
                  Download JSON
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              className="h-9"
              onClick={() => {
                setEditing(null);
                setFormOpen(true);
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </>
        }
      />

      {/* Scanned Product Alert */}
      {scannedFilter && (
        <div className="mb-4 rounded-lg border border-brand-500/30 bg-brand-500/5 p-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm">
            <Package className="h-4 w-4 text-brand-600 dark:text-brand-400" />
            <span className="font-medium">
              Filtered by scan:{' '}
              <span className="font-semibold">
                {products.find((p) => p.id === scannedFilter)?.name}
              </span>
            </span>
          </div>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 text-xs"
            onClick={clearScanFilter}
          >
            Clear
          </Button>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[150px] h-9">
            <SelectValue placeholder="Category" />
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

        <Select value={brandFilter} onValueChange={setBrandFilter}>
          <SelectTrigger className="w-[140px] h-9">
            <SelectValue placeholder="Brand" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Brands</SelectItem>
            {brands.map((b) => (
              <SelectItem key={b.id} value={b.name}>
                {b.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={stockFilter} onValueChange={setStockFilter}>
          <SelectTrigger className="w-[140px] h-9">
            <SelectValue placeholder="Stock" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Stock</SelectItem>
            <SelectItem value="in">In Stock</SelectItem>
            <SelectItem value="low">Low Stock</SelectItem>
            <SelectItem value="out">Out of Stock</SelectItem>
          </SelectContent>
        </Select>

        {(categoryFilter !== 'all' ||
          brandFilter !== 'all' ||
          stockFilter !== 'all' ||
          scannedFilter) && (
          <Button
            variant="ghost"
            size="sm"
            className="h-9 text-xs"
            onClick={() => {
              setCategoryFilter('all');
              setBrandFilter('all');
              setStockFilter('all');
              setScannedFilter('');
            }}
          >
            Clear filters
          </Button>
        )}
      </div>

      {/* Content */}
      {view === 'table' ? (
        <DataTable
          columns={columns}
          data={filtered}
          searchKey="name"
          searchPlaceholder="Search products by name, SKU, barcode..."
          emptyTitle="No products found"
          emptyDescription="Try different filters or add a new product."
          pageSize={10}
          toolbar={
            selectedRows.length > 0 ? (
              <div className="flex items-center gap-2">
                <Badge variant="secondary">
                  {selectedRows.length} selected
                </Badge>
                <Button
                  variant="destructive"
                  size="sm"
                  className="h-8"
                  onClick={() => setBulkDeleteOpen(true)}
                >
                  <Trash2 className="h-3.5 w-3.5 mr-1" />
                  Delete
                </Button>
              </div>
            ) : null
          }
        />
      ) : (
        <ProductGridView
          products={filtered}
          onEdit={(p) => {
            setEditing(p);
            setFormOpen(true);
          }}
          onDelete={(p) => setDeleting(p)}
        />
      )}

      {/* Selection Bridge */}
      <SelectionBridge
        columns={columns}
        data={filtered}
        onChange={setSelectedRows}
      />

      {/* Dialogs */}
      <ProductFormDialog
        open={formOpen}
        onOpenChange={(v) => {
          setFormOpen(v);
          if (!v) setEditing(null);
        }}
        product={editing}
      />

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(v) => !v && setDeleting(null)}
        title="Delete product?"
        description={`This will permanently remove "${deleting?.name}".`}
        confirmLabel="Delete"
        onConfirm={() => {
          if (deleting) {
            removeProduct(deleting.id);
            toast.success('Product deleted');
            setDeleting(null);
          }
        }}
      />

      <ConfirmDialog
        open={bulkDeleteOpen}
        onOpenChange={setBulkDeleteOpen}
        title={`Delete ${selectedRows.length} products?`}
        description="This action cannot be undone."
        confirmLabel="Delete all"
        onConfirm={() => {
          bulkRemove(selectedRows.map((r) => r.id));
          toast.success(`${selectedRows.length} products deleted`);
          setSelectedRows([]);
          setBulkDeleteOpen(false);
        }}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Headless selection bridge                                           */
/* ------------------------------------------------------------------ */

import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  type RowSelectionState,
} from '@tanstack/react-table';
import type { ColumnDef } from '@tanstack/react-table';
import { useEffect, useState as useReactState } from 'react';

function SelectionBridge<TData>({
  columns,
  data,
  onChange,
}: {
  columns: ColumnDef<TData, any>[];
  data: TData[];
  onChange: (rows: TData[]) => void;
}) {
  const [rowSelection, setRowSelection] = useReactState<RowSelectionState>({});

  const table = useReactTable({
    data,
    columns,
    state: { rowSelection },
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  useEffect(() => {
    const selected = table
      .getSelectedRowModel()
      .rows.map((r) => r.original);
    onChange(selected);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rowSelection, data]);

  return null;
}