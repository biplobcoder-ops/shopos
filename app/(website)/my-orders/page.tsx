'use client';

import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import { WebsiteOrders } from './website-orders';

export default function WebsiteOrdersPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto py-16 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <WebsiteOrders />
    </Suspense>
  );
}
