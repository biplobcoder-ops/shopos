// components/orders/order-detail-dialog.tsx

'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Check,
  X,
  Truck,
  Phone,
  MapPin,
  Mail,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { StatusBadge, statusVariant } from '@/components/shared/status-badge';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { useOrderStore } from '@/lib/store/order-store';
import { useSession } from 'next-auth/react';
import { formatCurrency, formatDateTime } from '@/lib/format';
import type { Order, OrderStatus } from '@/lib/types';

const STATUS_OPTIONS: { value: OrderStatus; label: string }[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'processing', label: 'Processing' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
];

interface Props {
  order: Order | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

export function OrderDetailDialog({ order, open, onOpenChange }: Props) {
  const { data: session } = useSession();
  const updateStatus = useOrderStore((s) => s.updateStatus);
  const cancelOrder = useOrderStore((s) => s.cancel);

  const [newStatus, setNewStatus] = useState<OrderStatus | null>(null);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (!order) return null;

  const currentStatus = order.status;
  const email = session?.user?.email ?? 'system';

  const handleStatusChange = (status: OrderStatus) => {
    setNewStatus(status);
  };

  const confirmStatusChange = () => {
    if (!newStatus || newStatus === currentStatus) return;
    if (newStatus === 'cancelled') {
      setCancelOpen(true);
      return;
    }
    setSubmitting(true);
    try {
      updateStatus(order.id, newStatus, email);
      toast.success(`Order marked as ${newStatus}`);
      if (newStatus === 'delivered') {
        toast.info('Stock deducted for this order');
      }
      setNewStatus(null);
    } catch {
      toast.error('Failed to update status');
    } finally {
      setSubmitting(false);
    }
  };

  const confirmCancel = () => {
    setSubmitting(true);
    try {
      cancelOrder(order.id, email);
      toast.success('Order cancelled');
      if (order.status === 'delivered') {
        toast.info('Stock restored');
      }
      setCancelOpen(false);
      setNewStatus(null);
    } catch {
      toast.error('Failed to cancel order');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[92vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 flex-wrap">
              {order.orderNo}
              <StatusBadge variant={statusVariant(order.status)}>
                {order.status}
              </StatusBadge>
            </DialogTitle>
            <p className="text-xs text-muted-foreground mt-1">
              Placed {formatDateTime(order.date)}
            </p>
          </DialogHeader>

          {/* Customer info */}
          <div className="rounded-lg border p-3 space-y-2 text-sm">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Customer
            </div>
            <div className="font-semibold">{order.customerName}</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{order.customerPhone}</span>
              </div>
              {order.customerEmail && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{order.customerEmail}</span>
                </div>
              )}
            </div>
            <div className="flex items-start gap-2 text-xs text-muted-foreground pt-1 border-t border-border">
              <MapPin className="h-3.5 w-3.5 shrink-0 mt-0.5" />
              <span>{order.deliveryAddress}</span>
            </div>
          </div>

          {/* Items */}
          <div className="rounded-lg border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/40">
                <tr className="text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="text-left font-semibold px-3 py-2">Item</th>
                  <th className="text-right font-semibold px-3 py-2">Price</th>
                  <th className="text-right font-semibold px-3 py-2">Qty</th>
                  <th className="text-right font-semibold px-3 py-2">Total</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((it, i) => (
                  <tr key={i} className="border-t border-border">
                    <td className="px-3 py-2">
                      <div className="font-medium truncate max-w-[240px]">
                        {it.name}
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        {it.sku}
                      </div>
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums">
                      {formatCurrency(it.price)}
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums">{it.qty}</td>
                    <td className="px-3 py-2 text-right tabular-nums font-semibold">
                      {formatCurrency(it.subtotal)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="tabular-nums">{formatCurrency(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Delivery</span>
              <span className="tabular-nums">{formatCurrency(order.delivery)}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span className="tabular-nums text-brand-600 dark:text-brand-400">
                {formatCurrency(order.total)}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Payment Method</span>
              <Badge variant="secondary" className="uppercase text-[10px]">
                {order.paymentMethod}
              </Badge>
            </div>
          </div>

          {order.notes && (
            <div className="rounded-lg border bg-muted/40 p-3 text-xs">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                Notes
              </div>
              <div>{order.notes}</div>
            </div>
          )}

          {/* Status flow */}
          {order.status !== 'cancelled' && (
            <div className="rounded-lg border p-3 space-y-2">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Update Status
              </div>
              <div className="flex gap-2">
                <Select
                  value={newStatus ?? currentStatus}
                  onValueChange={(v) => handleStatusChange(v as OrderStatus)}
                >
                  <SelectTrigger className="flex-1 h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.filter((s) => {
                      // Prevent going back to pending once advanced? allow for flexibility
                      return true;
                    }).map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  onClick={confirmStatusChange}
                  disabled={
                    !newStatus || newStatus === currentStatus || submitting
                  }
                  className="h-10"
                >
                  {submitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-1" />
                      Apply
                    </>
                  )}
                </Button>
              </div>
              {newStatus === 'delivered' && currentStatus !== 'delivered' && (
                <p className="text-xs text-amber-600 dark:text-amber-400">
                  Marking as delivered will deduct stock for all items.
                </p>
              )}
            </div>
          )}

          {/* Cancel action */}
          {order.status !== 'cancelled' && order.status !== 'delivered' && (
            <Button
              variant="outline"
              className="w-full h-10 text-red-600 border-red-200 hover:bg-red-500/10 hover:text-red-600 dark:border-red-900"
              onClick={() => setCancelOpen(true)}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel Order
            </Button>
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        title="Cancel this order?"
        description={`Order ${order.orderNo} will be marked as cancelled. ${
          order.status === 'delivered' ? 'Stock will be restored.' : ''
        }`}
        confirmLabel="Cancel Order"
        loading={submitting}
        onConfirm={confirmCancel}
      />
    </>
  );
}