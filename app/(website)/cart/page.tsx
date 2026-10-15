// app/(website)/cart/page.tsx

'use client';

import { FREE_DELIVERY_THRESHOLD, DELIVERY_CHARGE } from '@/lib/constants';
import { productImage } from '@/lib/product-image';
import Link from 'next/link';
import {
  Minus,
  Plus,
  Trash2,
  ShoppingBag,
  ArrowRight,
  ArrowLeft,
  Truck,
  ShieldCheck,
  Tag,
} from 'lucide-react';
import { toast } from 'sonner';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { EmptyState } from '@/components/shared/empty-state';
import { useWebCart } from '@/lib/store/web-cart-store';
import { formatCurrency } from '@/lib/format';

export default function CartPage() {
  const cart = useWebCart();
  const items = useWebCart((s) => s.items);

  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const count = items.reduce((s, i) => s + i.qty, 0);

  const delivery =
    subtotal === 0 || subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_CHARGE;
  const total = subtotal + delivery;
  const remaining = Math.max(0, FREE_DELIVERY_THRESHOLD - subtotal);

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-3 sm:px-4 py-10 md:py-16">
        <Card>
          <CardContent className="p-6 md:p-10">
            <EmptyState
              icon={ShoppingBag}
              title="Your cart is empty"
              description="Browse our catalog and add tools to your cart."
              action={
                <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
                  <Link href="/shop">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Continue Shopping
                  </Link>
                </Button>
              }
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">
          Shopping Cart
        </h1>
        <p className="text-[11px] sm:text-xs md:text-sm text-muted-foreground mt-1">
          {count} item{count === 1 ? '' : 's'} in your cart
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-5 sm:gap-6">
        {/* ============ ITEMS ============ */}
        <div className="space-y-2.5 sm:space-y-3 min-w-0">
          {items.map((it) => (
            <Card key={it.productId} className="overflow-hidden">
              <CardContent className="p-2.5 sm:p-3 md:p-4">
                <div className="flex gap-2.5 sm:gap-3 md:gap-4">
                  <Link
                    href={`/product/${it.productId}`}
                    className="h-16 w-16 xs:h-20 xs:w-20 sm:h-20 sm:w-20 md:h-24 md:w-24 rounded-lg overflow-hidden bg-muted/40 shrink-0"
                  >
                    <img
                      src={productImage(it.sku)}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  </Link>

                  <div className="min-w-0 flex-1 flex flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <Link
                          href={`/product/${it.productId}`}
                          className="text-[13px] sm:text-sm md:text-base font-medium leading-snug line-clamp-2 hover:text-primary transition-colors"
                        >
                          {it.name}
                        </Link>
                        <div className="text-[10px] sm:text-[11px] md:text-xs text-muted-foreground mt-0.5 truncate">
                          SKU: {it.sku}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          cart.remove(it.productId);
                          toast.success('Removed from cart');
                        }}
                        className="p-1.5 -mr-1 -mt-1 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0"
                        aria-label="Remove"
                      >
                        <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      </button>
                    </div>

                    <div className="flex-1" />

                    <div className="flex items-center justify-between gap-2 mt-2.5 sm:mt-3 flex-wrap">
                      <div className="inline-flex items-center border rounded-md h-8 sm:h-9 bg-background">
                        <button
                          type="button"
                          onClick={() => cart.updateQty(it.productId, it.qty - 1)}
                          className="w-8 sm:w-9 h-full flex items-center justify-center hover:bg-muted rounded-l-md disabled:opacity-40"
                          aria-label="Decrease"
                        >
                          <Minus className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                        </button>
                        <div className="w-9 sm:w-10 text-center text-xs sm:text-sm font-semibold tabular-nums">
                          {it.qty}
                        </div>
                        <button
                          type="button"
                          onClick={() => cart.updateQty(it.productId, it.qty + 1)}
                          disabled={it.qty >= it.stock}
                          className="w-8 sm:w-9 h-full flex items-center justify-center hover:bg-muted rounded-r-md disabled:opacity-40"
                          aria-label="Increase"
                        >
                          <Plus className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                        </button>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="text-[10px] sm:text-[11px] md:text-xs text-muted-foreground">
                          {formatCurrency(it.price)} × {it.qty}
                        </div>
                        <div className="text-sm sm:text-base md:text-lg font-bold tabular-nums">
                          {formatCurrency(it.price * it.qty)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          <div className="flex items-center justify-between gap-2 pt-1 sm:pt-2 flex-wrap">
            <Button asChild variant="ghost" size="sm" className="h-9 text-xs sm:text-sm">
              <Link href="/shop">
                <ArrowLeft className="h-4 w-4 mr-1.5 sm:mr-2" />
                Continue Shopping
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-9 text-xs sm:text-sm text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={() => {
                cart.clear();
                toast.success('Cart cleared');
              }}
            >
              <Trash2 className="h-4 w-4 mr-1.5 sm:mr-2" />
              Clear Cart
            </Button>
          </div>
        </div>

        {/* ============ SUMMARY ============ */}
        <div className="lg:sticky lg:top-20 self-start">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {remaining > 0 ? (
                <div className="rounded-lg border bg-amber-500/5 border-amber-500/20 p-2.5 sm:p-3">
                  <div className="flex items-center gap-2 text-[11px] sm:text-xs text-amber-700 dark:text-amber-400">
                    <Truck className="h-3.5 w-3.5 shrink-0" />
                    <span className="min-w-0">
                      Add{' '}
                      <span className="font-semibold">
                        {formatCurrency(remaining)}
                      </span>{' '}
                      more for free delivery
                    </span>
                  </div>
                  <div className="mt-2 h-1.5 rounded-full bg-amber-500/20 overflow-hidden">
                    <div
                      className="h-full bg-amber-500 transition-all duration-500"
                      style={{
                        width: `${Math.min(
                          100,
                          (subtotal / FREE_DELIVERY_THRESHOLD) * 100
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              ) : (
                <div className="rounded-lg border bg-emerald-500/5 border-emerald-500/20 p-2.5 sm:p-3 flex items-center gap-2 text-[11px] sm:text-xs text-emerald-700 dark:text-emerald-400">
                  <Truck className="h-3.5 w-3.5 shrink-0" />
                  <span className="font-medium">You qualify for FREE delivery</span>
                </div>
              )}

              <Separator />

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="tabular-nums font-medium">
                    {formatCurrency(subtotal)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Delivery</span>
                  <span className="tabular-nums font-medium">
                    {delivery === 0 ? (
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                        FREE
                      </span>
                    ) : (
                      formatCurrency(delivery)
                    )}
                  </span>
                </div>
              </div>

              <Separator />

              <div className="flex justify-between items-baseline">
                <span className="text-sm font-semibold">Total</span>
                <span className="text-xl font-bold tabular-nums text-primary">
                  {formatCurrency(total)}
                </span>
              </div>

              <p className="text-[10px] text-muted-foreground flex items-start gap-1.5">
                <Tag className="h-3 w-3 shrink-0 mt-0.5" />
                Inclusive of all taxes. Final amount confirmed at checkout.
              </p>

              <Button
                asChild
                size="lg"
                className="w-full h-11 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Link href="/checkout">
                  Proceed to Checkout
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>

              <div className="pt-2 space-y-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                  <span>Secure checkout · SSL encrypted</span>
                </div>
                <div className="flex items-center gap-2">
                  <Truck className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span>Delivery within 2-5 working days</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
