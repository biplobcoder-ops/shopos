// components/website/cart-drawer.tsx

'use client';

import { productImage } from '@/lib/product-image';
import Link from 'next/link';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/shared/empty-state';
import { useWebCart } from '@/lib/store/web-cart-store';
import { formatCurrency } from '@/lib/format';

export function WebsiteCartDrawer() {
  const cart = useWebCart();
  const open = cart.drawerOpen;
  const setOpen = cart.setDrawerOpen;
  const count = cart.count();
  const subtotal = cart.subtotal();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent side="right" className="w-full sm:w-[420px] p-0 flex flex-col">
        <SheetHeader className="px-4 py-3 border-b border-border">
          <SheetTitle className="flex items-center gap-2">
            <ShoppingBag className="h-4 w-4" />
            Shopping Cart
            {count > 0 && (
              <span className="inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full bg-brand-600 text-white text-[10px] font-bold">
                {count}
              </span>
            )}
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto">
          {cart.items.length === 0 ? (
            <EmptyState
              icon={ShoppingBag}
              title="Your cart is empty"
              description="Browse our products and add items to get started."
              className="py-16"
              action={
                <Button onClick={() => setOpen(false)} asChild>
                  <Link href="/shop">Browse Products</Link>
                </Button>
              }
            />
          ) : (
            <ul className="divide-y divide-border">
              {cart.items.map((it) => (
                <li key={it.productId} className="p-4 flex gap-3">
                  <Link
                    href={`/product/${it.productId}`}
                    onClick={() => setOpen(false)}
                    className="h-16 w-16 rounded-lg overflow-hidden bg-muted/40 shrink-0"
                  >
                    <img src={productImage(it.sku)} alt="" className="h-full w-full object-cover" />
                  </Link>
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/product/${it.productId}`}
                      onClick={() => setOpen(false)}
                      className="text-sm font-medium leading-snug line-clamp-2 hover:text-brand-600 dark:hover:text-brand-400"
                    >
                      {it.name}
                    </Link>
                    <div className="text-[10px] text-muted-foreground mt-0.5">
                      {it.sku}
                    </div>
                    <div className="flex items-center justify-between mt-2 gap-2">
                      <div className="inline-flex items-center border rounded-md h-7 bg-background">
                        <button
                          type="button"
                          onClick={() => cart.updateQty(it.productId, it.qty - 1)}
                          className="w-7 h-full flex items-center justify-center hover:bg-muted"
                          aria-label="Decrease"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <div className="w-8 text-center text-xs font-semibold tabular-nums">
                          {it.qty}
                        </div>
                        <button
                          type="button"
                          onClick={() => cart.updateQty(it.productId, it.qty + 1)}
                          disabled={it.qty >= it.stock}
                          className="w-7 h-full flex items-center justify-center hover:bg-muted disabled:opacity-40"
                          aria-label="Increase"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <div className="text-sm font-bold tabular-nums">
                        {formatCurrency(it.price * it.qty)}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => cart.remove(it.productId)}
                    className="self-start p-1 -mr-1 rounded text-muted-foreground hover:text-red-500"
                    aria-label="Remove"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {cart.items.length > 0 && (
          <div className="border-t border-border p-4 space-y-3 bg-background">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-semibold tabular-nums">
                {formatCurrency(subtotal)}
              </span>
            </div>
            <p className="text-[10px] text-muted-foreground">
              Delivery charges calculated at checkout.
            </p>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                onClick={() => setOpen(false)}
                className="h-10"
                asChild
              >
                <Link href="/cart">View Cart</Link>
              </Button>
              <Button onClick={() => setOpen(false)} className="h-10" asChild>
                <Link href="/checkout">
                  Checkout
                  <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                </Link>
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}