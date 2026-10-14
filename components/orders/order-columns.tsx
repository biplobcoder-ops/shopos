// components/orders/order-columns.tsx

'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Eye, MoreHorizontal, X, CheckCircle2 } from 'lucide-react';
import type { Order } from '@/lib/types';
import { formatCurrency, formatDateTime } from '@/lib/format';
import { StatusBadge, statusVariant } from '@/components/shared/status-badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';

interface Props {
  onView: (o: Order) => void;
  onStatusChange: (o: Order, status: Order['status']) => void;
  onCancel: (o: Order) => void;
}

export function makeOrderColumns({
  onView,
  onStatusChange,
  onCancel,
}: Props): ColumnDef<Order>[] {
  return [
    {
      accessorKey: 'orderNo',
      header: 'Order',
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.orderNo}</div>
          <div className="text-xs text-muted-foreground">
            {row.original.items.length} item
            {row.original.items.length > 1 ? 's' : ''}
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'customerName',
      header: 'Customer',
      cell: ({ row }) => (
        <div className="min-w-0">
          <div className="text-sm font-medium truncate max-w-[200px]">
            {row.original.customerName}
          </div>
          <div className="text-xs text-muted-foreground truncate max-w-[200px]">
            {row.original.customerPhone}
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'date',
      header: 'Date',
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          {formatDateTime(row.original.date)}
        </span>
      ),
    },
    {
      accessorKey: 'paymentMethod',
      header: 'Payment',
      cell: ({ row }) => (
        <Badge variant="secondary" className="text-[10px] uppercase">
          {row.original.paymentMethod}
        </Badge>
      ),
    },
    {
      accessorKey: 'total',
      header: 'Total',
      cell: ({ row }) => (
        <span className="text-sm font-semibold tabular-nums">
          {formatCurrency(row.original.total)}
        </span>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <StatusBadge variant={statusVariant(row.original.status)}>
          {row.original.status}
        </StatusBadge>
      ),
    },
    {
      id: 'actions',
      header: '',
      enableSorting: false,
      cell: ({ row }) => {
        const o = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => onView(o)}>
                <Eye className="mr-2 h-4 w-4" />
                View details
              </DropdownMenuItem>
              {o.status !== 'delivered' && o.status !== 'cancelled' && (
                <DropdownMenuItem
                  onClick={() => onStatusChange(o, 'delivered')}
                >
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Mark delivered
                </DropdownMenuItem>
              )}
              {o.status !== 'cancelled' && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-red-600 focus:text-red-600 cursor-pointer"
                    onClick={() => onCancel(o)}
                  >
                    <X className="mr-2 h-4 w-4" />
                    Cancel order
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
}