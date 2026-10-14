// components/shared/barcode-scan-button.tsx

'use client';

import { useEffect, useRef, useState } from 'react';
import { ScanBarcode, Camera, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

interface Props {
  /** Called when a barcode is successfully scanned */
  onScan: (code: string) => void;
  /** Button label (optional) */
  label?: string;
  /** Icon only mode */
  iconOnly?: boolean;
  /** Custom className */
  className?: string;
  /** Button variant */
  variant?: 'default' | 'outline' | 'ghost' | 'secondary';
  /** Button size */
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

/**
 * Reusable camera-based barcode scanner button.
 * Opens a modal with live camera feed, scans EAN-13, UPC, Code-128 etc.
 * On success, calls onScan(code) with the decoded value.
 */
export function BarcodeScanButton({
  onScan,
  label = 'Scan',
  iconOnly = false,
  className,
  variant = 'outline',
  size = 'default',
}: Props) {
  const [open, setOpen] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scannerRef = useRef<any>(null);
  const containerId = 'shared-barcode-scanner';

  const startScanner = async () => {
    try {
      const { Html5Qrcode } = await import('html5-qrcode');
      setScanning(true);
      setError(null);

      // Wait for DOM
      await new Promise((r) => setTimeout(r, 150));

      const qr = new Html5Qrcode(containerId);
      scannerRef.current = qr;

      await qr.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 150 },
        },
        (decodedText: string) => {
          onScan(decodedText);
          stopScanner();
          setOpen(false);
        },
        () => {
          // per-frame error — ignore
        }
      );
    } catch (err: any) {
      setScanning(false);
      setError(
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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopScanner();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleOpenChange = (v: boolean) => {
    setOpen(v);
    if (!v) {
      stopScanner();
      setError(null);
    }
  };

  return (
    <>
      <Button
        type="button"
        variant={variant}
        size={size}
        onClick={() => {
          setOpen(true);
          // Delay to let modal render
          setTimeout(() => startScanner(), 200);
        }}
        className={className}
        title="Scan barcode with camera"
      >
        {iconOnly ? (
          <Camera className="h-4 w-4" />
        ) : (
          <>
            <Camera className="h-4 w-4 mr-2" />
            {label}
          </>
        )}
      </Button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ScanBarcode className="h-5 w-5 text-brand-500" />
              Scan Barcode
            </DialogTitle>
            <DialogDescription>
              Point your camera at the product barcode. Auto-detects EAN-13,
              UPC, Code-128 and more.
            </DialogDescription>
          </DialogHeader>

          <div
            id={containerId}
            className="relative w-full aspect-[4/3] rounded-lg bg-zinc-900 overflow-hidden flex items-center justify-center"
          >
            {!scanning && !error && (
              <div className="text-center text-white/70 text-xs p-6">
                <Loader2 className="h-6 w-6 mx-auto mb-2 animate-spin" />
                Starting camera...
              </div>
            )}
            {error && (
              <div className="text-center text-red-400 text-xs p-6">
                <X className="h-6 w-6 mx-auto mb-2" />
                {error}
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => handleOpenChange(false)}
            >
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}