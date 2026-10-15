// app/(website)/page.tsx — Storefront homepage (navbar/footer come from the website layout)

import Link from 'next/link';
import {
  ArrowRight,
  Truck,
  ShieldCheck,
  Headphones,
  Store,
  RotateCcw,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { WebsiteProductCard } from '@/components/website/product-card';
import { HeroSlider } from '@/components/website/hero-slider';
import { demoProducts, demoCategories, demoBrands } from '@/lib/demo-data';
import { CATEGORY_IMAGES } from '@/lib/product-image';
import { FREE_DELIVERY_THRESHOLD, SUPPORT_PHONE_DISPLAY } from '@/lib/constants';

export default function HomePage() {
  const active = demoProducts.filter((p) => p.status === 'active');
  const topPicks = active.filter((p) => p.grade === 'A' && p.stock > 0).slice(0, 4);
  const newArrivals = [...active]
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
    .slice(0, 8);

  const services = [
    { icon: Truck, title: 'Free delivery', sub: `Orders over $${FREE_DELIVERY_THRESHOLD} inc. GST` },
    { icon: Store, title: 'Click & Collect', sub: 'Ready in as little as 2 hours' },
    { icon: RotateCcw, title: '30-day returns', sub: 'Unused items, original packaging' },
    { icon: Headphones, title: 'Expert advice', sub: `Call ${SUPPORT_PHONE_DISPLAY}` },
  ];

  return (
    <div className="flex flex-col">
      {/* ============ HERO SLIDER ============ */}
      <HeroSlider />

      {/* ============ SERVICE BAND ============ */}
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

      {/* ============ CATEGORIES ============ */}
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

      {/* ============ BRAND STRIP ============ */}
      <section className="border-y border-border bg-muted/40">
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

      {/* ============ TOP PICKS ============ */}
      {topPicks.length > 0 && (
        <section className="container mx-auto px-3 sm:px-4 py-8 sm:py-10 md:py-14">
          <SectionHeading
            title="Top picks"
            subtitle="Our most-trusted tools on site right now"
            href="/shop"
          />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3 md:gap-5">
            {topPicks.map((p) => (
              <WebsiteProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* ============ TRADE BANNER ============ */}
      <section className="container mx-auto px-3 sm:px-4 pb-8 sm:pb-10 md:pb-14">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-accent/90 to-accent text-accent-foreground p-5 sm:p-6 md:p-10">
          <div
            className="absolute -right-10 -bottom-16 h-56 w-56 rounded-full bg-white/10"
            aria-hidden
          />
          <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-5 md:gap-6">
            <div className="space-y-2 max-w-xl">
              <div className="inline-block rounded-full bg-white/20 px-3 py-0.5 text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider">
                For builders &amp; trades
              </div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold leading-tight">
                Running a crew? Get a trade account.
              </h2>
              <p className="text-sm md:text-base text-accent-foreground/85">
                Account terms, bulk pricing and a dedicated contact for your site orders.
                Sign up online and our team will be in touch within one business day.
              </p>
            </div>
            <Button
              asChild
              size="lg"
              className="h-11 sm:h-12 w-full md:w-auto shrink-0 bg-background text-foreground hover:bg-background/90 font-semibold"
            >
              <Link href="/register">
                Apply for trade account
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ============ NEW ARRIVALS ============ */}
      <section className="container mx-auto px-3 sm:px-4 pb-12 sm:pb-14 md:pb-20">
        <SectionHeading
          title="New arrivals"
          subtitle="Fresh stock just landed"
          href="/shop"
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
