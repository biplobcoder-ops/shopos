// app/(website)/product/[id]/page.tsx

'use client';

import { useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Minus,
  Plus,
  ShoppingCart,
  Truck,
  ShieldCheck,
  RotateCcw,
  Package,
  CheckCircle2,
} from 'lucide-react';
import { toast } from 'sonner';
import type { LucideIcon } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EmptyState } from '@/components/shared/empty-state';
import { StatusBadge } from '@/components/shared/status-badge';
import { WebsiteProductCard } from '@/components/website/product-card';
import { useProductStore } from '@/lib/store/product-store';
import { useWebCart } from '@/lib/store/web-cart-store';
import { formatCurrency } from '@/lib/format';
import { productImage } from '@/lib/product-image';
import { FREE_DELIVERY_THRESHOLD, SUPPORT_PHONE_DISPLAY } from '@/lib/constants';
import { getStockStatus, cn } from '@/lib/utils';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const products = useProductStore((s) => s.products);
  const cart = useWebCart();

  const product = products.find((p) => p.id === id);
  const [qty, setQty] = useState(1);

  const related = useMemo(() => {
    if (!product) return [];
    return products
      .filter(
        (p) =>
          p.id !== product.id &&
          p.status === 'active' &&
          (p.category === product.category || p.brand === product.brand)
      )
      .slice(0, 4);
  }, [product, products]);

  if (!product) {
    return (
      <div className="container mx-auto px-3 sm:px-4 py-12 sm:py-16">
        <Card>
          <CardContent className="p-6 sm:p-8">
            <EmptyState
              icon={Package}
              title="Product not found"
              description="This product may have been removed or the link is incorrect."
              action={<Button onClick={() => router.push('/shop')}>Browse all products</Button>}
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  const outOfStock = product.stock <= 0;
  const lowStock = !outOfStock && product.stock <= product.minStock;
  const st = getStockStatus(product.stock, product.minStock);
  const image = productImage(product.sku, product.image);

  const handleAdd = () => {
    if (outOfStock) {
      toast.error(`${product.name} is out of stock`);
      return;
    }
    cart.add(product, qty);
    toast.success(`Added ${qty} × ${product.name} to cart`);
    cart.setDrawerOpen(true);
  };

  const handleBuyNow = () => {
    if (outOfStock) {
      toast.error(`${product.name} is out of stock`);
      return;
    }
    cart.add(product, qty);
    router.push('/checkout');
  };

  return (
    <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-5 md:py-8">
      {/* Breadcrumb */}
      <nav
        aria-label="Breadcrumb"
        className="flex items-center gap-1.5 sm:gap-2 mb-3 sm:mb-4 text-[11px] sm:text-xs text-muted-foreground flex-wrap"
      >
        <Link href="/" className="hover:text-foreground shrink-0">Home</Link>
        <span>/</span>
        <Link
          href={`/shop?category=${encodeURIComponent(product.category)}`}
          className="hover:text-foreground shrink-0"
        >
          {product.category}
        </Link>
        <span>/</span>
        <span className="text-foreground truncate max-w-[160px] sm:max-w-[220px]">
          {product.name}
        </span>
      </nav>

      <Button
        variant="ghost"
        size="sm"
        className="h-8 text-xs -ml-2 mb-2 sm:mb-3 md:mb-5"
        onClick={() => router.back()}
      >
        <ArrowLeft className="h-3.5 w-3.5 mr-1" />
        Back
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6 md:gap-10 mb-8 sm:mb-10">
        {/* Image */}
        <div className="relative aspect-square w-full overflow-hidden rounded-xl sm:rounded-2xl border bg-muted/40 lg:max-h-[560px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={image}
            alt={product.name}
            onError={(e) => {
              const t = e.currentTarget;
              if (!t.src.includes('/images/products/')) {
                t.src = `/images/products/${product.sku.toLowerCase()}.svg`;
              }
            }}
            className="h-full w-full object-cover"
          />

          <div className="absolute top-2 left-2 sm:top-3 sm:left-3 flex flex-col gap-1.5">
            {outOfStock && (
              <Badge variant="destructive" className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1">
                Out of stock
              </Badge>
            )}
            {lowStock && (
              <Badge className="bg-accent text-accent-foreground text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 hover:bg-accent">
                Low stock
              </Badge>
            )}
            {product.grade === 'A' && !outOfStock && (
              <Badge className="bg-primary text-primary-foreground text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 hover:bg-primary">
                Top pick
              </Badge>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="space-y-4 sm:space-y-5">
          <div>
            <div className="flex items-center gap-1.5 sm:gap-2 mb-2 flex-wrap">
              <Badge variant="secondary" className="text-[10px] uppercase tracking-wider">
                {product.brand}
              </Badge>
              <Badge variant="outline" className="text-[10px]">
                {product.category}
              </Badge>
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight leading-tight">
              {product.name}
            </h1>
            <div className="flex items-center gap-2 sm:gap-3 mt-2 text-[11px] sm:text-xs text-muted-foreground flex-wrap">
              <span>
                SKU <span className="font-mono">{product.sku}</span>
              </span>
              <span className="hidden xs:inline">·</span>
              <span className="hidden xs:inline">
                Barcode <span className="font-mono">{product.barcode}</span>
              </span>
            </div>
          </div>

          <div className="rounded-xl border bg-card p-3 sm:p-4 md:p-5">
            <div className="flex items-baseline gap-2">
              <div className="text-2xl sm:text-3xl font-extrabold tabular-nums">
                {formatCurrency(product.sellingPrice)}
              </div>
              <span className="text-[10px] sm:text-xs text-muted-foreground">inc. GST</span>
            </div>

            <div className="flex items-center gap-2 mt-2.5 sm:mt-3 flex-wrap">
              <StatusBadge
                variant={
                  st.variant === 'success'
                    ? 'success'
                    : st.variant === 'warning'
                    ? 'warning'
                    : 'danger'
                }
              >
                {st.label}
              </StatusBadge>
              <span className="text-[11px] sm:text-xs text-muted-foreground">
                {outOfStock
                  ? 'Currently unavailable'
                  : `${product.stock} ${product.unit} available`}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
              <div className="inline-flex items-center border rounded-lg h-11 bg-background">
                <button
                  type="button"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  disabled={outOfStock || qty <= 1}
                  className="w-10 sm:w-11 h-full flex items-center justify-center hover:bg-muted rounded-l-lg disabled:opacity-40"
                  aria-label="Decrease quantity"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <div className="w-11 sm:w-12 text-center text-sm font-semibold tabular-nums">
                  {outOfStock ? 0 : qty}
                </div>
                <button
                  type="button"
                  onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
                  disabled={outOfStock || qty >= product.stock}
                  className="w-10 sm:w-11 h-full flex items-center justify-center hover:bg-muted rounded-r-lg disabled:opacity-40"
                  aria-label="Increase quantity"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <span className="text-[11px] sm:text-xs text-muted-foreground">
                Max {product.stock}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <Button
                size="lg"
                onClick={handleAdd}
                disabled={outOfStock}
                className="h-11 sm:h-12 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Add to cart
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={handleBuyNow}
                disabled={outOfStock}
                className="h-11 sm:h-12"
              >
                Buy now
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-1">
            <Perk icon={Truck} title="Free delivery" sub={`Over $${FREE_DELIVERY_THRESHOLD}`} />
            <Perk icon={ShieldCheck} title="Genuine" sub="Brand warranty" />
            <Perk icon={RotateCcw} title="30-day returns" sub="Unused items" />
          </div>

          <p className="text-[11px] sm:text-xs text-muted-foreground">
            Questions about this tool? Call{' '}
            <a
              className="font-semibold text-primary"
              href={`tel:${SUPPORT_PHONE_DISPLAY.replace(/\s/g, '')}`}
            >
              {SUPPORT_PHONE_DISPLAY}
            </a>
            .
          </p>
        </div>
      </div>

      {/* Details */}
      <div className="mb-10 sm:mb-12">
        <Tabs defaultValue="description">
          <TabsList className="h-10">
            <TabsTrigger value="description" className="text-xs md:text-sm">
              Description
            </TabsTrigger>
            <TabsTrigger value="specs" className="text-xs md:text-sm">
              Specifications
            </TabsTrigger>
          </TabsList>

          <TabsContent value="description">
            <Card>
              <CardContent className="p-4 sm:p-5 md:p-6">
                <p className="text-[13px] sm:text-sm text-muted-foreground leading-relaxed">
                  {product.description ||
                    `${product.name} is a professional-grade tool built for construction sites and serious DIY use. Made from durable materials and tested for everyday trade work.`}
                </p>
                <ul className="mt-4 space-y-2 text-[13px] sm:text-sm text-muted-foreground">
                  {[
                    'Built for trade and professional use',
                    'Backed by the manufacturer warranty',
                    'Pricing in AUD including GST',
                    'Bulk quantities available — ask our team',
                  ].map((t) => (
                    <li key={t} className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="specs">
            <Card>
              <CardContent className="p-4 sm:p-5 md:p-6">
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-0 text-[13px] sm:text-sm">
                  {[
                    ['Brand', product.brand],
                    ['Category', product.category],
                    ['SKU', product.sku],
                    ['Barcode (EAN-13)', product.barcode],
                    ['Unit of sale', product.unit],
                    ['Country', 'Australia (distributed)'],
                  ].map(([label, val]) => (
                    <div
                      key={label}
                      className="flex items-center justify-between gap-3 py-2.5 border-b border-border"
                    >
                      <dt className="text-muted-foreground shrink-0">{label}</dt>
                      <dd className="font-medium text-right truncate">{val}</dd>
                    </div>
                  ))}
                </dl>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {related.length > 0 && (
        <section>
          <div className="flex items-end justify-between gap-3 mb-4 sm:mb-5">
            <h2 className="text-lg sm:text-xl md:text-2xl font-extrabold tracking-tight">
              You may also need
            </h2>
            <Link
              href={`/shop?category=${encodeURIComponent(product.category)}`}
              className="shrink-0 text-[11px] sm:text-xs md:text-sm font-semibold text-primary hover:underline"
            >
              View all
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3 md:gap-5">
            {related.map((p) => (
              <WebsiteProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function Perk({
  icon: Icon,
  title,
  sub,
}: {
  icon: LucideIcon;
  title: string;
  sub: string;
}) {
  return (
    <div className={cn('text-center p-2 sm:p-3 rounded-lg border bg-background')}>
      <Icon className="h-4 w-4 mx-auto text-primary mb-1" />
      <div className="text-[10px] sm:text-[11px] font-semibold leading-tight">{title}</div>
      <div className="text-[9px] sm:text-[10px] text-muted-foreground leading-snug mt-0.5 line-clamp-2">
        {sub}
      </div>
    </div>
  );
}
