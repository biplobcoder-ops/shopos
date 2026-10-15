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

                    <div className="flex items-center justify-between gap-2 mt-2.5 sm:
