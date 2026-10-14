// app/(website)/shop/products-listing.tsx

'use client';

import { useMemo, useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, SlidersHorizontal, X, Package, ScanBarcode } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { EmptyState } from '@/components/shared/empty-state';
import { BarcodeScanButton } from '@/components/shared/barcode-scan-button';
import { WebsiteProductCard } from '@/components/website/product-card';
import { useProductStore } from '@/lib/store/product-store';

type SortKey = 'newest' | 'price-asc' | 'price-desc' | 'name-asc' | 'name-desc';

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'newest', label: 'Newest First' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'name-asc', label: 'Name: A to Z' },
  { value: 'name-desc', label: 'Name: Z to A' },
];

export function ProductsListing() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const products = useProductStore((s) => s.products);
  const categories = useProductStore((s) => s.categories);
  const brands = useProductStore((s) => s.brands);

  const initialQuery = searchParams.get('q') ?? '';
  const initialCategory = searchParams.get('category') ?? '';

  const [query, setQuery] = useState(initialQuery);
  const [sort, setSort] = useState<SortKey>('newest');
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    initialCategory ? [initialCategory] : []
  );
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [priceMin, setPriceMin] = useState<string>('');
  const [priceMax, setPriceMax] = useState<string>('');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [scannedProductId, setScannedProductId] = useState<string>('');

  useEffect(() => {
    const q = searchParams.get('q') ?? '';
    const cat = searchParams.get('category') ?? '';
    setQuery(q);
    setSelectedCategories(cat ? [cat] : []);
  }, [searchParams]);

  const activeProducts = useMemo(
    () => products.filter((p) => p.status === 'active'),
    [products]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const min = priceMin ? Number(priceMin) : 0;
    const max = priceMax ? Number(priceMax) : Infinity;

    let list = activeProducts.filter((p) => {
      // If scanned — filter to that product
      if (scannedProductId && p.id !== scannedProductId) return false;
      if (q) {
        const match =
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.barcode.includes(q);
        if (!match) return false;
      }
      if (selectedCategories.length && !selectedCategories.includes(p.category))
        return false;
      if (selectedBrands.length && !selectedBrands.includes(p.brand))
        return false;
      if (inStockOnly && p.stock <= 0) return false;
      if (p.sellingPrice < min) return false;
      if (p.sellingPrice > max) return false;
      return true;
    });

    list = [...list].sort((a, b) => {
      switch (sort) {
        case 'price-asc':
          return a.sellingPrice - b.sellingPrice;
        case 'price-desc':
          return b.sellingPrice - a.sellingPrice;
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        case 'newest':
        default:
          return a.createdAt < b.createdAt ? 1 : -1;
      }
    });

    return list;
  }, [
    activeProducts,
    query,
    selectedCategories,
    selectedBrands,
    inStockOnly,
    priceMin,
    priceMax,
    sort,
    scannedProductId,
  ]);

  const toggleCategory = (name: string) => {
    setSelectedCategories((prev) =>
      prev.includes(name) ? prev.filter((x) => x !== name) : [...prev, name]
    );
  };

  const toggleBrand = (name: string) => {
    setSelectedBrands((prev) =>
      prev.includes(name) ? prev.filter((x) => x !== name) : [...prev, name]
    );
  };

  const clearAll = () => {
    setQuery('');
    setSelectedCategories([]);
    setSelectedBrands([]);
    setInStockOnly(false);
    setPriceMin('');
    setPriceMax('');
    setScannedProductId('');
    router.replace('/shop');
  };

  const hasFilters =
    query.trim() ||
    selectedCategories.length > 0 ||
    selectedBrands.length > 0 ||
    inStockOnly ||
    priceMin ||
    priceMax ||
    scannedProductId;

  /** Handle barcode scan — filter to that product */
  const handleBarcodeScan = (code: string) => {
    const trimmed = code.trim();
    const found =
      activeProducts.find((p) => p.barcode === trimmed) ||
      activeProducts.find(
        (p) => p.sku.toLowerCase() === trimmed.toLowerCase()
      );

    if (!found) {
      toast.error(`No product found for "${trimmed}"`);
      return;
    }

    setScannedProductId(found.id);
    setQuery('');
    setSelectedCategories([]);
    setSelectedBrands([]);
    setInStockOnly(false);
    setPriceMin('');
    setPriceMax('');

    toast.success(`Found: ${found.name}`);
  };

  const clearScan = () => setScannedProductId('');

  const FiltersPanel = (
    <div className="space-y-5">
      <div>
        <Label className="text-xs font-semibold uppercase tracking-wider">
          Search
        </Label>
        <div className="relative mt-2">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tools..."
            className="pl-9 h-9"
          />
        </div>
      </div>

      <div>
        <Label className="text-xs font-semibold uppercase tracking-wider">
          Categories
        </Label>
        <div className="mt-2 space-y-2">
          {categories.map((c) => {
            const count = activeProducts.filter(
              (p) => p.category === c.name
            ).length;
            return (
              <label
                key={c.id}
                className="flex items-center gap-2 cursor-pointer text-sm hover:text-foreground"
              >
                <Checkbox
                  checked={selectedCategories.includes(c.name)}
                  onCheckedChange={() => toggleCategory(c.name)}
                />
                <span className="flex-1">{c.name}</span>
                <span className="text-xs text-muted-foreground tabular-nums">
                  {count}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      <div className="pt-4 border-t border-border">
        <Label className="text-xs font-semibold uppercase tracking-wider">
          Brands
        </Label>
        <div className="mt-2 space-y-2">
          {brands.map((b) => {
            const count = activeProducts.filter((p) => p.brand === b.name).length;
            return (
              <label
                key={b.id}
                className="flex items-center gap-2 cursor-pointer text-sm hover:text-foreground"
              >
                <Checkbox
                  checked={selectedBrands.includes(b.name)}
                  onCheckedChange={() => toggleBrand(b.name)}
                />
                <span className="flex-1">{b.name}</span>
                <span className="text-xs text-muted-foreground tabular-nums">
                  {count}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      <div className="pt-4 border-t border-border">
        <Label className="text-xs font-semibold uppercase tracking-wider">
          Price Range ($)
        </Label>
        <div className="mt-2 flex items-center gap-2">
          <Input
            type="number"
            value={priceMin}
            onChange={(e) => setPriceMin(e.target.value)}
            placeholder="Min"
            className="h-9 text-xs"
          />
          <span className="text-muted-foreground">—</span>
          <Input
            type="number"
            value={priceMax}
            onChange={(e) => setPriceMax(e.target.value)}
            placeholder="Max"
            className="h-9 text-xs"
          />
        </div>
      </div>

      <div className="pt-4 border-t border-border">
        <label className="flex items-center gap-2 cursor-pointer text-sm">
          <Checkbox
            checked={inStockOnly}
            onCheckedChange={(v) => setInStockOnly(!!v)}
          />
          In stock only
        </label>
      </div>

      {hasFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearAll}
          className="w-full text-xs"
        >
          <X className="h-3.5 w-3.5 mr-1" />
          Clear all filters
        </Button>
      )}
    </div>
  );

  return (
    <div className="container mx-auto py-6 md:py-8">
      <div className="mb-4 md:mb-6">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="min-w-0">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              All Products
            </h1>
            <p className="text-xs md:text-sm text-muted-foreground mt-1">
              {filtered.length} of {activeProducts.length} products
              {query && (
                <>
                  {' '}
                  for &ldquo;
                  <span className="text-foreground font-medium">{query}</span>
                  &rdquo;
                </>
              )}
            </p>
          </div>

          {/* Scan button — visible on all screens */}
          <BarcodeScanButton
            onScan={handleBarcodeScan}
            label="Scan"
            variant="outline"
            className="h-9 shrink-0"
          />
        </div>
      </div>

      {/* Scanned Alert */}
      {scannedProductId && (
        <div className="mb-4 rounded-lg border border-brand-500/30 bg-brand-500/5 p-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm min-w-0">
            <ScanBarcode className="h-4 w-4 text-brand-600 dark:text-brand-400 shrink-0" />
            <span className="font-medium truncate">
              Filtered by scan:{' '}
              <span className="font-semibold">
                {activeProducts.find((p) => p.id === scannedProductId)?.name}
              </span>
            </span>
          </div>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 text-xs shrink-0"
            onClick={clearScan}
          >
            <X className="h-3.5 w-3.5 mr-1" />
            Clear
          </Button>
        </div>
      )}

      <div className="lg:hidden flex items-center gap-2 mb-4">
        <Button
          variant="outline"
          onClick={() => setMobileFiltersOpen(true)}
          className="h-9 flex-1 justify-start"
        >
          <SlidersHorizontal className="h-4 w-4 mr-2" />
          Filters
          {hasFilters && (
            <span className="ml-auto h-5 min-w-5 px-1.5 rounded-full bg-brand-600 text-white text-[10px] font-bold flex items-center justify-center">
              {selectedCategories.length +
                selectedBrands.length +
                (inStockOnly ? 1 : 0) +
                (priceMin || priceMax ? 1 : 0) +
                (scannedProductId ? 1 : 0)}
            </span>
          )}
        </Button>
        <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
          <SelectTrigger className="h-9 w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6">
        <aside className="hidden lg:block">
          <div className="sticky top-20 rounded-xl border bg-card p-4">
            {FiltersPanel}
          </div>
        </aside>

        <div>
          <div className="hidden lg:flex items-center justify-between gap-3 mb-4">
            <div className="text-xs text-muted-foreground">
              Showing{' '}
              <span className="text-foreground font-medium">
                {filtered.length}
              </span>{' '}
              product{filtered.length === 1 ? '' : 's'}
            </div>
            <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
              <SelectTrigger className="h-9 w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {hasFilters && (
            <div className="flex flex-wrap items-center gap-1.5 mb-4">
              {selectedCategories.map((c) => (
                <button
                  key={c}
                  onClick={() => toggleCategory(c)}
                  className="inline-flex items-center gap-1 rounded-full bg-brand-500/10 text-brand-700 dark:text-brand-400 px-2.5 py-1 text-[11px] font-medium hover:bg-brand-500/20"
                >
                  {c}
                  <X className="h-3 w-3" />
                </button>
              ))}
              {selectedBrands.map((b) => (
                <button
                  key={b}
                  onClick={() => toggleBrand(b)}
                  className="inline-flex items-center gap-1 rounded-full bg-brand-500/10 text-brand-700 dark:text-brand-400 px-2.5 py-1 text-[11px] font-medium hover:bg-brand-500/20"
                >
                  {b}
                  <X className="h-3 w-3" />
                </button>
              ))}
              {inStockOnly && (
                <button
                  onClick={() => setInStockOnly(false)}
                  className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 px-2.5 py-1 text-[11px] font-medium hover:bg-emerald-500/20"
                >
                  In stock
                  <X className="h-3 w-3" />
                </button>
              )}
              {(priceMin || priceMax) && (
                <button
                  onClick={() => {
                    setPriceMin('');
                    setPriceMax('');
                  }}
                  className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 px-2.5 py-1 text-[11px] font-medium hover:bg-amber-500/20"
                >
                  ${priceMin || '0'} - ${priceMax || '∞'}
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          )}

          {filtered.length === 0 ? (
            <div className="rounded-xl border bg-card">
              <EmptyState
                icon={Package}
                title="No products found"
                description="Try changing or clearing filters."
                action={
                  hasFilters ? (
                    <Button onClick={clearAll}>Clear filters</Button>
                  ) : null
                }
              />
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
              {filtered.map((p) => (
                <WebsiteProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>

      <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
        <SheetContent
          side="left"
          className="w-full sm:w-[380px] p-0 flex flex-col"
        >
          <SheetHeader className="px-4 py-3 border-b border-border">
            <SheetTitle>Filters</SheetTitle>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto p-4">{FiltersPanel}</div>
          <div className="border-t border-border p-4">
            <Button
              className="w-full h-10"
              onClick={() => setMobileFiltersOpen(false)}
            >
              Show {filtered.length} result{filtered.length === 1 ? '' : 's'}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}