// components/products/product-grid-view.tsx

'use client';

import Link from 'next/link';
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  Barcode as BarcodeIcon,
} from 'lucide-react';
import type { Product } from '@/lib/types';
import { formatCurrency } from '@/lib/format';
import { getStockStatus } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/shared/status-badge';
import { EmptyState } from '@/components/shared/empty-state';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Package } from 'lucide-react';

interface Props {
  products: Product[];
  onEdit: (p: Product) => void;
  onDelete: (p: Product) => void;
}

export function ProductGridView({ products, onEdit, onDelete }: Props) {
  if (!products.length) {
    return <EmptyState icon={Package} title="No products" />;
  }
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
      {products.map((p) => {
        const st = getStockStatus(p.stock, p.minStock);
        return (
          <Card key={p.id} className="overflow-hidden group hover:shadow-md transition">
            <div className="p-3">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-brand-500/10 to-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center text-sm font-bold shrink-0">
                  {p.name.slice(0, 2).toUpperCase()}
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-7 w-7">
                      <MoreHorizontal className="h-3.5 w-3.5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40">
                    <DropdownMenuItem onClick={() => onEdit(p)}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link
                        href={`/barcode/generate?product=${p.id}`}
                        className="cursor-pointer"
                      >
                        <BarcodeIcon className="mr-2 h-4 w-4" />
                        Barcode
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-red-600 focus:text-red-600 cursor-pointer"
                      onClick={() => onDelete(p)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="text-xs text-muted-foreground">
                {p.category} · {p.brand}
              </div>
              <div className="text-sm font-medium leading-snug line-clamp-2 mt-0.5 min-h-[2.4em]">
                {p.name}
              </div>
              <div className="text-[10px] text-muted-foreground mt-0.5">
                {p.sku}
              </div>

              <div className="mt-3 pt-2 border-t flex items-center justify-between">
                <div className="text-base font-bold tabular-nums">
                  {formatCurrency(p.sellingPrice)}
                </div>
                <StatusBadge
                  variant={
                    st.variant === 'success'
                      ? 'success'
                      : st.variant === 'warning'
                      ? 'warning'
                      : 'danger'
                  }
                >
                  {p.stock} {p.unit}
                </StatusBadge>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}