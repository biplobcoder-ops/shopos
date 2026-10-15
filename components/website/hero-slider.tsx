// components/website/hero-slider.tsx

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  BadgeCheck,
  Flame,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { FREE_DELIVERY_THRESHOLD } from '@/lib/constants';

/* ============================================
   Slide type + data
   ============================================ */

interface Slide {
  badge: string;
  title: string;
  titleLine2?: string;
  subtitle: string;
  image: string;
  imageAlt: string;
  primaryCta: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
  stats?: { value: string; label: string }[];
  dealBadge?: boolean; // ← new: show 🔥 icon in badge
}

const SLIDES: Slide[] = [
  // -------- Slide 1: Main storefront --------
  {
    badge: "Australia's trusted tool shop",
    title: 'Tools built for',
    titleLine2: 'the job site.',
    subtitle:
      'Power tools, hand tools, safety gear and measuring equipment from trusted brands — priced in AUD including GST, with fast delivery across Australia.',
    image:
      'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=1200&q=80&auto=format&fit=crop',
    imageAlt: 'Professional power drill on a workbench',
    primaryCta: { label: 'Shop all tools', href: '/shop' },
    secondaryCta: { label: 'Browse new arrivals', href: '/shop?sort=newest' },
    stats: [
      { value: '55+', label: 'Products' },
      { value: '6', label: 'Brands' },
      { value: '5', label: 'Categories' },
    ],
  },

  // -------- Slide 2: New arrivals --------
  {
    badge: 'New arrivals — just landed',
    title: 'Latest gear for',
    titleLine2: 'every job.',
    subtitle:
      'Fresh stock from Bosch, Makita, DeWalt and Stanley. Quality tools ready to ship Australia-wide.',
    image:
      'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=1200&q=80&auto=format&fit=crop',
    imageAlt: 'Power tools arranged on a workbench',
    primaryCta: { label: 'Browse new arrivals', href: '/shop?sort=newest' },
    secondaryCta: { label: 'Shop by category', href: '/shop' },
  },

  // -------- Slide 3: Deal — 20% off Bosch --------
  {
    badge: 'Limited time offer — ends Sunday',
    title: '20% off Bosch',
    titleLine2: 'power tools.',
    subtitle: `Save on top Bosch drills, grinders and saws. Free delivery on orders over $${FREE_DELIVERY_THRESHOLD}.`,
    image:
      'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=1200&q=80&auto=format&fit=crop',
    imageAlt: 'Bosch power tools on sale',
    primaryCta: { label: 'Shop Bosch deals', href: '/shop?q=Bosch' },
    secondaryCta: { label: 'View all deals', href: '/shop' },
    dealBadge: true,
  },
];

const AUTOPLAY_MS = 5000;

/* ============================================
   Component
   ============================================ */

export function HeroSlider() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const total = SLIDES.length;

  const goTo = useCallback(
    (i: number) => {
      setIndex(((i % total) + total) % total);
    },
    [total]
  );

  const next = useCallback(() => goTo(index + 1), [goTo, index]);
  const prev = useCallback(() => goTo(index - 1), [goTo, index]);

  /* -------- Autoplay -------- */
  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => {
      setIndex((i) => (i + 1) % total);
    }, AUTOPLAY_MS);
    return () => clearInterval(t);
  }, [paused, total]);

  /* -------- Keyboard nav -------- */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') prev();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [next, prev]);

  /* -------- Touch swipe -------- */
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.changedTouches[0].clientX;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.changedTouches[0].clientX;
  };

  const onTouchEnd = () => {
    if (touchStartX.current === null || touchEndX.current === null) return;
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 50) {
      if (diff > 0) next();
      else prev();
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  return (
    <section
      className="relative overflow-hidden bg-gradient-to-br from-primary via-primary/95 to-primary/85 text-primary-foreground"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      aria-roledescription="carousel"
      aria-label="Store highlights"
    >
      {/* Slides */}
      <div className="relative">
        {SLIDES.map((slide, i) => (
          <div
            key={i}
            className={cn(
              'transition-opacity duration-700 ease-out',
              i === index
                ? 'relative opacity-100 z-10'
                : 'absolute inset-0 opacity-0 pointer-events-none z-0'
            )}
            aria-hidden={i !== index}
          >
            <SlideContent slide={slide} />
          </div>
        ))}
      </div>

      {/* Prev / Next arrows */}
      <button
        type="button"
        onClick={prev}
        aria-label="Previous slide"
        className="hidden sm:flex absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-20 h-10 w-10 md:h-11 md:w-11 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 backdrop-blur text-primary-foreground border border-white/20 transition-colors"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        type="button"
        onClick={next}
        aria-label="Next slide"
        className="hidden sm:flex absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-20 h-10 w-10 md:h-11 md:w-11 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 backdrop-blur text-primary-foreground border border-white/20 transition-colors"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      {/* Dot indicators */}
      <div className="absolute bottom-4 sm:bottom-5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => goTo(i)}
            aria-label={`Go to slide ${i + 1}`}
            aria-current={i === index}
            className={cn(
              'h-1.5 rounded-full transition-all duration-300',
              i === index
                ? 'w-6 sm:w-8 bg-accent'
                : 'w-1.5 bg-white/40 hover:bg-white/70'
            )}
          />
        ))}
      </div>
    </section>
  );
}

