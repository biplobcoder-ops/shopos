// app/(auth)/login/page.tsx

'use client';

import Link from 'next/link';
import {
  Wrench,
  ShoppingBag,
  Package,
  Info,
  ArrowRight,
  LayoutDashboard,
  Heart,
  Search,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function CustomerLoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-4">
      {/* Background pattern */}
      <div
        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.04] text-brand-900 dark:text-brand-200 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(currentColor 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex h-14 w-14 rounded-2xl bg-gradient-to-br from-brand-600 to-brand-600 text-white items-center justify-center shadow-lg shadow-brand-500/25 mb-4">
            <Wrench className="h-7 w-7" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Welcome to Southern Cross Tools
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            Your construction tools shop
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-border/60 bg-white dark:bg-zinc-900 shadow-xl shadow-brand-500/[0.05] overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-brand-600 via-brand-500 to-brand-600" />

          <div className="p-6 sm:p-8 space-y-5">
            {/* Info banner */}
            <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-3 flex items-start gap-2.5">
              <Info className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
              <div className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
                Customer accounts are <strong>not enabled</strong> in this demo.
                You can browse and order as a guest.
              </div>
            </div>

            {/* Primary CTAs */}
            <div className="space-y-2">
              <Button asChild className="w-full h-11 justify-start">
                <Link href="/shop">
                  <ShoppingBag className="h-4 w-4 mr-2" />
                  Browse Products
                  <ArrowRight className="h-4 w-4 ml-auto" />
                </Link>
              </Button>

              <Button
                asChild
                variant="outline"
                className="w-full h-11 justify-start"
              >
                <Link href="/my-orders">
                  <Package className="h-4 w-4 mr-2" />
                  My Orders
                  <ArrowRight className="h-4 w-4 ml-auto" />
                </Link>
              </Button>

              <Button
                asChild
                variant="outline"
                className="w-full h-11 justify-start"
              >
                <Link href="/cart">
                  <ShoppingBag className="h-4 w-4 mr-2" />
                  View Cart
                  <ArrowRight className="h-4 w-4 ml-auto" />
                </Link>
              </Button>
            </div>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase tracking-wider">
                <span className="bg-white dark:bg-zinc-900 px-2 text-muted-foreground">
                  Staff Access
                </span>
              </div>
            </div>

            {/* Staff login link */}
            <Button
              asChild
              variant="ghost"
              className="w-full h-11 justify-start text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 hover:bg-brand-500/10"
            >
              <Link href="/admin/login">
                <LayoutDashboard className="h-4 w-4 mr-2" />
                Staff Login (Admin Panel)
                <ArrowRight className="h-4 w-4 ml-auto" />
              </Link>
            </Button>

            {/* Footer info */}
            <div className="pt-2 text-center">
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Demo credentials:
                <br />
                <span className="font-mono text-[10px]">
                  admin@shop.com / 1234
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Back home */}
        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1"
          >
            ← Back to shop
          </Link>
        </div>
      </div>
    </div>
  );
}
