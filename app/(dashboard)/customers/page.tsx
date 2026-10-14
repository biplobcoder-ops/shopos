// app/(dashboard)/customers/page.tsx

'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  Users,
  Plus,
  Download,
  Eye,
  Pencil,
  Trash2,
  MoreHorizontal,
  Wallet,
  AlertCircle,
  ScanBarcode,
  X,
} from 'lucide-react';

import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { EmptyState } from '@/components/shared/empty-state';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { CustomerFormDialog } from '@/components/customers/customer-form-dialog';
import { ReceivePaymentDialog } from '@/components/customers/payment-dialog';
import { BarcodeScanButton } from '@/components/shared/barcode-scan-button';
import { useCustomerStore } from '@/lib/store/customer-store';
import { useSaleStore } from '@/lib/store/sale-store';
import { useProductStore } from '@/lib/store/product-store';
import { formatCurrency } from '@/lib/format';
import { downloadCSV } from '@/lib/export';
import { cn } from '@/lib/utils';
import type { Customer } from '@/lib/types';

export default function CustomersPage() {
  const { customers, remove } = useCustomerStore();
  const sales = useSaleStore((s) => s.sales);
  const products = useProductStore((s) => s.products);

  const [query, setQuery] = useState('');
  const [dueFilter, setDueFilter] = useState<string>('all');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Customer | null>(null);
  const [deleting, setDeleting] = useState<Customer | null>(null);
  const [payTarget, setPayTarget] = useState<Customer | null>(null);
  const [scannedProductId, setScannedProductId] = useState<string>('');

  /**
   * Compute the set of customer IDs that purchased the scanned product.
   */
  const scannedCustomerIds = useMemo(() => {
    if (!scannedProductId) return null;
    const ids = new Set<string>();
    sales.forEach((s) => {
      if (
        s.customerId &&
        s.items.some((it) => it.productId === scannedProductId)
      ) {
        ids.add(s.customerId);
      }
    });
    return ids;
  }, [sales, scannedProductId]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return customers.filter((c) => {
      if (dueFilter === 'due' && c.due <= 0) return false;
      if (dueFilter === 'clear' && c.due > 0) return false;
      // If scanned product filter is active
      if (scannedCustomerIds && !scannedCustomerIds.has(c.id)) return false;
      if (!q) return true;
      return (
        c.name.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q) ||
        (c.email ?? '').toLowerCase().includes(q)
      );
    });
  }, [customers, query, dueFilter, scannedCustomerIds]);

  const stats = useMemo(() => {
    const totalDue = customers.reduce((s, c) => s + c.due, 0);
    const withDue = customers.filter((c) => c.due > 0).length;
    const totalPaid = customers.reduce((s, c) => s + c.paid, 0);
    return { totalDue, withDue, totalPaid };
  }, [customers]);

  /** Handle barcode scan → filter customers who bought that product */
  const handleBarcodeScan = (code: string) => {
    const trimmed = code.trim();
    const product =
      products.find((p) => p.barcode === trimmed) ||
      products.find((p) => p.sku.toLowerCase() === trimmed.toLowerCase());

    if (!product) {
      toast.error(`No product found for "${trimmed}"`);
      return;
    }

    const matchCount = sales
      .filter(
        (s) =>
          s.customerId &&
          s.items.some((it) => it.productId === product.id)
      )
      .map((s) => s.customerId)
      .filter((v, i, arr) => arr.indexOf(v) === i)
      .length;

    if (matchCount === 0) {
      toast.error(`No customers purchased ${product.name}`);
      return;
    }

    setScannedProductId(product.id);
    setQuery('');
    setDueFilter('all');
    toast.success(`Found: ${product.name}`, {
      description: `${matchCount} customer${matchCount === 1 ? '' : 's'} purchased this.`,
    });
  };

  const clearScan = () => setScannedProductId('');

  const handleExport = () => {
    downloadCSV(
      filtered.map((c) => ({
        name: c.name,
        phone: c.phone,
        email: c.email ?? '',
        address: c.address ?? '',
        due: c.due,
        paid: c.paid,
        totalPurchase: c.totalPurchase,
      })),
      `customers-${new Date().toISOString().slice(0, 10)}.csv`
    );
    toast.success('CSV downloaded');
  };

  return (
    <div>
      <PageHeader
        title="Customers"
        description={`${customers.length} customers · ${stats.withDue} with due · ${formatCurrency(stats.totalDue)} outstanding`}
        actions={
          <>
            <BarcodeScanButton
              onScan={handleBarcodeScan}
              label="Scan"
              variant="outline"
              className="h-9"
            />
            <Button variant="outline" className="h-9" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button
              className="h-9"
              onClick={() => {
                setEditing(null);
                setFormOpen(true);
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Customer
            </Button>
          </>
        }
      />

      {/* Scan Alert */}
      {scannedProductId && (
        <div className="mb-4 rounded-lg border border-brand-500/30 bg-brand-500/5 p-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm min-w-0">
            <ScanBarcode className="h-4 w-4 text-brand-600 dark:text-brand-400 shrink-0" />
            <span className="font-medium truncate">
              Customers who bought:{' '}
              <span className="font-semibold">
                {products.find((p) => p.id === scannedProductId)?.name}
              </span>
            </span>
          </div>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 text-xs shrink-0"
            onClick={clearScan}
          >
            <X className="h-3.5 w-3.5 mr-1" />
            Clear
          </Button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground uppercase tracking-wider">
              Total Customers
            </div>
            <div className="text-lg font-bold mt-1 tabular-nums">
              {customers.length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground uppercase tracking-wider">
              With Outstanding Due
            </div>
            <div className="text-lg font-bold mt-1 tabular-nums text-amber-600 dark:text-amber-400">
              {stats.withDue}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground uppercase tracking-wider">
              Total Due
            </div>
            <div className="text-lg font-bold mt-1 tabular-nums text-red-600 dark:text-red-400">
              {formatCurrency(stats.totalDue)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <Input
          placeholder="Search name, phone or email..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="h-9 max-w-sm"
        />
        <Select value={dueFilter} onValueChange={setDueFilter}>
          <SelectTrigger className="h-9 w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Customers</SelectItem>
            <SelectItem value="due">With Due</SelectItem>
            <SelectItem value="clear">No Due</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <Card>
          <CardContent className="p-6">
            <EmptyState
              icon={Users}
              title={
                scannedProductId
                  ? 'No customers bought this product'
                  : 'No customers found'
              }
              description={
                scannedProductId
                  ? 'Clear the scan filter to see all customers.'
                  : 'Try different filters or add a new customer.'
              }
            />
          </CardContent>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40">
                <tr className="text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="text-left font-semibold px-4 py-2.5">
                    Customer
                  </th>
                  <th className="text-left font-semibold px-4 py-2.5 hidden md:table-cell">
                    Phone
                  </th>
                  <th className="text-right font-semibold px-4 py-2.5 hidden lg:table-cell">
                    Total Purchase
                  </th>
                  <th className="text-right font-semibold px-4 py-2.5 hidden lg:table-cell">
                    Paid
                  </th>
                  <th className="text-right font-semibold px-4 py-2.5">
                    Due
                  </th>
                  <th className="text-right font-semibold px-4 py-2.5"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr
                    key={c.id}
                    className={cn(
                      'border-t border-border hover:bg-muted/30 transition',
                      c.due > 0 && 'bg-red-500/[0.03]'
                    )}
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/customers/${c.id}`}
                        className="flex items-center gap-3 min-w-0 group"
                      >
                        <div className="h-9 w-9 shrink-0 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center text-xs font-bold">
                          {c.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium text-sm truncate group-hover:text-brand-600 dark:group-hover:text-brand-400">
                            {c.name}
                          </div>
                          {c.email && (
                            <div className="text-xs text-muted-foreground truncate">
                              {c.email}
                            </div>
                          )}
                        </div>
                      </Link>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">
                      {c.phone}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums hidden lg:table-cell">
                      {formatCurrency(c.totalPurchase)}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums hidden lg:table-cell text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(c.paid)}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      {c.due > 0 ? (
                        <span className="font-semibold text-red-600 dark:text-red-400">
                          {formatCurrency(c.due)}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem asChild>
                            <Link
                              href={`/customers/${c.id}`}
                              className="cursor-pointer"
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View details
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setEditing(c);
                              setFormOpen(true);
                            }}
                          >
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          {c.due > 0 && (
                            <DropdownMenuItem
                              onClick={() => setPayTarget(c)}
                            >
                              <Wallet className="mr-2 h-4 w-4" />
                              Receive payment
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-red-600 focus:text-red-600 cursor-pointer"
                            onClick={() => setDeleting(c)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <CustomerFormDialog
        open={formOpen}
        onOpenChange={(v) => {
          setFormOpen(v);
          if (!v) setEditing(null);
        }}
        customer={editing}
      />

      <ReceivePaymentDialog
        open={!!payTarget}
        onOpenChange={(v) => !v && setPayTarget(null)}
        customerId={payTarget?.id ?? null}
      />

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(v) => !v && setDeleting(null)}
        title="Delete customer?"
        description={`"${deleting?.name}" will be removed. This cannot be undone.`}
        onConfirm={() => {
          if (deleting) {
            remove(deleting.id);
            toast.success('Customer deleted');
            setDeleting(null);
          }
        }}
      />
    </div>
  );
}