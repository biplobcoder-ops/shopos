// components/pos/barcode-input.tsx

'use client';

import { useEffect, useRef, useState } from 'react';
import { ScanBarcode, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface Props {
  onScan: (code: string) => void;
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
}

export function BarcodeInput({
  onScan,
  placeholder = 'Scan barcode or type SKU and press Enter...',
  className,
  autoFocus,
}: Props) {
  const [value, setValue] = useState('');
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const submit = () => {
    const code = value.trim();
    if (!code) return;
    setBusy(true);
    onScan(code);
    setValue('');
    // brief visual feedback
    setTimeout(() => {
      setBusy(false);
      inputRef.current?.focus();
    }, 150);
  };

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  return (
    <div className={cn('relative', className)}>
      <ScanBarcode className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        ref={inputRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            submit();
          }
        }}
        placeholder={placeholder}
        className="pl-9 pr-9 h-10"
      />
      {busy && (
        <Loader2 className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-brand-500" />
      )}
    </div>
  );
}