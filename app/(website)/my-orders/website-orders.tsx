// app/(website)/my-orders/website-orders.tsx

'use client';

import { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Package,
  CheckCircle2,
  Clock,
  Truck,
  XCircle,
  ChevronDown,
  ChevronUp,
  ShoppingBag,
  ArrowLeft,
  MapPin,
  Phone,
  CreditCard,
} from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { EmptyState } from '@/components/shared/empty-state';
import { StatusBadge, statusVariant } from '@/components/shared/status-badge';
import { useOrderStore } from '@/lib/store/order-store';
import { formatCurrency, formatDateTime } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { Order, OrderStatus } from '@/lib/types';

const MY_ORDERS_KEY = 'shopos-web-my-orders';

function getMyOrderIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(MY_ORDERS_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function addMyOrderId(id: string) {
  if (typeof window === 'undefined') return;
  const ids = getMyOrderIds();
  if (!ids.includes(id)) {
    ids.push(id);
    localStorage.setItem(MY_ORDERS_KEY, JSON.stringify(ids.slice(-100)));
  }
}

const STATUS_STEPS: OrderStatus[] = [
  'pending',
  'processing',
  'shipped',
  'delivered',
];

const STATUS_ICONS: Record<string, any> = {
  pending: Clock,
  processing: Package,
  shipped: Truck,
  delivered: CheckCircle2,
  cancelled: XCircle,
};

export function WebsiteOrders() {
  const searchParams = useSearchParams();
  const successNo = searchParams.get('success');

  const orders = useOrderStore((s) => s.orders);

  const [myIds, setMyIds] = useState<string[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    setMyIds(getMyOrderIds());
  }, []);

  useEffect(() => {
    if (!successNo) return;
    const match = orders.find((o) => o.orderNo === successNo);
    if (match) {
      addMyOrderId(match.id);
      setMyIds(getMyOrderIds());
      setExpandedId(match.id);
    }
  }, [successNo, orders]);

  const myOrders = useMemo(
    () =>
      orders
        .filter((o) => myIds.includes(o.id))
        .sort((a, b) => (a.date < b.date ? 1 : -1)),
    [orders, myIds]
  );

  return (
    <div className="container mx-auto py-6 md:py-8">
      {successNo && (
        <div className="mb-6 rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 flex items-start gap-3">
          <div className="h-10 w-10 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
              Order placed successfully
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">
              Order <span className="font-mono font-medium">{successNo}</span> is
              being processed. We will contact you soon.
            </div>
            <Link
              href="/shop"
              className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 dark:text-emerald-400 hover:underline mt-2"
            >
              Continue shopping
            </Link>
          </div>
        </div>
      )}

      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
          My Orders
        </h1>
        <p className="text-xs md:text-sm text-muted-foreground mt-1">
          {myOrders.length} order{myOrders.length === 1 ? '' : 's'} placed from
          this device
        </p>
      </div>

      {myOrders.length === 0 ? (
        <Card>
          <CardContent className="p-6 md:p-10">
            <EmptyState
              icon={ShoppingBag}
              title="No orders yet"
              description="Your placed orders will appear here for tracking."
              action={
                <Button asChild>
                  <Link href="/shop">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Start Shopping
                  </Link>
                </Button>
              }
            />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {myOrders.map((o) => (
            <OrderRow
              key={o.id}
              order={o}
              expanded={expandedId === o.id}
              onToggle={() =>
                setExpandedId((cur) => (cur === o.id ? null : o.id))
              }
            />
          ))}
        </div>
      )}

      <div className="mt-6 rounded-lg border bg-muted/40 p-3 text-xs text-muted-foreground">
        <strong className="text-foreground">Note:</strong> Orders are stored in
        this browser only. Clearing site data will remove this history.
      </div>
    </div>
  );
}

