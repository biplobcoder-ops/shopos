// components/barcode/barcode-preview.tsx

'use client';

import Barcode from 'react-barcode';
import { cn } from '@/lib/utils';

interface Props {
  value: string;
  width?: number;
  height?: number;
  fontSize?: number;
  className?: string;
}

export function BarcodePreview({
  value,
  width = 2,
  height = 60,
  fontSize = 14,
  className,
}: Props) {
  // pad to 12 digits for EAN13
  let code = (value || '').replace(/\D/g, '');
  if (code.length < 12) code = code.padEnd(12, '0');
  if (code.length > 13) code = code.slice(0, 13);
  if (!code) code = '000000000000';

  return (
    <div className={cn('flex items-center justify-center bg-white p-3 rounded-lg border', className)}>
      <Barcode
        value={code}
        format="EAN13"
        width={width}
        height={height}
        fontSize={fontSize}
        margin={0}
        background="#ffffff"
        lineColor="#000000"
      />
    </div>
  );
}