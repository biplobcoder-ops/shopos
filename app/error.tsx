// app/error.tsx

'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw, Home, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to console in dev for debugging
    if (process.env.NODE_ENV === 'development') {
      console.error('[Southern Cross Tools Error]', error);
    }
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="max-w-lg w-full text-center">
        {/* Icon */}
        <div className="mx-auto h-20 w-20 rounded-2xl bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-center mb-6">
          <AlertTriangle className="h-10 w-10" />
        </div>

        {/* Headline */}
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
          Something went wrong
        </h1>
        <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto leading-relaxed">
          An unexpected error occurred while rendering this page. You can try
          again or return to the dashboard.
        </p>

        {/* Error details (dev only) */}
        {process.env.NODE_ENV === 'development' && error?.message && (
          <div className="mt-4 rounded-lg border border-red-500/20 bg-red-500/5 p-3 text-left">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-red-600 dark:text-red-400 mb-1">
              Error Details (dev only)
            </div>
            <div className="text-xs font-mono text-red-700 dark:text-red-300 break-all">
              {error.message}
            </div>
            {error.digest && (
              <div className="text-[10px] text-muted-foreground mt-2">
                Digest: <span className="font-mono">{error.digest}</span>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-2">
          <Button
            onClick={() => reset()}
            className="w-full sm:w-auto h-10"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
          <Button
            asChild
            variant="outline"
            className="w-full sm:w-auto h-10"
          >
            <Link href="/dashboard">
              <Home className="h-4 w-4 mr-2" />
              Go to Dashboard
            </Link>
          </Button>
        </div>

        {/* Back link */}
        <div className="mt-8">
          <button
            onClick={() => {
              if (typeof window !== 'undefined') window.history.back();
            }}
            className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
          >
            <ArrowLeft className="h-3 w-3" />
            Go back
          </button>
        </div>
      </div>
    </div>
  );
}