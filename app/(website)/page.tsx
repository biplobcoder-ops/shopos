// app/(website)/page.tsx — Storefront homepage

import Link from 'next/link';
import {
  ArrowRight,
  Truck,
  ShieldCheck,
  Headphones,
  Store,
  RotateCcw,
  Flame,
  Star,
  Quote,
  Sparkles,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { WebsiteProductCard } from '@/components/website/product-card';
import { HeroSlider } from '@/components/website/hero-slider';
import { demoProducts, demoCategories, demoBrands } from '@/lib/demo-data';
import { CATEGORY_IMAGES } from '@/lib/product-image';
import { FREE_DELIVERY_THRESHOLD, SUPPORT_PHONE_DISPLAY } from '@/lib/constants';

/* ------------------------------------------------------------------ */
/* Demo data — Deals, Best Sellers, Testimonials                      */
/* ------------------------------------------------------------------ */

const DEALS = [
  { id: 'prod-001', discount: 20 },
  { id: 'prod-006', discount: 25 },
  { id: 'prod-010', discount: 15 },
  { id: 'prod-013', discount: 30 },
];

const TESTIMONIALS = [
  {
    name: 'Michael Thompson',
    location: 'Sydney, NSW',
    rating: 5,
    text: 'Fast delivery, quality tools, and the prices beat my local supplier. Will order again.',
    initials: 'MT',
  },
  {
    name: 'Sarah Wilson',
    location: 'Melbourne, VIC',
    rating: 5,
    text: 'Great range of safety gear. My team is fully kitted out — highly recommend these guys.',
    initials: 'SW',
  },
  {
    name: 'David Chen',
    location: 'Brisbane, QLD',
    rating: 5,
    text: 'Bosch drill arrived next day. Genuine product, great warranty. Five stars from me.',
    initials: 'DC',
  },
];

export default function HomePage() {
  const active = demoProducts.filter((p) => p.status === 'active');
  const topPicks = active.filter((p) => p.grade === 'A' && p.stock > 0).slice(0, 4);
  const newArrivals = [...active]
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
    .slice(0, 8);

  // Best sellers — top by stock movement (using grade + stock as proxy)
  const bestSellers = [...active]
    .sort((a, b) => b.sellingPrice * b.stock - a.sellingPrice * a.stock)
    .slice(0, 8);

  // Deals — pick products by ID + apply discount
  const deals = DEALS.map((d) => {
    const p = active.find((x) => x.id === d.id);
    return p ? { ...p, discount: d.discount } : null;
  }).filter(Boolean);

  const services = [
    { icon: Truck, title: 'Free delivery', sub: `Orders over $${FREE_DELIVERY_THRESHOLD} inc. GST` },
    { icon: Store, title: 'Click & Collect', sub: 'Ready in as little as 2 hours' },
    { icon: RotateCcw, title: '30-day returns', sub: 'Unused items, original packaging' },
    { icon: Headphones, title: 'Expert advice', sub: `Call ${SUPPORT_PHONE_DISPLAY}` },
  ];

  return (
    <div className="flex flex-col">
      {/* ============ 1. HERO SLIDER ============ */}
      <HeroSlider />

      {/* ============ 2. TRUST BAR ============ */}
      <section className="border-b border-border bg-background">
        <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-5 md:py-6 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
          {services.map((s) => (
            <div key={s.title} className="flex items-center gap-2.5 sm:gap-3">
              <div className="h-9 w-9 sm:h-10 sm:w-10 shrink-0 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <s.icon className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <div className="min-w-0">
                <div className="text-[12px] sm:text-sm font-semibold leading-tight truncate">
                  {s.title}
                </div>
                <div className="text-[10px] sm:text-[11px] md:text-xs text-muted-foreground leading-snug mt-0.5 line-clamp-2">
                  {s.sub}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ============ 3. SHOP BY CATEGORY ============ */}
      <section className="container mx-auto px-3 sm:px-4 py-8 sm:py-10 md:py-14">
        <SectionHeading
          title="Shop by category"
          subtitle="Find the right tool for the job"
          href="/shop"
        />
        <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3 md:gap-4">
          {demoCategories.map((c) => {
            const count = active.filter((p) => p.category === c.name).length;
            return (
              <Link
                key={c.id}
                href={`/shop?category=${encodeURIComponent(c.name)}`}
                className="group relative overflow-hidden rounded-xl border bg-card transition-all hover:-translate-y-0.5 hover:shadow-lg hover:border-primary/40"
              >
                <div className="aspect-[4/3] bg-muted overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={CATEGORY_IMAGES[c.name]}
                    alt=""
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="flex items-center justify-between gap-2 p-2.5 sm:p-3 md:p-4">
                  <div className="min-w-0">
                    <div className="text-[12px] sm:text-sm font-semibold truncate">
                      {c.name}
                    </div>
                    <div className="text-[10px] sm:text-[11px] text-muted-foreground">
                      {count} product{count === 1 ? '' : 's'}
                    </div>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ============ 4. 🔥 DEALS / FLASH SALE ============ */}
      {deals.length > 0 && (
        <section className="bg-primary text-primary-foreground py-8 sm:py-10 md:py-14">
          <div className="container mx-auto px-3 sm:px-4">
            <div className="flex items-end justify-between gap-3 sm:gap-4 mb-5 sm:mb-6 md:mb-8">
              <div className="min-w-0">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-accent/20 px-3 py-1 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-accent mb-2">
                  <Flame className="h-3 w-3" />
                  Limited time
                </div>
                <h2 className="text-lg sm:text-xl md:text-2xl font-extrabold tracking-tight flex items-center gap-2">
                  🔥 Flash Sale
                </h2>
                <p className="text-[11px] sm:text-xs md:text-sm text-primary-foreground/70 mt-0.5 sm:mt-1">
                  Up to 30% off top tools — while stocks last
                </p>
              </div>
              <Link
                href="/shop?deals=true"
                className="shrink-0 inline-flex items-center gap-1 text-[11px] sm:text-xs md:text-sm font-semibold text-accent hover:underline"
              >
                View all deals
                <ArrowRight className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3 md:gap-5">
              {deals.map((p) =>
                p ? (
                  <div key={p.id} className="relative">
                    {/* Discount badge */}
                    <div className="absolute top-2 left-2 z-10 rounded-full bg-accent text-accent-foreground px-2.5 py-1 text-[10px] sm:text-xs font-black shadow-lg">
                      −{p.discount}%
                    </div>
                    <WebsiteProductCard product={p} />
                  </div>
                ) : null
              )}
            </div>
          </div>
        </section>
      )}

      {/* ============ 5. ⭐ BEST SELLERS ============ */}
      {bestSellers.length > 0 && (
        <section className="container mx-auto px-3 sm:px-4 py-8 sm:py-10 md:py-14">
          <div className="flex items-end justify-between gap-3 sm:gap-4 mb-4 sm:mb-6 md:mb-8">
            <div className="min-w-0">
              <div className="inline-flex items-center gap-1.5 text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-primary mb-1.5">
                <Star className="h-3 w-3 fill-primary" />
                Trusted by 10,000+ customers
              </div>
              <h2 className="text-lg sm:text-xl md:text-2xl font-extrabold tracking-tight">
                Best Sellers
              </h2>
              <p className="text-[11px] sm:text-xs md:text-sm text-muted-foreground mt-0.5 sm:mt-1">
                Our most popular tools, ordered by customers
              </p>
            </div>
            <Link
              href="/shop"
              className="shrink-0 inline-flex items-center gap-1 text-[11px] sm:text-xs md:text-sm font-semibold text-primary hover:underline"
            >
              View all
              <ArrowRight className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3 md:gap-5">
            {bestSellers.map((p) => (
              <WebsiteProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* ============ 6. TOP PICKS ============ */}
      {topPicks.length > 0 && (
        <section className="bg-muted/30 py-8 sm:py-10 md:py-14">
          <div className="container mx-auto px-3 sm:px-4">
            <SectionHeading
              title="Top picks"
              subtitle="Hand-picked tools our experts recommend"
              href="/shop"
            />
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3 md:gap-5">
              {topPicks.map((p) => (
                <WebsiteProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ============ 7. BRAND STRIP ============ */}
      <section className="border-y border-border bg-background">
        <div className="container mx-auto px-3 sm:px-4 py-5 sm:py-6">
          <div className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2.5 sm:mb-3">
            Shop by brand
          </div>
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {demoBrands
              .filter((b) => b.name !== 'Generic')
              .map((b) => (
                <Link
                  key={b.id}
                  href={`/shop?q=${encodeURIComponent(b.name)}`}
                  className="rounded-full border bg-background px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium hover:border-primary hover:text-primary transition-colors"
                >
                  {b.name}
                </Link>
              ))}
          </div>
        </div>
      </section>

      {/* ============ 8. 📧 NEWSLETTER OFFER ============ */}
      <section className="container mx-auto px-3 sm:px-4 py-8 sm:py-10 md:py-14">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-accent/95 to-accent text-accent-foreground p-5 sm:p-6 md:p-10">
          <div
            className="absolute -right-10 -bottom-16 h-56 w-56 rounded-full bg-white/10"
            aria-hidden
          />
          <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-5 md:gap-6">
            <div className="space-y-2 max-w-xl">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-0.5 text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider">
                <Sparkles className="h-3 w-3" />
                Save 10% on first order
              </div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold leading-tight">
                Join our newsletter
              </h2>
              <p className="text-sm md:text-base text-accent-foreground/85">
                Get 10% off your first order plus exclusive deals, new arrivals and job-site tips.
                Unsubscribe any time.
              </p>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                // handled in footer for demo
              }}
              className="flex flex-col sm:flex-row gap-2 w-full md:w-auto md:min-w-[380px]"
            >
              <input
                type="email"
                placeholder="you@example.com"
                required
                className="h-11 flex-1 rounded-md border-2 border-transparent bg-white/95 px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
              />
              <Button
                type="submit"
                size="lg"
                className="h-11 shrink-0 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
              >
                Get 10% off
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </form>
          </div>
        </div>
      </section>

      {/* ============ 9. 💬 TESTIMONIALS ============ */}
      <section className="bg-muted/30 py-8 sm:py-10 md:py-14">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="text-center mb-6 sm:mb-8 md:mb-10 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-1.5 text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-primary mb-2">
              <Star className="h-3 w-3 fill-primary" />
              Rated 4.9 / 5 by Australian customers
            </div>
            <h2 className="text-lg sm:text-xl md:text-2xl font-extrabold tracking-tight">
              What our customers say
            </h2>
            <p className="text-[11px] sm:text-xs md:text-sm text-muted-foreground mt-1">
              Real reviews from real tradespeople and DIYers
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 md:gap-5">
            {TESTIMONIALS.map((t) => (
              <div
                key={t.name}
                className="relative rounded-xl border bg-card p-4 sm:p-5 md:p-6 shadow-sm"
              >
                <Quote className="absolute top-4 right-4 h-6 w-6 text-primary/10" />
                {/* Stars */}
                <div className="flex items-center gap-0.5 mb-3">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-accent text-accent" />
                  ))}
                </div>
                {/* Text */}
                <p className="text-[13px] sm:text-sm leading-relaxed text-foreground/90">
                  &ldquo;{t.text}&rdquo;
                </p>
                {/* Author */}
                <div className="flex items-center gap-2.5 mt-4 pt-4 border-t border-border">
                  <div className="h-9 w-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold shrink-0">
                    {t.initials}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold truncate">{t.name}</div>
                    <div className="text-[10px] sm:text-[11px] text-muted-foreground truncate">
                      {t.location} · Verified purchase
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ 10. NEW ARRIVALS ============ */}
      <section className="container mx-auto px-3 sm:px-4 py-8 sm:py-10 md:py-14">
        <SectionHeading
          title="New arrivals"
          subtitle="Fresh stock just landed"
          href="/shop?sort=newest"
        />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3 md:gap-5">
          {newArrivals.map((p) => (
            <WebsiteProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

function SectionHeading({
  title,
  subtitle,
  href,
}: {
  title: string;
  subtitle: string;
  href: string;
}) {
  return (
    <div className="flex items-end justify-between gap-3 sm:gap-4 mb-4 sm:mb-6 md:mb-8">
      <div className="min-w-0">
        <h2 className="text-lg sm:text-xl md:text-2xl font-extrabold tracking-tight">
          {title}
        </h2>
        <p className="text-[11px] sm:text-xs md:text-sm text-muted-foreground mt-0.5 sm:mt-1 line-clamp-2">
          {subtitle}
        </p>
      </div>
      <Link
        href={href}
        className="shrink-0 inline-flex items-center gap-1 text-[11px] sm:text-xs md:text-sm font-semibold text-primary hover:underline"
      >
        View all
        <ArrowRight className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
      </Link>
    </div>
  );
}
