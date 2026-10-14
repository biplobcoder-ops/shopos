// components/pos/held-carts.tsx

'use client';

import { Play, Trash2, PauseCircle } from 'lucide-react';
import { useCartStore } from '@/lib/store/cart-store';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { EmptyState } from '@/components/shared/empty-state';
import { formatCurrency, formatDateTime } from '@/lib/format';

export function HeldCarts() {
  const { heldCarts, resumeCart, removeHeld } = useCartStore();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-9">
          <PauseCircle className="h-4 w-4 mr-2" />
          Held
          {heldCarts.length > 0 && (
            <span className="ml-2 inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full bg-brand-500 text-white text-[10px] font-bold">
              {heldCarts.length}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="px-3 py-2 border-b border-border">
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Held Carts
          </div>
        </div>
        {heldCarts.length === 0 ? (
          <EmptyState title="No held carts" className="py-8" />
        ) : (
          <ul className="max-h-[320px] overflow-y-auto">
            {heldCarts.map((h) => {
              const sub = h.items.reduce((s, i) => s + i.price * i.qty - i.discount, 0);
              const total = Math.max(0, sub - h.discount);
              return (
                <li
                  key={h.id}
                  className="border-b last:border-0 border-border p-3 flex items-center gap-2 hover:bg-accent/50"
                >
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium">
                      {h.items.length} item{h.items.length > 1 ? 's' : ''} ·{' '}
                      {formatCurrency(total)}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {formatDateTime(h.createdAt)}
                    </div>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8"
                    onClick={() => resumeCart(h.id)}
                    title="Resume"
                  >
                    <Play className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-red-500 hover:text-red-500 hover:bg-red-500/10"
                    onClick={() => removeHeld(h.id)}
                    title="Delete"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </li>
              );
            })}
          </ul>
        )}
      </PopoverContent>
    </Popover>
  );
}