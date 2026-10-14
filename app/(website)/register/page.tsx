// app/(website)/register/page.tsx

'use client';

import Link from 'next/link';
import {
  Wrench,
  ShoppingBag,
  Info,
  ArrowRight,
  UserPlus,
  CheckCircle2,
} from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const PERKS = [
  'Faster checkout with saved addresses',
  'Track all your orders in one place',
  'Exclusive member-only discounts',
  'Order history and re-order easily',
];

export default function WebsiteRegisterPage() {
  return (
    <div className="container mx-auto py-10 md:py-16">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex h-12 w-12 rounded-xl bg-brand-600 text-white items-center justify-center mb-3">
            <UserPlus className="h-6 w-6" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Create Account
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Join ShopOS for a faster shopping experience.
          </p>
        </div>

        <Card>
          <CardContent className="p-6 md:p-8 space-y-4">
            {/* Info */}
            <div className="rounded-lg border bg-blue-500/5 border-blue-500/20 p-3 flex items-start gap-2.5">
              <Info className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
              <div className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
                Registration is <strong>not enabled</strong> in this Southern Cross Tools
                demo. You can place orders without an account.
              </div>
            </div>

            {/* Perks */}
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                With an account you get
              </div>
              <ul className="space-y-2">
                {PERKS.map((p) => (
                  <li key={p} className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span className="text-muted-foreground leading-snug">
                      {p}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-2 pt-2">
              <Button asChild className="w-full h-11">
                <Link href="/products">
                  <ShoppingBag className="h-4 w-4 mr-2" />
                  Continue as Guest
                  <ArrowRight className="h-4 w-4 ml-auto" />
                </Link>
              </Button>

              <Button
                asChild
                variant="outline"
                className="w-full h-11"
              >
                <Link href="/login">
                  Already have an account? Sign in
                </Link>
              </Button>
            </div>

            <div className="pt-2 text-center">
              <Badge
                variant="secondary"
                className="text-[10px] bg-purple-500/10 text-purple-600 dark:text-purple-400 border-0"
              >
                Demo Mode
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Back home */}
        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Back to shop
          </Link>
        </div>
      </div>
    </div>
  );
}