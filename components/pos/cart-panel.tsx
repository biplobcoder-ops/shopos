// components/pos/cart-panel.tsx

'use client';

import { Minus, Plus, Trash2, ShoppingCart, PauseCircle, X } from 'lucide-react';
import { useCartStore } from '@/lib/store/cart-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { EmptyState } from '@/components/shared/empty-state';
import { CustomerSelector } from './customer-selector';
import { formatCurrency } from '@/lib/format';
import { cn } from '@/lib/utils';

interface Props {
  onPay: () => void;
  onHold: () => void;
  onClear: () => void;
  compact?: boolean; // true = mobile bottom sheet style
}

export function CartPanel({ onPay, onHold, onClear, compact }: Props) {
  const {
    items,
    discount,
    setDiscount,
    updateQty,
    removeItem,
    subtotal,
    itemDiscountTotal,
    total,
  } = useCartStore();

  const sub = subtotal();
  const itemDisc = itemDiscountTotal();
  const grand = total();
  const count = items.reduce((s, i) => s + i.qty, 0);
  const isEmpty = items.length === 0;

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Header */}
      <div className="flex items-center gap-2 pb-3 shrink-0">
        <ShoppingCart className="h-4 w-4 text-brand-500" />
        <div className="text-sm font-semibold">Cart</div>
        {count > 0 && (
          <span className="inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full bg-brand-500 text-white text-[10px] font-bold">
            {count}
          </span>
        )}
        <div className="ml-auto flex items-center gap-1">
          {!isEmpty && (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="h-7 text-xs text-red-600 hover:text-red-600 hover:bg-red-500/10"
              onClick={onClear}
            >
              <X className="h-3.5 w-3.5 mr-1" />
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Customer */}
      <div className="shrink-0 mb-3">
        <CustomerSelector />
      </div>

      {/* Items */}
      <div className="flex-1 overflow-y-auto -mr-2 pr-2 min-h-0">
        {isEmpty ? (
          <EmptyState
            icon={ShoppingCart}
            title="Cart is empty"
            description="Tap a product to add it to the cart."
            className="py-10"
          />
        ) : (
          <ul className="space-y-2">
            {items.map((it) => (
              <li
                key={it.productId}
                className="rounded-lg border bg-card p-2.5 hover:shadow-sm transition"
              >
                <div className="flex items-start gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-medium leading-snug line-clamp-2">
                      {it.name}
                    </div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">
                      {it.sku} · {formatCurrency(it.price)}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(it.productId)}
                    className="text-muted-foreground hover:text-red-500 p-1 -mr-1 -mt-1 rounded"
                    title="Remove"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="flex items-center justify-between mt-2 gap-2">
                  <div className="inline-flex items-center border rounded-md h-7 bg-background">
                    <button
                      type="button"
                      onClick={() => updateQty(it.productId, it.qty - 1)}
                      className="w-7 h-full flex items-center justify-center hover:bg-muted disabled:opacity-50"
                      disabled={it.qty <= 1}
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <div className="w-8 text-center text-xs font-semibold tabular-nums">
                      {it.qty}
                    </div>
                    <button
                      type="button"
                      onClick={() => updateQty(it.productId, it.qty + 1)}
                      disabled={it.qty >= it.stock}
                      className="w-7 h-full flex items-center justify-center hover:bg-muted disabled:opacity-50"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                  <div className="text-sm font-bold tabular-nums">
                    {formatCurrency(it.price * it.qty - it.discount)}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Summary */}
      <div className="shrink-0 border-t border-border pt-3 mt-3 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="tabular-nums font-medium">{formatCurrency(sub)}</span>
        </div>

        {itemDisc > 0 && (
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Item discounts</span>
            <span className="tabular-nums font-medium text-red-600 dark:text-red-400">
              -{formatCurrency(itemDisc)}
            </span>
          </div>
        )}

        <div className="flex items-center justify-between text-xs gap-2">
          <span className="text-muted-foreground">Invoice discount</span>
          <Input
            type="number"
            min={0}
            value={discount || ''}
            onChange={(e) => setDiscount(Number(e.target.value) || 0)}
            placeholder="0"
            className="h-7 w-24 text-right text-xs tabular-nums"
          />
        </div>

        <div className="flex items-center justify-between border-t pt-2 mt-1">
          <span className="text-sm font-semibold">Total</span>
          <span className="text-lg font-bold tabular-nums text-brand-600 dark:text-brand-400">
            {formatCurrency(grand)}
          </span>
        </div>

        {/* Actions */}
        <div className={cn('grid gap-2 pt-1', compact ? 'grid-cols-2' : 'grid-cols-[1fr_auto]')}>
          <Button
            type="button"
            size="lg"
            className="h-11"
            disabled={isEmpty}
            onClick={onPay}
          >
            Pay {!isEmpty && `· ${formatCurrency(grand)}`}
          </Button>
          {!compact && (
            <Button
              type="button"
              size="lg"
              variant="outline"
              className="h-11"
              disabled={isEmpty}
              onClick={onHold}
              title="Hold cart (F4)"
            >
              <PauseCircle className="h-4 w-4" />
            </Button>
          )}
          {compact && (
            <Button
              type="button"
              size="lg"
              variant="outline"
              className="h-11"
              disabled={isEmpty}
              onClick={onHold}
            >
              <PauseCircle className="h-4 w-4 mr-2" />
              Hold
            </Button>
          )}
        </div>

        {!compact && (
          <div className="text-[10px] text-muted-foreground text-center pt-1">
            F2 pay · F4 hold · Esc clear
          </div>
        )}
      </div>
    </div>
  );
}