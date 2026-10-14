// components/pdf/barcode-label-pdf.tsx

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from '@react-pdf/renderer';
import Barcode from 'react-barcode';
import { renderToStaticMarkup } from 'react-dom/server';
import type { Product } from '@/lib/types';

const styles = StyleSheet.create({
  page: { padding: 20, fontFamily: 'Helvetica', fontSize: 8, color: '#000' },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  label: {
    width: '33.333%',
    height: 82,
    padding: 6,
    borderRightWidth: 0.5,
    borderBottomWidth: 0.5,
    borderColor: '#cccccc',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'column',
  },
  name: {
    fontSize: 7,
    fontWeight: 600,
    textAlign: 'center',
    lineHeight: 1.15,
    height: 16,
    overflow: 'hidden',
  },
  barcodeWrap: {
    height: 34,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  barcodeImg: {
    height: 34,
    maxWidth: '100%',
    objectFit: 'contain',
  },
  meta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    fontSize: 6,
    color: '#333',
  },
  price: { fontWeight: 700, fontSize: 8 },
});

/** AUD currency — no symbol (Helvetica safe) */
const aud = (n: number) => {
  if (n === undefined || n === null || isNaN(n)) return 'AUD 0.00';
  const formatted = new Intl.NumberFormat('en-AU', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
  return `AUD ${formatted}`;
};

/** Convert React Barcode to data URL (base64 SVG) */
function toBase64(str: string): string {
  if (typeof window === 'undefined') return Buffer.from(str).toString('base64');
  try {
    return window.btoa(unescape(encodeURIComponent(str)));
  } catch {
    return '';
  }
}

function barcodeDataUrl(value: string, opts: {
  width?: number;
  height?: number;
  margin?: number;
} = {}): string {
  const svgString = renderToStaticMarkup(
    <Barcode
      value={value}
      format="EAN13"
      width={opts.width ?? 1.2}
      height={opts.height ?? 30}
      fontSize={6}
      margin={opts.margin ?? 0}
      displayValue={false}
      background="#ffffff"
      lineColor="#000000"
    />
  );
  return `data:image/svg+xml;base64,${toBase64(svgString)}`;
}

interface Props {
  products: Product[];
  copiesPerProduct?: number;
  showPrice?: boolean;
  showSku?: boolean;
  showName?: boolean;
}

export function BarcodeLabelPDF({
  products,
  copiesPerProduct = 1,
  showPrice = true,
  showSku = true,
  showName = true,
}: Props) {
  // Expand products by copies
  const labels: Product[] = [];
  products.forEach((p) => {
    for (let i = 0; i < copiesPerProduct; i++) labels.push(p);
  });

  // Chunk into pages of 30 (3 cols × 10 rows)
  const pageSize = 30;
  const pages: Product[][] = [];
  for (let i = 0; i < labels.length; i += pageSize) {
    pages.push(labels.slice(i, i + pageSize));
  }
  if (!pages.length) pages.push([]);

  return (
    <Document>
      {pages.map((pageLabels, pageIdx) => (
        <Page key={pageIdx} size="A4" style={styles.page}>
          <View style={styles.grid}>
            {pageLabels.map((p, i) => {
              // Ensure valid EAN13 (12 or 13 digits)
              let code = p.barcode.replace(/\D/g, '');
              if (code.length < 12) code = code.padEnd(12, '0');
              if (code.length > 13) code = code.slice(0, 13);

              const dataUrl = barcodeDataUrl(code);

              return (
                <View key={i} style={styles.label} wrap={false}>
                  {showName ? (
                    <Text style={styles.name}>{p.name}</Text>
                  ) : (
                    <Text> </Text>
                  )}
                  <View style={styles.barcodeWrap}>
                    <Image src={dataUrl} style={styles.barcodeImg} />
                  </View>
                  <View style={styles.meta}>
                    {showSku ? <Text>{p.sku}</Text> : <Text> </Text>}
                    {showPrice ? (
                      <Text style={styles.price}>{aud(p.sellingPrice)}</Text>
                    ) : (
                      <Text> </Text>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        </Page>
      ))}
    </Document>
  );
}