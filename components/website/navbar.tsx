// components/website/navbar.tsx

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search,
  ShoppingCart,
  Menu,
  X,
  Truck,
  Store,
  Phone,
  User,
  ChevronRight,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { useWebCart } from '@/lib/store/web-cart-store';
import { useSettingsStore } from '@/lib/store/settings-store';
import { FREE_DELIVERY_THRESHOLD, SUPPORT_PHONE_DISPLAY } from '@/lib/constants';

const CATEGORIES = [
  { name: 'Power Tools', slug: 'Power Tools' },
  { name: 'Hand Tools', slug: 'Hand Tools' },
  { name: 'Accessories', slug: 'Accessories' },
  { name: 'Safety', slug: 'Safety' },
  { name: 'Measuring', slug: 'Measuring' },
];

const MAIN_LINKS = [
  { href: '/shop', label: 'All Products' },
  { href: '/shop?q=Bosch', label: 'Bosch' },
  { href: '/shop?q=Makita', label: 'Makita' },
  { href: '/shop?q=DeWalt', label: 'DeWalt' },
  { href: '/shop?q=Stanley', label: 'Stanley' },
];

export function WebsiteNavbar() {
  const router = useRouter();
  const cart = useWebCart();
  const count = cart.count();
  const { businessInfo } = useSettingsStore();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileSearch, setMobileSearch] = useState(false);
  const [query, setQuery] = useState('');

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    router.push(`/shop?q=${encodeURIComponent(q)}`);
    setMobileSearch(false);
    setQuery('');
  };

  return (
    <>
      {/* Utility bar — deep navy background */}
      <div className="bg-primary text-primary-foreground text-[11px] md:text-xs">
        <div className="container mx-auto flex h-8 items-center justify-between gap-4">
          <div className="flex items-center gap-2 truncate">
            <Truck className="h-3.5 w-3.5 text-accent shrink-0" />
            <span className="truncate">
              Free delivery on orders over ${FREE_DELIVERY_THRESHOLD} (inc. GST)
            </span>
          </div>
          <div className="hidden md:flex items-center gap-5">
            <Link href="/help" className="hover:text-accent transition-colors">
              Delivery &amp; Returns
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-1.5 hover:text-accent transition-colors"
            >
              <Store className="h-3.5 w-3.5" />
              Store Locator
            </Link>
            <Link href="/register" className="hover:text-accent transition-colors">
              Trade Account
            </Link>
            <a
              href={`tel:${SUPPORT_PHONE_DISPLAY.replace(/\s/g, '')}`}
              className="inline-flex items-center gap-1.5 hover:text-accent transition-colors"
            >
              <Phone className="h-3.5 w-3.5" />
              {SUPPORT_PHONE_DISPLAY}
            </a>
          </div>
        </div>
      </div>

      {/* Main bar */}
      <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/85">
        <div className="container mx-auto flex h-16 items-center gap-2 md:gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden shrink-0"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </Button>

          {/* Site name — BOLD, no logo, no tagline */}
          <Link
            href="/"
            className="shrink-0"
            aria-label={`${businessInfo.name} home`}
          >
            <span className="text-xl md:text-2xl font-black tracking-tight text-primary">
              Southern Cross
            </span>
          </Link>

          <form onSubmit={submitSearch} className="hidden md:flex flex-1 max-w-2xl mx-auto">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search tools, brands or SKU…"
                className="h-11 pl-10 pr-24 rounded-full bg-muted/50 border-transparent focus-visible:bg-background"
                aria-label="Search products"
              />
              <Button
                type="submit"
                size="sm"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-9 rounded-full px-4 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Search
              </Button>
            </div>
          </form>

          <div className="ml-auto flex items-center gap-1 md:gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileSearch((v) => !v)}
              aria-label="Search"
            >
              <Search className="h-5 w-5" />
            </Button>

            <Button asChild variant="ghost" size="sm" className="hidden lg:inline-flex h-10 gap-2">
              <Link href="/my-orders">
                <User className="h-4 w-4" />
                My Orders
              </Link>
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="relative h-10 w-10"
              onClick={() => cart.setDrawerOpen(true)}
              aria-label={`Open cart, ${count} items`}
            >
              <ShoppingCart className="h-5 w-5" />
              {count > 0 && (
                <span className="absolute -top-0.5 -right-0.5 h-5 min-w-5 px-1 rounded-full bg-accent text-accent-foreground text-[10px] font-bold flex items-center justify-center">
                  {count > 99 ? '99+' : count}
                </span>
              )}
            </Button>
          </div>
        </div>

        {mobileSearch && (
          <div className="md:hidden border-t border-border px-4 py-3 bg-background">
            <form onSubmit={submitSearch} className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search tools…"
                className="pl-10 pr-10 h-11"
                aria-label="Search products"
              />
              <button
                type="button"
                onClick={() => setMobileSearch(false)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md hover:bg-accent/10"
                aria-label="Close search"
              >
                <X className="h-4 w-4" />
              </button>
            </form>
          </div>
        )}

        {/* Category strip (desktop) — deep navy bar */}
        <nav
          className="hidden lg:block border-t border-border bg-primary text-primary-foreground"
          aria-label="Main"
        >
          <div className="container mx-auto flex items-center gap-1 h-11">
            {CATEGORIES.map((c) => (
              <Link
                key={c.slug}
                href={`/shop?category=${encodeURIComponent(c.slug)}`}
                className="px-3 h-full inline-flex items-center text-sm font-medium hover:bg-white/10 transition-colors"
              >
                {c.name}
              </Link>
            ))}
            <div className="mx-2 h-5 w-px bg-white/20" />
            {MAIN_LINKS.slice(1).map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="px-3 h-full inline-flex items-center text-sm text-white/80 hover:text-white hover:bg-white/10 transition-colors"
              >
                {l.label}
              </Link>
            ))}
            <Link
              href="/shop?category=Safety"
              className="ml-auto px-4 h-8 inline-flex items-center rounded-full bg-accent text-accent-foreground hover:bg-accent/90 text-sm font-semibold transition-colors"
            >
              Safety Sale
            </Link>
          </div>
        </nav>
      </header>

      {/* Mobile / tablet menu */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="p-0 w-[88vw] max-w-[320px] flex flex-col">
          {/* Site name — BOLD, no logo, no tagline */}
          <div className="flex items-center h-16 border-b border-border px-4">
            <span className="text-lg font-black text-primary">
              Southern Cross
            </span>
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="px-4 pt-4 pb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Shop by category
            </div>
            <nav className="px-2 pb-2">
              {CATEGORIES.map((c) => (
                <Link
                  key={c.slug}
                  href={`/shop?category=${encodeURIComponent(c.slug)}`}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-between rounded-lg px-3 py-3 text-sm font-medium hover:bg-accent/10"
                >
                  {c.name}
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </Link>
              ))}
            </nav>

            <div className="border-t border-border px-2 py-2">
              {[
                { href: '/shop', label: 'All Products' },
                { href: '/my-orders', label: 'My Orders' },
                { href: '/help', label: 'Delivery & Returns' },
                { href: '/register', label: 'Trade Account' },
                { href: '/about', label: 'About Us' },
                { href: '/contact', label: 'Contact & Stores' },
              ].map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center rounded-lg px-3 py-3 text-sm hover:bg-accent/10"
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="border-t border-border p-4 space-y-2">
            <a
              href={`tel:${SUPPORT_PHONE_DISPLAY.replace(/\s/g, '')}`}
              className="flex items-center gap-2 text-sm font-semibold"
            >
              <Phone className="h-4 w-4 text-accent" />
              {SUPPORT_PHONE_DISPLAY}
            </a>
            <Button
              asChild
              variant="outline"
              className="w-full h-10"
              onClick={() => setMobileOpen(false)}
            >
              <Link href="/login">Staff sign in</Link>
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
