// components/products/product-columns.tsx

'use client';

import { ColumnDef } from '@tanstack/react-table';
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  Barcode as BarcodeIcon,
  Eye,
} from 'lucide-react';
import Link from 'next/link';
import type { Product } from '@/lib/types';
import { formatCurrency } from '@/lib/format';
import { getStockStatus } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/shared/status-badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';

interface Props {
  onEdit: (p: Product) => void;
  onDelete: (p: Product) => void;
}

export function makeProductColumns({
  onEdit,
  onDelete,
}: Props): ColumnDef<Product>[] {
  return [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(v) => row.toggleSelected(!!v)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
    },
    {
      accessorKey: 'name',
      header: 'Product',
      cell: ({ row }) => {
        const p = row.original;
        return (
          <div className="flex items-center gap-3 min-w-0 max-w-[280px]">
            <div className="h-9 w-9 shrink-0 rounded-lg bg-gradient-to-br from-brand-500/10 to-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center text-xs font-bold">
              {p.name.slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="font-medium text-sm truncate">{p.name}</div>
              <div className="text-xs text-muted-foreground truncate">
                {p.sku}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'category',
      header: 'Category',
      cell: ({ row }) => (
        <Badge variant="secondary" className="text-xs font-normal">
          {row.original.category}
        </Badge>
      ),
    },
    {
      accessorKey: 'brand',
      header: 'Brand',
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">{row.original.brand}</span>
      ),
    },
    {
      accessorKey: 'stock',
      header: 'Stock',
      cell: ({ row }) => {
        const p = row.original;
        const st = getStockStatus(p.stock, p.minStock);
        return (
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-semibold tabular-nums">
              {p.stock} {p.unit}
            </span>
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
          </div>
        );
      },
    },
    {
      accessorKey: 'purchasePrice',
      header: 'Cost',
      cell: ({ row }) => (
        <span className="text-sm tabular-nums text-muted-foreground">
          {formatCurrency(row.original.purchasePrice)}
        </span>
      ),
    },
    {
      accessorKey: 'sellingPrice',
      header: 'Price',
      cell: ({ row }) => (
        <span className="text-sm font-semibold tabular-nums">
          {formatCurrency(row.original.sellingPrice)}
        </span>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <StatusBadge
          variant={row.original.status === 'active' ? 'success' : 'neutral'}
        >
          {row.original.status}
        </StatusBadge>
      ),
    },
    {
      id: 'actions',
      header: '',
      enableSorting: false,
      cell: ({ row }) => {
        const p = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
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
              <DropdownMenuItem asChild>
                <Link
                  href={`/product/${p.id}`}
                  target="_blank"
                  className="cursor-pointer"
                >
                  <Eye className="mr-2 h-4 w-4" />
                  View on site
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
        );
      },
    },
  ];
}