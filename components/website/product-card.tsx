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
      <Link href={`/product/${product.id}`} className="flex flex-col flex-1">
        <div className="relative aspect-square bg-muted/40 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={productImage(product.sku, product.image)}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />

          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {outOfStock && (
              <Badge variant="destructive" className="text-[10px] px-1.5 py-0.5 h-5">
                Out of stock
              </Badge>
            )}
            {lowStock && (
              <Badge className="text-[10px] px-1.5 py-0.5 h-5 bg-accent/15 text-accent border-0 hover:bg-accent/15">
                Low stock
              </Badge>
            )}
            {product.grade === 'A' && !outOfStock && (
              <Badge className="text-[10px] px-1.5 py-0.5 h-5 bg-primary text-primary-foreground border-0 hover:bg-primary">
                Top pick
              </Badge>
            )}
          </div>

          {quickAdd && !outOfStock && (
            <Button
              size="icon"
              onClick={handleAdd}
              className="absolute bottom-2 right-2 h-10 w-10 rounded-full shadow-md bg-primary text-primary-foreground hover:bg-primary/90 md:opacity-0 md:group-hover:opacity-100 md:focus-visible:opacity-100 transition-opacity"
              aria-label={`Add ${product.name} to cart`}
            >
              <ShoppingCart className="h-4 w-4" />
            </Button>
          )}
        </div>

        <div className="p-3 md:p-4 flex flex-col flex-1">
          <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
            {product.brand}
          </div>
          <div className="text-sm font-medium leading-snug line-clamp-2 mt-1 min-h-[2.6em] group-hover:text-primary transition-colors">
            {product.name}
          </div>

          <div className="flex items-center gap-1 mt-2 text-[11px] text-muted-foreground">
            <Package className="h-3 w-3 shrink-0" />
            {outOfStock ? (
              <span className="text-destructive font-medium">Currently unavailable</span>
            ) : (
              <span className="truncate">
                In stock · {product.stock} {product.unit}
              </span>
            )}
          </div>

          <div className="flex-1" />

          <div className="mt-3 pt-3 border-t border-border flex items-end justify-between gap-2">
            <div>
              <div className="text-base md:text-lg font-bold tabular-nums leading-none">
                {formatCurrency(product.sellingPrice)}
              </div>
              <div className="text-[10px] text-muted-foreground mt-1">inc. GST</div>
            </div>
            {quickAdd && (
              <Button
                size="sm"
                variant={outOfStock ? 'outline' : 'default'}
                disabled={outOfStock}
                onClick={handleAdd}
                className={cn(
                  'h-9 text-xs md:hidden',
                  !outOfStock && 'bg-primary text-primary-foreground hover:bg-primary/90'
                )}
              >
                <ShoppingCart className="h-3.5 w-3.5 mr-1" />
                Add
              </Button>
            )}
          </div>
        </div>
      </Link>
    </Card>
  );
}
