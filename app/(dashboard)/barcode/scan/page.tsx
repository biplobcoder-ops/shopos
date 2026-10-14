// app/(dashboard)/barcode/scan/page.tsx

'use client';

import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Camera, CameraOff, Search, ScanLine, PackageX } from 'lucide-react';

import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/shared/status-badge';
import { EmptyState } from '@/components/shared/empty-state';
import { useProductStore } from '@/lib/store/product-store';
import { formatCurrency } from '@/lib/format';
import { getStockStatus } from '@/lib/utils';
import type { Product } from '@/lib/types';

export default function ScanPage() {
  const products = useProductStore((s) => s.products);

  const [scanning, setScanning] = useState(false);
  const [manual, setManual] = useState('');
  const [found, setFound] = useState<Product | null>(null);
  const scannerRef = useRef<any>(null);
  const containerId = 'qr-scanner-container';

  // Manual lookup
  const lookup = (code: string) => {
    const trimmed = code.trim();
    if (!trimmed) return;
    const p =
      products.find((x) => x.barcode === trimmed) ||
      products.find((x) => x.sku.toLowerCase() === trimmed.toLowerCase());
    if (p) {
      setFound(p);
      toast.success(`Found: ${p.name}`);
    } else {
      setFound(null);
      toast.error('No product found for that code');
    }
  };

  // Camera scan
  const startScanner = async () => {
    try {
      const { Html5Qrcode } = await import('html5-qrcode');
      setScanning(true);
      // wait for DOM
      await new Promise((r) => setTimeout(r, 100));

      const qr = new Html5Qrcode(containerId);
      scannerRef.current = qr;

      await qr.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 150 },
        },
        (decodedText: string) => {
          lookup(decodedText);
          stopScanner();
        },
        () => {
          // per-frame error — ignore
        }
      );
    } catch (err) {
      setScanning(false);
      toast.error(
        'Unable to access camera. Check permissions and try again.'
      );
    }
  };

  const stopScanner = async () => {
    try {
      if (scannerRef.current) {
        await scannerRef.current.stop();
        await scannerRef.current.clear();
      }
    } catch {
      // ignore
    } finally {
      scannerRef.current = null;
      setScanning(false);
    }
  };

  // cleanup on unmount
  useEffect(() => {
    return () => {
      stopScanner();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <PageHeader
        title="Scan Barcode"
        description="Use your device camera or type a code manually to look up products."
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Scanner */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <ScanLine className="h-4 w-4 text-brand-500" />
              Camera Scanner
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              id={containerId}
              className="relative w-full aspect-video rounded-lg bg-zinc-900 overflow-hidden flex items-center justify-center"
            >
              {!scanning && (
                <div className="text-center text-white/70 text-xs p-6">
                  <CameraOff className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  Camera is off
                </div>
              )}
            </div>
            <div className="mt-3 flex gap-2">
              {!scanning ? (
                <Button onClick={startScanner} className="h-9">
                  <Camera className="h-4 w-4 mr-2" />
                  Start Camera
                </Button>
              ) : (
                <Button variant="outline" onClick={stopScanner} className="h-9">
                  <CameraOff className="h-4 w-4 mr-2" />
                  Stop Camera
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Manual input */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Search className="h-4 w-4 text-brand-500" />
              Manual Lookup
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="manual">Barcode or SKU</Label>
              <div className="flex gap-2">
                <Input
                  id="manual"
                  value={manual}
                  onChange={(e) => setManual(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') lookup(manual);
                  }}
                  placeholder="Scan or type barcode and press Enter"
                />
                <Button onClick={() => lookup(manual)} className="h-10">
                  Lookup
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Tip: USB barcode scanners submit Enter automatically.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Result */}
      <div className="mt-4">
        {!found ? (
          <Card>
            <CardContent className="p-6">
              <EmptyState
                icon={PackageX}
                title="No product scanned yet"
                description="Start the camera or type a code to look up."
              />
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Product Found</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row md:items-start gap-4">
                <div className="h-16 w-16 rounded-lg bg-gradient-to-br from-brand-500/10 to-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center text-lg font-bold shrink-0">
                  {found.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <div className="min-w-0">
                      <div className="text-base font-semibold">{found.name}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {found.sku} · {found.category} · {found.brand}
                      </div>
                    </div>
                    <StatusBadge
                      variant={
                        getStockStatus(found.stock, found.minStock).variant === 'success'
                          ? 'success'
                          : getStockStatus(found.stock, found.minStock).variant === 'warning'
                          ? 'warning'
                          : 'danger'
                      }
                    >
                      {found.stock} {found.unit}
                    </StatusBadge>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                        Purchase
                      </div>
                      <div className="text-sm font-semibold tabular-nums mt-0.5">
                        {formatCurrency(found.purchasePrice)}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                        Selling
                      </div>
                      <div className="text-sm font-semibold tabular-nums mt-0.5">
                        {formatCurrency(found.sellingPrice)}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                        Min Stock
                      </div>
                      <div className="text-sm font-semibold tabular-nums mt-0.5">
                        {found.minStock}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                        Barcode
                      </div>
                      <div className="text-sm font-mono mt-0.5 truncate">
                        {found.barcode}
                      </div>
                    </div>
                  </div>

                  {found.description && (
                    <p className="text-xs text-muted-foreground mt-3">
                      {found.description}
                    </p>
                  )}

                  <div className="flex gap-2 mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setFound(null);
                        setManual('');
                      }}
                    >
                      Clear
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}