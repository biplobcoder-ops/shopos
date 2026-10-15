// components/website/product-card.tsx

'use client';

import Link from 'next/link';
import { ShoppingCart, Package } from 'lucide-react';
import { toast } from 'sonner';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useWebCart } from '@/lib/store/web-cart-store';
import { formatCurrency } from '@/lib/format';
import { productImage } from '@/lib/product-image';
import { cn } from '@/lib/utils';
import type { Product } from '@/lib/types';

interface Props {
  product: Product;
  quickAdd?: boolean;
  className?: string;
}

export function WebsiteProductCard({ product, quickAdd = true, className }: Props) {
  const cart = useWebCart();
  const outOfStock = product.stock <= 0;
  const lowStock = !outOfStock && product.stock <= product.minStock;

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (outOfStock) {
      toast.error(`${product.name} is out of stock`);
      return;
    }
    cart.add(product);
    toast.success(`Added ${product.name} to cart`);
  };

  return (
    <Card
      className={cn(
        'group overflow-hidden flex flex-col transition-all duration-200',
        'hover:shadow-lg hover:border-primary/40',
        className
      )}
    >
      <Link
        href={`/product/${product.id}`}
        className="flex flex-col flex-1 min-w-0"
      >
        {/* ---------- IMAGE ---------- */}
        <div className="relative aspect-square bg-muted/40 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={productImage(product.sku, product.image)}
            alt={product.name}
            loading="lazy"
            onError={(e) => {
              const t = e.currentTarget;
              if (!t.src.includes('/images/products/')) {
                t.src = `/images/products/${product.sku.toLowerCase()}.svg`;
              }
            }}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />

          {/* Badges — constrain width so they don't overlap */}
          <div className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 flex flex-col gap-1 max-w-[70%]">
            {outOfStock && (
              <Badge
                variant="destructive"
                className="text-[9px] sm:text-[10px] px-1.5 py-0 h-4 sm:h-5 w-fit"
              >
                Out of stock
              </Badge>
            )}
            {lowStock && (
              <Badge className="text-[9px] sm:text-[10px] px-1.5 py-0 h-4 sm:h-5 w-fit bg-accent/15 text-accent border-0 hover:bg-accent/15">
                Low stock
              </Badge>
            )}
            {product.grade === 'A' && !outOfStock && (
              <Badge className="text-[9px] sm:text-[10px] px-1.5 py-0 h-4 sm:h-5 w-fit bg-primary text-primary-foreground border-0 hover:bg-primary">
                Top pick
              </Badge>
            )}
          </div>

          {/* Floating quick-add — hidden on mobile (bottom button suffices) */}
          {quickAdd && !outOfStock && (
            <Button
              size="icon"
              onClick={handleAdd}
              className="hidden sm:flex absolute bottom-2 right-2 h-9 w-9 md:h-10 md:w-10 rounded-full shadow-md bg-primary text-primary-foreground hover:bg-primary/90 md:opacity-0 md:group-hover:opacity-100 md:focus-visible:opacity-100 transition-opacity"
              aria-label={`Add ${product.name} to cart`}
            >
              <ShoppingCart className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* ---------- INFO ---------- */}
        <div className="p-2.5 sm:p-3 md:p-4 flex flex-col flex-1 min-w-0">
          {/* Brand */}
          <div className="text-[9px] sm:text-[10px] font-semibold text-muted-foreground uppercase tracking-wider truncate">
            {product.brand}
          </div>

          {/* Name */}
          <div className="text-[13px] sm:text-sm font-medium leading-snug line-clamp-2 mt-1 min-h-[2.4em] group-hover:text-primary transition-colors">
            {product.name}
          </div>

          {/* Stock info */}
          <div className="flex items-center gap-1 mt-1.5 sm:mt-2 text-[10px] sm:text-[11px] text-muted-foreground">
            <Package className="h-3 w-3 shrink-0" />
            {outOfStock ? (
              <span className="text-destructive font-medium truncate">
                Currently unavailable
              </span>
            ) : (
              <span className="truncate">
                In stock · {product.stock} {product.unit}
              </span>
            )}
          </div>

          <div className="flex-1" />

          {/* ---------- PRICE + ADD ---------- */}
          <div className="mt-2.5 sm:mt-3 pt-2.5 sm:pt-3 border-t border-border flex items-end justify-between gap-2 min-w-0">
            <div className="min-w-0 flex-1">
              <div className="text-[15px] sm:text-base md:text-lg font-bold tabular-nums leading-none truncate">
                {formatCurrency(product.sellingPrice)}
              </div>
              <div className="text-[9px] sm:text-[10px] text-muted-foreground mt-0.5 sm:mt-1">
                inc. GST
              </div>
            </div>

            {quickAdd && (
              <Button
                size="sm"
                variant={outOfStock ? 'outline' : 'default'}
                disabled={outOfStock}
                onClick={handleAdd}
                className={cn(
                  'h-8 sm:h-9 shrink-0 px-2.5 sm:px-3 text-xs md:hidden',
                  !outOfStock && 'bg-primary text-primary-foreground hover:bg-primary/90'
                )}
                aria-label={`Add ${product.name} to cart`}
              >
                <ShoppingCart className="h-3.5 w-3.5 sm:mr-1" />
                <span className="hidden xs:inline sm:inline">Add</span>
              </Button>
            )}
          </div>
        </div>
      </Link>
    </Card>
  );
}
