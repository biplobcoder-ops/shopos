// app/(dashboard)/customers/[id]/page.tsx

'use client';

import { useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  ArrowLeft,
  User,
  Phone,
  Mail,
  MapPin,
  Wallet,
  Download,
  Printer,
  Receipt,
  BookOpen,
  FileText,
  Pencil,
} from 'lucide-react';

import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { StatusBadge, statusVariant } from '@/components/shared/status-badge';
import { EmptyState } from '@/components/shared/empty-state';
import { CustomerFormDialog } from '@/components/customers/customer-form-dialog';
import { ReceivePaymentDialog } from '@/components/customers/payment-dialog';
import { useCustomerStore } from '@/lib/store/customer-store';
import { useSaleStore } from '@/lib/store/sale-store';
import { useSettingsStore } from '@/lib/store/settings-store';
import { useCustomerLedger } from '@/lib/hooks/use-customer-ledger';
import { downloadPDF, printPDF } from '@/components/pdf/pdf-download';
import { StatementPDF } from '@/components/pdf/statement-pdf';
import { formatCurrency, formatDateTime } from '@/lib/format';
import { cn } from '@/lib/utils';

export default function CustomerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { customers } = useCustomerStore();
  const sales = useSaleStore((s) => s.sales);
  const { businessInfo } = useSettingsStore();

  const customer = customers.find((c) => c.id === id);
  const { entries, stats } = useCustomerLedger(id);

  const [formOpen, setFormOpen] = useState(false);
  const [payOpen, setPayOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const customerSales = useMemo(
    () => sales.filter((s) => s.customerId === id),
    [sales, id]
  );

  if (!customer) {
    return (
      <div>
        <PageHeader title="Customer not found" />
        <Card>
          <CardContent className="p-6">
            <EmptyState
              icon={User}
              title="Customer not found"
              description="This customer may have been deleted."
              action={
                <Button onClick={() => router.push('/customers')}>
                  Back to customers
                </Button>
              }
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleDownloadStatement = async () => {
    setBusy(true);
    await downloadPDF({
      filename: `statement-${customer.name.replace(/\s+/g, '-').toLowerCase()}.pdf`,
      component: (
        <StatementPDF
          business={businessInfo}
          partnerType="customer"
          partner={{
            name: customer.name,
            phone: customer.phone,
            email: customer.email,
            address: customer.address,
          }}
          entries={entries}
          stats={stats}
        />
      ),
    });
    setBusy(false);
  };

  const handlePrintStatement = async () => {
    setBusy(true);
    await printPDF({
      component: (
        <StatementPDF
          business={businessInfo}
          partnerType="customer"
          partner={{
            name: customer.name,
            phone: customer.phone,
            email: customer.email,
            address: customer.address,
          }}
          entries={entries}
          stats={stats}
        />
      ),
    });
    setBusy(false);
  };

  return (
    <div>
      <div className="mb-4">
        <Button
          variant="ghost"
          size="sm"
          className="h-8 text-xs -ml-2"
          onClick={() => router.push('/customers')}
        >
          <ArrowLeft className="h-3.5 w-3.5 mr-1" />
          Back to customers
        </Button>
      </div>

      <PageHeader
        title={customer.name}
        description={`Customer since ${new Date(customer.createdAt).getFullYear()}`}
        actions={
          <>
            <Button
              variant="outline"
              className="h-9"
              onClick={handleDownloadStatement}
              disabled={busy}
            >
              <Download className="h-4 w-4 mr-2" />
              Statement
            </Button>
            <Button
              variant="outline"
              className="h-9"
              onClick={handlePrintStatement}
              disabled={busy}
            >
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
            {customer.due > 0 && (
              <Button
                className="h-9 bg-emerald-600 hover:bg-emerald-700"
                onClick={() => setPayOpen(true)}
              >
                <Wallet className="h-4 w-4 mr-2" />
                Receive Payment
              </Button>
            )}
            <Button
              variant="outline"
              className="h-9"
              onClick={() => setFormOpen(true)}
            >
              <Pencil className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </>
        }
      />

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground uppercase tracking-wider">
              Total Purchase
            </div>
            <div className="text-lg font-bold mt-1 tabular-nums">
              {formatCurrency(stats.totalPurchased)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground uppercase tracking-wider">
              Total Paid
            </div>
            <div className="text-lg font-bold mt-1 tabular-nums text-emerald-600 dark:text-emerald-400">
              {formatCurrency(stats.totalPaid)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground uppercase tracking-wider">
              Current Due
            </div>
            <div
              className={cn(
                'text-lg font-bold mt-1 tabular-nums',
                customer.due > 0
                  ? 'text-red-600 dark:text-red-400'
                  : 'text-emerald-600 dark:text-emerald-400'
              )}
            >
              {formatCurrency(customer.due)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground uppercase tracking-wider">
              Invoices
            </div>
            <div className="text-lg font-bold mt-1 tabular-nums">
              {customerSales.length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="info" className="w-full">
        <TabsList className="h-9 mb-4 flex-wrap">
          <TabsTrigger value="info" className="text-xs">
            <User className="h-3.5 w-3.5 mr-1.5" />
            Info
          </TabsTrigger>
          <TabsTrigger value="ledger" className="text-xs">
            <BookOpen className="h-3.5 w-3.5 mr-1.5" />
            Ledger
          </TabsTrigger>
          <TabsTrigger value="sales" className="text-xs">
            <Receipt className="h-3.5 w-3.5 mr-1.5" />
            Sales ({customerSales.length})
          </TabsTrigger>
          <TabsTrigger value="statement" className="text-xs">
            <FileText className="h-3.5 w-3.5 mr-1.5" />
            Statement
          </TabsTrigger>
        </TabsList>

        {/* Info tab */}
        <TabsContent value="info">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
                  <User className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Full name</div>
                  <div className="text-sm font-medium">{customer.name}</div>
                </div>
              </div>
              <Separator />
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Phone</div>
                  <div className="text-sm font-medium">{customer.phone}</div>
                </div>
              </div>
              {customer.email && (
                <>
                  <Separator />
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Email</div>
                      <div className="text-sm font-medium">{customer.email}</div>
                    </div>
                  </div>
                </>
              )}
              {customer.address && (
                <>
                  <Separator />
                  <div className="flex items-start gap-3">
                    <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Address</div>
                      <div className="text-sm font-medium">{customer.address}</div>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Ledger tab */}
        <TabsContent value="ledger">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">
                Account Ledger ({entries.length} entries)
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {entries.length === 0 ? (
                <EmptyState
                  icon={BookOpen}
                  title="No ledger entries"
                  description="Sales and payments will appear here."
                  className="py-8"
                />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/40">
                      <tr className="text-xs uppercase tracking-wider text-muted-foreground">
                        <th className="text-left font-semibold px-3 py-2">Date</th>
                        <th className="text-left font-semibold px-3 py-2">
                          Reference
                        </th>
                        <th className="text-left font-semibold px-3 py-2">Type</th>
                        <th className="text-right font-semibold px-3 py-2">Amount</th>
                        <th className="text-right font-semibold px-3 py-2">Paid</th>
                        <th className="text-right font-semibold px-3 py-2">Balance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {entries.map((e) => (
                        <tr
                          key={e.id}
                          className="border-t border-border hover:bg-muted/30"
                        >
                          <td className="px-3 py-2.5 text-xs text-muted-foreground whitespace-nowrap">
                            {formatDateTime(e.date)}
                          </td>
                          <td className="px-3 py-2.5 font-medium">{e.reference}</td>
                          <td className="px-3 py-2.5">
                            <Badge
                              variant="secondary"
                              className="text-[10px] uppercase"
                            >
                              {e.type}
                            </Badge>
                          </td>
                          <td className="px-3 py-2.5 text-right tabular-nums">
                            {formatCurrency(e.amount)}
                          </td>
                          <td className="px-3 py-2.5 text-right tabular-nums text-emerald-600 dark:text-emerald-400">
                            {formatCurrency(e.paid)}
                          </td>
                          <td
                            className={cn(
                              'px-3 py-2.5 text-right tabular-nums font-semibold',
                              e.balance > 0
                                ? 'text-red-600 dark:text-red-400'
                                : 'text-muted-foreground'
                            )}
                          >
                            {formatCurrency(e.balance)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sales tab */}
        <TabsContent value="sales">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">
                Purchase History ({customerSales.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {customerSales.length === 0 ? (
                <EmptyState
                  icon={Receipt}
                  title="No purchases yet"
                  className="py-8"
                />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/40">
                      <tr className="text-xs uppercase tracking-wider text-muted-foreground">
                        <th className="text-left font-semibold px-3 py-2">
                          Invoice
                        </th>
                        <th className="text-left font-semibold px-3 py-2">Date</th>
                        <th className="text-right font-semibold px-3 py-2">Total</th>
                        <th className="text-right font-semibold px-3 py-2">Paid</th>
                        <th className="text-right font-semibold px-3 py-2">Due</th>
                        <th className="text-center font-semibold px-3 py-2">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {customerSales.map((s) => (
                        <tr
                          key={s.id}
                          className="border-t border-border hover:bg-muted/30 cursor-pointer"
                        >
                          <td className="px-3 py-2.5 font-medium">
                            <Link
                              href="/sales"
                              className="hover:text-brand-600 dark:hover:text-brand-400"
                            >
                              {s.invoiceNo}
                            </Link>
                          </td>
                          <td className="px-3 py-2.5 text-xs text-muted-foreground">
                            {formatDateTime(s.date)}
                          </td>
                          <td className="px-3 py-2.5 text-right tabular-nums">
                            {formatCurrency(s.total)}
                          </td>
                          <td className="px-3 py-2.5 text-right tabular-nums text-emerald-600 dark:text-emerald-400">
                            {formatCurrency(s.paid)}
                          </td>
                          <td className="px-3 py-2.5 text-right tabular-nums">
                            {s.due > 0 ? (
                              <span className="font-semibold text-red-600 dark:text-red-400">
                                {formatCurrency(s.due)}
                              </span>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </td>
                          <td className="px-3 py-2.5 text-center">
                            <StatusBadge variant={statusVariant(s.status)}>
                              {s.status}
                            </StatusBadge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Statement tab */}
        <TabsContent value="statement">
          <Card>
            <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm">Account Statement</CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs"
                  onClick={handleDownloadStatement}
                  disabled={busy}
                >
                  <Download className="h-3.5 w-3.5 mr-1" />
                  Download PDF
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs"
                  onClick={handlePrintStatement}
                  disabled={busy}
                >
                  <Printer className="h-3.5 w-3.5 mr-1" />
                  Print
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border bg-white dark:bg-zinc-900 p-6 text-sm space-y-4">
                <div className="flex justify-between items-start border-b pb-3">
                  <div>
                    <div className="font-bold text-base">{businessInfo.name}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {businessInfo.address}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {businessInfo.phone}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-lg">STATEMENT</div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {new Date().toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                      Statement For
                    </div>
                    <div className="font-semibold">{customer.name}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {customer.phone}
                    </div>
                    {customer.address && (
                      <div className="text-xs text-muted-foreground">
                        {customer.address}
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                      Summary
                    </div>
                    <div className="flex justify-between text-xs">
                      <span>Total Billed:</span>
                      <span className="tabular-nums font-medium">
                        {formatCurrency(stats.totalPurchased)}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span>Total Paid:</span>
                      <span className="tabular-nums font-medium">
                        {formatCurrency(stats.totalPaid)}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs pt-1 border-t mt-1">
                      <span className="font-semibold">Balance Due:</span>
                      <span
                        className={cn(
                          'tabular-nums font-bold',
                          customer.due > 0
                            ? 'text-red-600 dark:text-red-400'
                            : 'text-emerald-600 dark:text-emerald-400'
                        )}
                      >
                        {formatCurrency(customer.due)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-xs text-muted-foreground text-center pt-4 border-t">
                  Download the PDF for the full transaction breakdown.
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <CustomerFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        customer={customer}
      />

      <ReceivePaymentDialog
        open={payOpen}
        onOpenChange={setPayOpen}
        customerId={customer.id}
      />
    </div>
  );
}