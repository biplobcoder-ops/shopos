'use client';

import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import { GenerateBarcode } from './generate-barcode';

export default function GenerateBarcodePage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <GenerateBarcode />
    </Suspense>
  );
}
