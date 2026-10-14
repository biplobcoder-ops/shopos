// components/pdf/receipt-pdf.tsx

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from '@react-pdf/renderer';
import type { Sale } from '@/lib/types';
import { formatDateTime } from '@/lib/format';

// 80mm ≈ 226pt width
const styles = StyleSheet.create({
  page: {
    paddingHorizontal: 10,
    paddingVertical: 12,
    fontSize: 9,
    fontFamily: 'Helvetica',
    color: '#000000',
    width: 226,
  },
  center: { textAlign: 'center' },
  shopName: {
    fontSize: 13,
    fontWeight: 700,
    textAlign: 'center',
    marginBottom: 2,
  },
  shopMeta: {
    fontSize: 8,
    textAlign: 'center',
    color: '#333333',
    lineHeight: 1.4,
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: '#000000',
    borderStyle: 'dashed',
    marginVertical: 6,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 8,
    marginVertical: 1,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 3,
    fontSize: 8,
  },
  itemName: {
    fontSize: 8,
    fontWeight: 600,
  },
  itemSubRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 8,
    color: '#333333',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 9,
    marginVertical: 1,
  },
  grandRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 11,
    fontWeight: 700,
    marginTop: 4,
    marginBottom: 4,
  },
  footerText: {
    textAlign: 'center',
    fontSize: 8,
    color: '#333333',
    marginTop: 4,
  },
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

interface Props {
  sale: Sale;
  business: {
    name: string;
    address: string;
    phone: string;
    email: string;
  };
  headerText?: string;
  footerText?: string;
  showCashier?: boolean;
}

export function ReceiptPDF({
  sale,
  business,
  headerText,
  footerText,
  showCashier = true,
}: Props) {
  return (
    <Document>
      <Page size={{ width: 226, height: 800 }} style={styles.page} wrap>
        {/* Shop header */}
        <Text style={styles.shopName}>{business.name}</Text>
        <Text style={styles.shopMeta}>{business.address}</Text>
        <Text style={styles.shopMeta}>{business.phone}</Text>
        {headerText ? (
          <Text style={[styles.shopMeta, { marginTop: 4 }]}>{headerText}</Text>
        ) : null}

        <View style={styles.divider} />

        {/* Transaction meta */}
        <View style={styles.metaRow}>
          <Text>Invoice</Text>
          <Text>{sale.invoiceNo}</Text>
        </View>
        <View style={styles.metaRow}>
          <Text>Date</Text>
          <Text>{formatDateTime(sale.date)}</Text>
        </View>
        <View style={styles.metaRow}>
          <Text>Customer</Text>
          <Text>{sale.customerName}</Text>
        </View>
        {showCashier && (
          <View style={styles.metaRow}>
            <Text>Served by</Text>
            <Text>{sale.cashier.split('@')[0]}</Text>
          </View>
        )}

        <View style={styles.divider} />

        {/* Items */}
        {sale.items.map((it, i) => (
          <View key={i} style={{ marginBottom: 4 }}>
            <Text style={styles.itemName}>{it.name}</Text>
            <View style={styles.itemSubRow}>
              <Text>
                {it.qty} x {aud(it.price)}
              </Text>
              <Text>{aud(it.subtotal)}</Text>
            </View>
          </View>
        ))}

        <View style={styles.divider} />

        {/* Totals */}
        <View style={styles.totalRow}>
          <Text>Subtotal</Text>
          <Text>{aud(sale.subtotal)}</Text>
        </View>
        {sale.discount > 0 && (
          <View style={styles.totalRow}>
            <Text>Discount</Text>
            <Text>-{aud(sale.discount)}</Text>
          </View>
        )}
        {sale.tax > 0 && (
          <View style={styles.totalRow}>
            <Text>GST</Text>
            <Text>{aud(sale.tax)}</Text>
          </View>
        )}

        <View style={styles.divider} />

        <View style={styles.grandRow}>
          <Text>TOTAL</Text>
          <Text>{aud(sale.total)}</Text>
        </View>

        <View style={styles.totalRow}>
          <Text>Paid ({sale.paymentMethod})</Text>
          <Text>{aud(sale.paid)}</Text>
        </View>
        {sale.due > 0 && (
          <View style={styles.totalRow}>
            <Text>Due</Text>
            <Text>{aud(sale.due)}</Text>
          </View>
        )}

        <View style={styles.divider} />

        {/* Footer */}
        <Text style={styles.footerText}>
          {footerText || 'Thank you for shopping with us!'}
        </Text>
        <Text style={[styles.footerText, { marginTop: 2 }]}>
          Prices include GST · Southern Cross Tools
        </Text>
      </Page>
    </Document>
  );
}