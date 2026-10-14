// app/(website)/page.tsx — Storefront homepage (navbar/footer come from the website layout)

import Link from 'next/link';
import {
  ArrowRight,
  Truck,
  ShieldCheck,
  Headphones,
  Store,
  RotateCcw,
  BadgeCheck,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { WebsiteProductCard } from '@/components/website/product-card';
import { demoProducts, demoCategories, demoBrands } from '@/lib/demo-data';
import { CATEGORY_IMAGES, HERO_IMAGE } from '@/lib/product-image';
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
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-950 via-brand-700 to-brand-600 text-white">
        <div className="container mx-auto grid grid-cols-1 lg:grid-cols-2 items-center gap-8 lg:gap-12 py-10 md:py-16 lg:py-20">
          <div className="space-y-5 md:space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium backdrop-blur">
              <BadgeCheck className="h-3.5 w-3.5 text-safety-300" />
              Proudly serving Australian builders &amp; trades
            </span>
            <h1 className="text-3xl leading-[1.1] sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight">
              Tools built for<br className="hidden sm:block" /> the job site.
            </h1>
            <p className="max-w-lg text-sm md:text-base text-white/75 leading-relaxed">
              Power tools, hand tools, safety gear and measuring equipment from trusted brands —
              priced in AUD including GST, with fast delivery across Australia.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 pt-1">
              <Button asChild size="lg" className="h-12 bg-safety-500 hover:bg-safety-600 text-white font-semibold">
                <Link href="/shop">
                  Shop all tools
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-12 bg-transparent border-white/30 text-white hover:bg-white/10 hover:text-white">
                <Link href="/register">Open a trade account</Link>
              </Button>
            </div>
            <div className="grid grid-cols-3 gap-4 pt-4 max-w-md border-t border-white/15">
              <Stat value={`${active.length}+`} label="Products" />
              <Stat value={`${demoBrands.length - 1}`} label="Brands" />
              <Stat value={`${demoCategories.length}`} label="Categories" />
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-4 rounded-3xl bg-safety-500/10 blur-2xl" aria-hidden />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={HERO_IMAGE}
              alt="Drill, hammer, spirit level and tape measure illustration"
              className="relative w-full h-auto rounded-2xl shadow-2xl ring-1 ring-white/10"
            />
          </div>
        </div>
      </section>

      {/* Service band */}
      <section className="border-b border-border bg-background">
        <div className="container mx-auto py-5 md:py-6 grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {services.map((s) => (
            <div key={s.title} className="flex items-center gap-3">
              <div className="h-10 w-10 shrink-0 rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-900 dark:text-brand-300 flex items-center justify-center">
                <s.icon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-semibold leading-tight">{s.title}</div>
                <div className="text-[11px] md:text-xs text-muted-foreground leading-snug mt-0.5">{s.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="container mx-auto py-10 md:py-14">
        <SectionHeading title="Shop by category" subtitle="Find the right tool for the job" href="/shop" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
          {demoCategories.map((c) => {
            const count = active.filter((p) => p.category === c.name).length;
            return (
              <Link
                key={c.id}
                href={`/shop?category=${encodeURIComponent(c.name)}`}
                className="group relative overflow-hidden rounded-xl border bg-card transition-all hover:-translate-y-0.5 hover:shadow-lg"
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
                <div className="flex items-center justify-between gap-2 p-3 md:p-4">
                  <div className="min-w-0">
                    <div className="text-sm font-semibold truncate">{c.name}</div>
                    <div className="text-[11px] text-muted-foreground">
                      {count} product{count === 1 ? '' : 's'}
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-brand-600" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Brand strip */}
      <section className="border-y border-border bg-muted/40">
        <div className="container mx-auto py-6">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">
            Shop by brand
          </div>
          <div className="flex flex-wrap gap-2">
            {demoBrands
              .filter((b) => b.name !== 'Generic')
              .map((b) => (
                <Link
                  key={b.id}
                  href={`/shop?q=${encodeURIComponent(b.name)}`}
                  className="rounded-full border bg-background px-4 py-2 text-sm font-medium hover:border-brand-600 hover:text-brand-600 transition-colors"
                >
                  {b.name}
                </Link>
              ))}
          </div>
        </div>
      </section>

      {/* Top picks */}
      {topPicks.length > 0 && (
        <section className="container mx-auto py-10 md:py-14">
          <SectionHeading title="Top picks" subtitle="Our most-trusted tools on site right now" href="/shop" />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5">
            {topPicks.map((p) => (
              <WebsiteProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* Trade banner */}
      <section className="container mx-auto pb-10 md:pb-14">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-safety-600 to-safety-500 text-white p-6 md:p-10">
          <div className="absolute -right-10 -bottom-16 h-56 w-56 rounded-full bg-white/10" aria-hidden />
          <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <div className="inline-block rounded-full bg-white/20 px-3 py-0.5 text-[11px] font-semibold uppercase tracking-wider">
                For builders &amp; trades
              </div>
              <h2 className="text-2xl md:text-3xl font-extrabold leading-tight">
                Running a crew? Get a trade account.
              </h2>
              <p className="text-sm md:text-base text-white/85">
                Account terms, bulk pricing and a dedicated contact for your site orders.
                Sign up online and our team will be in touch within one business day.
              </p>
            </div>
            <Button asChild size="lg" className="h-12 shrink-0 bg-white text-safety-700 hover:bg-white/90 font-semibold">
              <Link href="/register">
                Apply for trade account
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* New arrivals */}
      <section className="container mx-auto pb-14 md:pb-20">
        <SectionHeading title="New arrivals" subtitle="Fresh stock just landed" href="/shop" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5">
          {newArrivals.map((p) => (
            <WebsiteProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="text-2xl md:text-3xl font-extrabold tabular-nums">{value}</div>
      <div className="text-[11px] uppercase tracking-wider text-white/65 mt-0.5">{label}</div>
    </div>
  );
}

function SectionHeading({ title, subtitle, href }: { title: string; subtitle: string; href: string }) {
  return (
    <div className="flex items-end justify-between gap-4 mb-6 md:mb-8">
      <div>
        <h2 className="text-xl md:text-2xl font-extrabold tracking-tight">{title}</h2>
        <p className="text-xs md:text-sm text-muted-foreground mt-1">{subtitle}</p>
      </div>
      <Link href={href} className="shrink-0 inline-flex items-center gap-1 text-xs md:text-sm font-semibold text-brand-600 dark:text-brand-300 hover:underline">
        View all
        <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}