function OrderRow({
  order,
  expanded,
  onToggle,
}: {
  order: Order;
  expanded: boolean;
  onToggle: () => void;
}) {
  const StatusIcon = STATUS_ICONS[order.status] ?? Clock;
  const totalItems = order.items.reduce((s, i) => s + i.qty, 0);
  const stepIndex = STATUS_STEPS.indexOf(order.status);
  const isCancelled = order.status === 'cancelled';

  return (
    <Card className="overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="w-full text-left p-4 hover:bg-accent/40 transition-colors"
      >
        <div className="flex items-start gap-3 md:gap-4">
          <div
            className={cn(
              'h-11 w-11 shrink-0 rounded-lg flex items-center justify-center',
              order.status === 'delivered'
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                : order.status === 'cancelled'
                ? 'bg-red-500/10 text-red-600 dark:text-red-400'
                : order.status === 'shipped'
                ? 'bg-brand-500/10 text-brand-600 dark:text-brand-400'
                : order.status === 'processing'
                ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
            )}
          >
            <StatusIcon className="h-5 w-5" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2 flex-wrap">
              <div className="min-w-0">
                <div className="text-sm font-semibold flex items-center gap-2 flex-wrap">
                  <span>{order.orderNo}</span>
                  <StatusBadge variant={statusVariant(order.status)}>
                    {order.status}
                  </StatusBadge>
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {formatDateTime(order.date)} · {totalItems} item
                  {totalItems === 1 ? '' : 's'}
                </div>
              </div>
              <div className="text-right">
                <div className="text-base md:text-lg font-bold tabular-nums">
                  {formatCurrency(order.total)}
                </div>
                <div className="text-[10px] text-muted-foreground uppercase">
                  {order.paymentMethod}
                </div>
              </div>
            </div>

            {!isCancelled && (
              <div className="mt-3 flex items-center gap-1.5">
                {STATUS_STEPS.map((s, i) => {
                  const active = i <= stepIndex;
                  return (
                    <div key={s} className="flex-1 flex items-center gap-1">
                      <div
                        className={cn(
                          'h-1.5 flex-1 rounded-full transition-colors',
                          active ? 'bg-brand-500' : 'bg-muted'
                        )}
                      />
                    </div>
                  );
                })}
              </div>
            )}
            {isCancelled && (
              <div className="mt-3 text-xs text-red-600 dark:text-red-400">
                This order was cancelled.
              </div>
            )}
          </div>

          <div className="shrink-0 self-center text-muted-foreground">
            {expanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </div>
        </div>
      </button>

      {expanded && (
        <div className="border-t border-border bg-muted/20">
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">
                Items
              </div>
              <ul className="space-y-2">
                {order.items.map((it) => (
                  <li key={it.productId} className="flex items-start gap-2 text-sm">
                    <div className="h-8 w-8 rounded-md bg-background border flex items-center justify-center text-[10px] font-bold text-brand-500/60 shrink-0">
                      {it.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-medium leading-snug line-clamp-2">
                        {it.name}
                      </div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">
                        {it.sku} · {formatCurrency(it.price)} × {it.qty}
                      </div>
                    </div>
                    <div className="text-xs font-semibold tabular-nums shrink-0">
                      {formatCurrency(it.subtotal)}
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">
                Delivery Details
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex items-start gap-2">
                  <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">
                    {order.deliveryAddress}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <span className="text-muted-foreground">
                    {order.customerPhone}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <CreditCard className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <span className="text-muted-foreground uppercase">
                    {order.paymentMethod}
                  </span>
                </div>
              </div>

              {order.notes && (
                <>
                  <Separator className="my-3" />
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">
                    Order Notes
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {order.notes}
                  </p>
                </>
              )}

              <Separator className="my-3" />

              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="tabular-nums">
                    {formatCurrency(order.subtotal)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Delivery</span>
                  <span className="tabular-nums">
                    {order.delivery === 0 ? (
                      <span className="text-emerald-600 dark:text-emerald-400">
                        FREE
                      </span>
                    ) : (
                      formatCurrency(order.delivery)
                    )}
                  </span>
                </div>
                <div className="flex justify-between pt-1.5 border-t border-border font-semibold">
                  <span>Total</span>
                  <span className="tabular-nums text-brand-600 dark:text-brand-400">
                    {formatCurrency(order.total)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}