// components/pdf/statement-pdf.tsx

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from '@react-pdf/renderer';
import { formatDate, formatDateTime } from '@/lib/format';
import type { LedgerEntry } from '@/lib/types';

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
  title: { fontSize: 18, fontWeight: 700, textAlign: 'right' },
  meta: { fontSize: 9, color: '#52525b', textAlign: 'right', marginTop: 2 },
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
  cDate: { width: '20%' },
  cRef: { width: '22%' },
  cType: { width: '14%' },
  cAmount: { width: '14%', textAlign: 'right' },
  cPaid: { width: '14%', textAlign: 'right' },
  cBalance: { width: '16%', textAlign: 'right' },
  summary: {
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  summaryBox: {
    flex: 1,
    padding: 8,
    borderWidth: 1,
    borderColor: '#e4e4e7',
    borderRadius: 4,
    textAlign: 'center',
  },
  summaryLabel: {
    fontSize: 8,
    color: '#71717a',
    textTransform: 'uppercase',
  },
  summaryValue: { fontSize: 12, fontWeight: 700, marginTop: 3 },
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
  business: {
    name: string;
    address: string;
    phone: string;
    email: string;
  };
  partnerType: 'customer' | 'supplier';
  partner: {
    name: string;
    phone: string;
    email?: string;
    address?: string;
  };
  entries: LedgerEntry[];
  stats: {
    totalPurchased: number;
    totalPaid: number;
    totalDue: number;
  };
  period?: { from?: string; to?: string };
}

export function StatementPDF({
  business,
  partnerType,
  partner,
  entries,
  stats,
  period,
}: Props) {
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
          </View>
          <View>
            <Text style={styles.title}>STATEMENT</Text>
            <Text style={styles.meta}>
              {partnerType === 'customer' ? 'Customer Account' : 'Supplier Account'}
            </Text>
            <Text style={styles.meta}>Generated {formatDate(new Date())}</Text>
            {period?.from && (
              <Text style={styles.meta}>
                Period: {formatDate(period.from)} — {formatDate(period.to ?? new Date())}
              </Text>
            )}
          </View>
        </View>

        {/* Partner Info */}
        <View style={styles.section}>
          <View style={styles.block}>
            <Text style={styles.blockTitle}>
              {partnerType === 'customer' ? 'Bill To' : 'Supplier'}
            </Text>
            <Text style={{ fontSize: 12, fontWeight: 700 }}>{partner.name}</Text>
            <Text style={styles.blockValue}>{partner.phone}</Text>
            {partner.email && <Text style={styles.blockValue}>{partner.email}</Text>}
            {partner.address && (
              <Text style={[styles.blockValue, { maxWidth: 250 }]}>
                {partner.address}
              </Text>
            )}
          </View>
          <View style={styles.block}>
            <Text style={styles.blockTitle}>Summary</Text>
            <Text style={styles.blockValue}>
              Total {partnerType === 'customer' ? 'Purchased' : 'Ordered'}:{' '}
              {aud(stats.totalPurchased)}
            </Text>
            <Text style={styles.blockValue}>Total Paid: {aud(stats.totalPaid)}</Text>
            <Text
              style={[
                styles.blockValue,
                {
                  fontWeight: 700,
                  color: stats.totalDue > 0 ? '#dc2626' : '#059669',
                },
              ]}
            >
              Outstanding Due: {aud(stats.totalDue)}
            </Text>
          </View>
        </View>

        {/* Ledger Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.cDate}>Date</Text>
            <Text style={styles.cRef}>Reference</Text>
            <Text style={styles.cType}>Type</Text>
            <Text style={styles.cAmount}>Amount</Text>
            <Text style={styles.cPaid}>Paid</Text>
            <Text style={styles.cBalance}>Balance</Text>
          </View>
          {entries.map((e, i) => (
            <View key={i} style={styles.tableRow}>
              <Text style={styles.cDate}>{formatDateTime(e.date)}</Text>
              <Text style={styles.cRef}>{e.reference}</Text>
              <Text style={styles.cType}>{e.type}</Text>
              <Text style={styles.cAmount}>{aud(e.amount)}</Text>
              <Text style={styles.cPaid}>{aud(e.paid)}</Text>
              <Text style={styles.cBalance}>{aud(e.balance)}</Text>
            </View>
          ))}
          {entries.length === 0 && (
            <View style={styles.tableRow}>
              <Text
                style={{
                  width: '100%',
                  textAlign: 'center',
                  color: '#71717a',
                }}
              >
                No transactions in this period.
              </Text>
            </View>
          )}
        </View>

        {/* Summary Boxes */}
        <View style={styles.summary}>
          <View style={styles.summaryBox}>
            <Text style={styles.summaryLabel}>Total Billed</Text>
            <Text style={styles.summaryValue}>
              {aud(stats.totalPurchased)}
            </Text>
          </View>
          <View style={styles.summaryBox}>
            <Text style={styles.summaryLabel}>Total Paid</Text>
            <Text style={styles.summaryValue}>{aud(stats.totalPaid)}</Text>
          </View>
          <View style={styles.summaryBox}>
            <Text style={styles.summaryLabel}>Balance Due</Text>
            <Text
              style={[
                styles.summaryValue,
                { color: stats.totalDue > 0 ? '#dc2626' : '#059669' },
              ]}
            >
              {aud(stats.totalDue)}
            </Text>
          </View>
        </View>

        {/* Footer */}
        <Text style={styles.footer} fixed>
          Statement generated by Southern Cross Tools · {business.name}
        </Text>
      </Page>
    </Document>
  );
}