/* ============================================
   Single slide content
   ============================================ */

function SlideContent({ slide }: { slide: Slide }) {
  return (
    <div className="container mx-auto px-3 sm:px-4 grid grid-cols-1 lg:grid-cols-2 items-center gap-6 sm:gap-8 lg:gap-12 py-8 sm:py-10 md:py-16 lg:py-20">
      {/* Left — text */}
      <div className="space-y-4 sm:space-y-5 md:space-y-6 order-2 lg:order-1">
        <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[11px] sm:text-xs font-medium backdrop-blur max-w-full">
          {slide.dealBadge ? (
            <Flame className="h-3.5 w-3.5 text-accent shrink-0" />
          ) : (
            <BadgeCheck className="h-3.5 w-3.5 text-accent shrink-0" />
          )}
          <span className="truncate">{slide.badge}</span>
        </span>

        <h1 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1]">
          {slide.title}
          {slide.titleLine2 && (
            <>
              <br className="hidden sm:block" /> {slide.titleLine2}
            </>
          )}
        </h1>

        <p className="max-w-lg text-sm md:text-base text-primary-foreground/75 leading-relaxed">
          {slide.subtitle}
        </p>

        <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 pt-1">
          <Button
            asChild
            size="lg"
            className="h-11 sm:h-12 w-full sm:w-auto bg-accent text-accent-foreground hover:bg-accent/90 font-semibold"
          >
            <Link href={slide.primaryCta.href}>
              {slide.primaryCta.label}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
          {slide.secondaryCta && (
            <Button
              asChild
              size="lg"
              variant="outline"
              className="h-11 sm:h-12 w-full sm:w-auto bg-transparent border-white/30 text-primary-foreground hover:bg-white/10 hover:text-primary-foreground"
            >
              <Link href={slide.secondaryCta.href}>
                {slide.secondaryCta.label}
              </Link>
            </Button>
          )}
        </div>

        {slide.stats && slide.stats.length > 0 && (
          <div className="grid grid-cols-3 gap-3 sm:gap-4 pt-4 max-w-md border-t border-white/15">
            {slide.stats.map((s) => (
              <div key={s.label}>
                <div className="text-xl sm:text-2xl md:text-3xl font-extrabold tabular-nums">
                  {s.value}
                </div>
                <div className="text-[9px] sm:text-[10px] md:text-[11px] uppercase tracking-wider text-primary-foreground/65 mt-0.5">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Right — image */}
      <div className="relative order-1 lg:order-2">
        <div
          className="absolute -inset-4 rounded-3xl bg-accent/10 blur-2xl"
          aria-hidden
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={slide.image}
          alt={slide.imageAlt}
          loading="eager"
          onError={(e) => {
            const t = e.currentTarget;
            if (!t.src.includes('/images/hero')) {
              t.src = '/images/hero-tools.svg';
            }
          }}
          className="relative w-full h-auto rounded-2xl shadow-2xl ring-1 ring-white/10 aspect-[4/3] object-cover"
        />
      </div>
    </div>
  );
}
