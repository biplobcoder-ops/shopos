// components/pos/product-grid.tsx

'use client';

import { useMemo, useState } from 'react';
import { PackageX, Search } from 'lucide-react';
import { useProductStore } from '@/lib/store/product-store';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/shared/empty-state';
import { formatCurrency } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { Product } from '@/lib/types';

interface Props {
  onSelect: (product: Product) => void;
  activeCategory?: string;
  onCategoryChange?: (c: string) => void;
}

export function ProductGrid({ onSelect, activeCategory, onCategoryChange }: Props) {
  const products = useProductStore((s) => s.products);
  const categories = useProductStore((s) => s.categories);

  const [query, setQuery] = useState('');
  const [cat, setCat] = useState(activeCategory ?? 'all');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((p) => {
      if (p.status !== 'active') return false;
      if (cat !== 'all' && p.category !== cat) return false;
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.barcode.includes(q)
      );
    });
  }, [products, query, cat]);

  const handleCat = (c: string) => {
    setCat(c);
    onCategoryChange?.(c);
  };

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Filters */}
      <div className="space-y-3 shrink-0">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, SKU or barcode..."
            className="pl-9 h-10"
          />
        </div>
        <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1">
          <Button
            type="button"
            size="sm"
            variant={cat === 'all' ? 'default' : 'outline'}
            className="h-7 text-xs shrink-0"
            onClick={() => handleCat('all')}
          >
            All ({products.length})
          </Button>
          {categories.map((c) => {
            const count = products.filter((p) => p.category === c.name && p.status === 'active').length;
            return (
              <Button
                key={c.id}
                type="button"
                size="sm"
                variant={cat === c.name ? 'default' : 'outline'}
                className="h-7 text-xs shrink-0"
                onClick={() => handleCat(c.name)}
              >
                {c.name} ({count})
              </Button>
            );
          })}
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto mt-3 -mr-2 pr-2">
        {filtered.length === 0 ? (
          <EmptyState
            icon={PackageX}
            title="No products found"
            description="Try a different search or category."
          />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-2.5">
            {filtered.map((p) => {
              const out = p.stock <= 0;
              const low = !out && p.stock <= p.minStock;
              return (
                <button
                  key={p.id}
                  type="button"
                  disabled={out}
                  onClick={() => onSelect(p)}
                  className={cn(
                    'group relative flex flex-col items-start text-left rounded-xl border bg-card p-3 transition-all',
                    'hover:shadow-md hover:border-brand-500/50 active:scale-[0.98]',
                    out && 'opacity-50 cursor-not-allowed hover:shadow-none hover:border-border'
                  )}
                >
                  <div className="w-full flex items-start justify-between gap-1.5 mb-2">
                    <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-brand-500/10 to-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center text-xs font-bold shrink-0">
                      {p.name.slice(0, 2).toUpperCase()}
                    </div>
                    {out ? (
                      <Badge variant="destructive" className="text-[9px] px-1.5 py-0 h-5">
                        Out
                      </Badge>
                    ) : low ? (
                      <Badge variant="secondary" className="text-[9px] px-1.5 py-0 h-5 bg-amber-500/15 text-amber-600 dark:text-amber-400 border-0">
                        Low · {p.stock}
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-[9px] px-1.5 py-0 h-5 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-0">
                        {p.stock}
                      </Badge>
                    )}
                  </div>
                  <div className="text-xs font-medium leading-snug line-clamp-2 min-h-[2.4em]">
                    {p.name}
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-0.5 truncate w-full">
                    {p.sku}
                  </div>
                  <div className="mt-2 pt-2 border-t border-border w-full flex items-center justify-between">
                    <div className="text-sm font-bold tabular-nums">
                      {formatCurrency(p.sellingPrice)}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}