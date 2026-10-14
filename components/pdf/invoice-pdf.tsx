// components/pdf/invoice-pdf.tsx

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from '@react-pdf/renderer';
import type { Sale } from '@/lib/types';
import { formatDate } from '@/lib/format';

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: 'Helvetica',
    color: '#18181b',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 2,
    borderBottomColor: '#4f46e5',
    paddingBottom: 12,
    marginBottom: 16,
  },
  shopName: { fontSize: 20, fontWeight: 700, color: '#4f46e5' },
  shopMeta: { fontSize: 9, color: '#52525b', marginTop: 2 },
  invoiceTitle: { fontSize: 18, fontWeight: 700, textAlign: 'right' },
  invoiceMeta: { fontSize: 9, color: '#52525b', textAlign: 'right', marginTop: 2 },
  section: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  block: { flex: 1 },
  blockTitle: {
    fontSize: 8,
    textTransform: 'uppercase',
    color: '#71717a',
    letterSpacing: 1,
    marginBottom: 4,
    fontWeight: 700,
  },
  blockValue: { fontSize: 10, lineHeight: 1.5 },
  table: {
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#e4e4e7',
    borderRadius: 4,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f4f4f5',
    paddingVertical: 6,
    paddingHorizontal: 8,
    fontWeight: 700,
    fontSize: 9,
    borderBottomWidth: 1,
    borderBottomColor: '#e4e4e7',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f4f4f5',
    fontSize: 9,
  },
  colNo: { width: '6%' },
  colItem: { width: '42%' },
  colPrice: { width: '16%', textAlign: 'right' },
  colQty: { width: '10%', textAlign: 'right' },
  colDisc: { width: '12%', textAlign: 'right' },
  colTotal: { width: '14%', textAlign: 'right' },
  totals: { marginTop: 12, alignItems: 'flex-end' },
  totalsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    width: '50%',
    paddingVertical: 3,
    fontSize: 10,
  },
  totalsLabel: {
    width: '60%',
    textAlign: 'right',
    paddingRight: 12,
    color: '#52525b',
  },
  totalsValue: { width: '40%', textAlign: 'right', fontWeight: 700 },
  grandRow: {
    borderTopWidth: 2,
    borderTopColor: '#4f46e5',
    paddingTop: 6,
    marginTop: 4,
  },
  grandLabel: { fontSize: 12, fontWeight: 700, color: '#4f46e5' },
  grandValue: { fontSize: 12, fontWeight: 700, color: '#4f46e5' },
  footer: {
    position: 'absolute',
    bottom: 40,
    left: 40,
    right: 40,
    borderTopWidth: 1,
    borderTopColor: '#e4e4e7',
    paddingTop: 10,
    fontSize: 8,
    color: '#71717a',
    textAlign: 'center',
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
    vatNumber?: string;
  };
  receiptFooter?: string;
}

export function InvoicePDF({ sale, business, receiptFooter }: Props) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.shopName}>{business.name}</Text>
            <Text style={styles.shopMeta}>{business.address}</Text>
            <Text style={styles.shopMeta}>
              {business.phone} · {business.email}
            </Text>
            {business.vatNumber && (
              <Text style={styles.shopMeta}>{business.vatNumber}</Text>
            )}
          </View>
          <View>
            <Text style={styles.invoiceTitle}>TAX INVOICE</Text>
            <Text style={styles.invoiceMeta}>{sale.invoiceNo}</Text>
            <Text style={styles.invoiceMeta}>
              Date: {formatDate(sale.date)}
            </Text>
            <Text style={styles.invoiceMeta}>Served by: {sale.cashier}</Text>
          </View>
        </View>

        {/* Bill To */}
        <View style={styles.section}>
          <View style={styles.block}>
            <Text style={styles.blockTitle}>Bill To</Text>
            <Text style={{ fontSize: 12, fontWeight: 700 }}>
              {sale.customerName}
            </Text>
            {sale.customerId && (
              <Text style={{ fontSize: 9, color: '#52525b', marginTop: 2 }}>
                Customer ID: {sale.customerId}
              </Text>
            )}
          </View>
          <View style={styles.block}>
            <Text style={styles.blockTitle}>Payment</Text>
            <Text style={styles.blockValue}>
              Method: {sale.paymentMethod.toUpperCase()}
            </Text>
            <Text style={styles.blockValue}>
              Status: {sale.due > 0 ? 'Partially Paid' : 'Paid'}
            </Text>
          </View>
        </View>

        {/* Items */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.colNo}>#</Text>
            <Text style={styles.colItem}>Item</Text>
            <Text style={styles.colPrice}>Price</Text>
            <Text style={styles.colQty}>Qty</Text>
            <Text style={styles.colDisc}>Disc</Text>
            <Text style={styles.colTotal}>Total</Text>
          </View>
          {sale.items.map((it, i) => (
            <View key={i} style={styles.tableRow}>
              <Text style={styles.colNo}>{i + 1}</Text>
              <View style={styles.colItem}>
                <Text>{it.name}</Text>
                <Text style={{ fontSize: 8, color: '#71717a' }}>{it.sku}</Text>
              </View>
              <Text style={styles.colPrice}>{aud(it.price)}</Text>
              <Text style={styles.colQty}>{it.qty}</Text>
              <Text style={styles.colDisc}>
                {it.discount > 0 ? aud(it.discount) : '-'}
              </Text>
              <Text style={styles.colTotal}>{aud(it.subtotal)}</Text>
            </View>
          ))}
        </View>

        {/* Totals */}
        <View style={styles.totals}>
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>Subtotal</Text>
            <Text style={styles.totalsValue}>{aud(sale.subtotal)}</Text>
          </View>
          {sale.discount > 0 && (
            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>Discount</Text>
              <Text style={styles.totalsValue}>-{aud(sale.discount)}</Text>
            </View>
          )}
          {sale.tax > 0 && (
            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>GST</Text>
              <Text style={styles.totalsValue}>{aud(sale.tax)}</Text>
            </View>
          )}
          <View style={[styles.totalsRow, styles.grandRow]}>
            <Text style={[styles.totalsLabel, styles.grandLabel]}>
              Grand Total
            </Text>
            <Text style={[styles.totalsValue, styles.grandValue]}>
              {aud(sale.total)}
            </Text>
          </View>
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>Paid</Text>
            <Text style={styles.totalsValue}>{aud(sale.paid)}</Text>
          </View>
          {sale.due > 0 && (
            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>Due</Text>
              <Text style={[styles.totalsValue, { color: '#dc2626' }]}>
                {aud(sale.due)}
              </Text>
            </View>
          )}
        </View>

        {/* Footer */}
        <Text style={styles.footer} fixed>
          {receiptFooter ||
            'All prices include GST. Thank you for your business.'}
        </Text>
      </Page>
    </Document>
  );
}