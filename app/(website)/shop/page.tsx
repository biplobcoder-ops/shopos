'use client';

import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import { ProductsListing } from './products-listing';

export default function ProductsListingPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto py-16 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <ProductsListing />
    </Suspense>
  );
}
