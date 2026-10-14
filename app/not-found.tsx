// app/not-found.tsx

import Link from 'next/link';
import { Home, Search, PackageX, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const metadata = { title: '404 — Page not found' };

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="max-w-lg w-full text-center">
        {/* Icon */}
        <div className="mx-auto h-20 w-20 rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center mb-6">
          <PackageX className="h-10 w-10" />
        </div>

        {/* 404 */}
        <h1 className="text-6xl md:text-7xl font-bold tracking-tight text-foreground">
          404
        </h1>
        <h2 className="text-lg md:text-xl font-semibold mt-3">
          Page not found
        </h2>
        <p className="text-sm text-muted-foreground mt-2 max-w-sm mx-auto leading-relaxed">
          The page you are looking for doesn&apos;t exist, was removed, or the
          link is incorrect.
        </p>

        {/* Actions */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-2">
          <Button asChild className="w-full sm:w-auto h-10">
            <Link href="/">
              <Home className="h-4 w-4 mr-2" />
              Go to Homepage
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="w-full sm:w-auto h-10"
          >
            <Link href="/products">
              <Search className="h-4 w-4 mr-2" />
              Browse Products
            </Link>
          </Button>
        </div>

        {/* Back link */}
        <div className="mt-8">
          <Link
            href="/dashboard"
            className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
          >
            <ArrowLeft className="h-3 w-3" />
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}