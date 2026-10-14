// app/(dashboard)/sales/page.tsx

'use client';

import { useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import {
  Receipt,
  Download,
  Eye,
  RotateCcw,
  Search,
  ShoppingCart,
} from 'lucide-react';
import Link from 'next/link';
import { isToday, isSameMonth, isSameWeek } from 'date-fns';

import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { StatusBadge, statusVariant } from '@/components/shared/status-badge';
import { EmptyState } from '@/components/shared/empty-state';
import { SaleDetailDialog } from '@/components/sales/sale-detail-dialog';
import { useSaleStore } from '@/lib/store/sale-store';
import { formatCurrency, formatDateTime } from '@/lib/format';
import { downloadCSV } from '@/lib/export';
import type { Sale } from '@/lib/types';

type Period = 'today' | 'week' | 'month' | 'all';

export default function SalesPage() {
  const { data: session } = useSession();
  const sales = useSaleStore((s) => s.sales);

  const role = session?.user?.role;
  const email = session?.user?.email ?? '';

  // Cashier sees own only
  const visibleSales = useMemo(() => {
    if (role === 'cashier') {
      return sales.filter((s) => s.cashier === email);
    }
    return sales;
  }, [sales, role, email]);

  const [query, setQuery] = useState('');
  const [period, setPeriod] = useState<Period>('all');
  const [status, setStatus] = useState<string>('all');
  const [paymentMethod, setPaymentMethod] = useState<string>('all');
  const [detail, setDetail] = useState<Sale | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return visibleSales.filter((s) => {
      if (status !== 'all' && s.status !== status) return false;
      if (paymentMethod !== 'all' && s.paymentMethod !== paymentMethod) return false;
      if (period !== 'all') {
        const d = new Date(s.date);
        if (period === 'today' && !isToday(d)) return false;
        if (period === 'week' && !isSameWeek(d, new Date())) return false;
        if (period === 'month' && !isSameMonth(d, new Date())) return false;
      }
      if (!q) return true;
      return (
        s.invoiceNo.toLowerCase().includes(q) ||
        s.customerName.toLowerCase().includes(q)
      );
    });
  }, [visibleSales, query, period, status, paymentMethod]);

  const stats = useMemo(() => {
    const total = filtered.reduce((sum, s) => sum + s.total, 0);
    const due = filtered.reduce((sum, s) => sum + s.due, 0);
    const count = filtered.length;
    const avg = count > 0 ? total / count : 0;
    return { total, due, count, avg };
  }, [filtered]);

  const handleExport = () => {
    downloadCSV(
      filtered.map((s) => ({
        invoiceNo: s.invoiceNo,
        date: s.date,
        customer: s.customerName,
        items: s.items.length,
        subtotal: s.subtotal,
        discount: s.discount,
        tax: s.tax,
        total: s.total,
        paid: s.paid,
        due: s.due,
        paymentMethod: s.paymentMethod,
        cashier: s.cashier,
        status: s.status,
      })),
      `sales-${new Date().toISOString().slice(0, 10)}.csv`
    );
    toast.success('CSV downloaded');
  };

  return (
    <div>
      <PageHeader
        title={role === 'cashier' ? 'My Sales' : 'All Sales'}
        description={`${stats.count} transactions · ${formatCurrency(stats.total)} revenue · ${formatCurrency(stats.due)} due`}
        actions={
          <>
            <Button variant="outline" className="h-9" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button asChild className="h-9">
              <Link href="/pos">
                <ShoppingCart className="h-4 w-4 mr-2" />
                New Sale
              </Link>
            </Button>
          </>
        }
      />

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground uppercase tracking-wider">
              Transactions
            </div>
            <div className="text-lg font-bold mt-1 tabular-nums">{stats.count}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground uppercase tracking-wider">
              Total Revenue
            </div>
            <div className="text-lg font-bold mt-1 tabular-nums">
              {formatCurrency(stats.total)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground uppercase tracking-wider">
              Total Due
            </div>
            <div className="text-lg font-bold mt-1 tabular-nums text-red-600 dark:text-red-400">
              {formatCurrency(stats.due)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground uppercase tracking-wider">
              Average Sale
            </div>
            <div className="text-lg font-bold mt-1 tabular-nums">
              {formatCurrency(stats.avg)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search invoice or customer..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9 h-9"
          />
        </div>
        <Select value={period} onValueChange={(v) => setPeriod(v as Period)}>
          <SelectTrigger className="h-9 w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Time</SelectItem>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="h-9 w-[150px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="partial-return">Partial Return</SelectItem>
            <SelectItem value="returned">Returned</SelectItem>
          </SelectContent>
        </Select>
        <Select value={paymentMethod} onValueChange={setPaymentMethod}>
          <SelectTrigger className="h-9 w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Methods</SelectItem>
            <SelectItem value="cash">Cash</SelectItem>
            <SelectItem value="afterpay">Afterpay</SelectItem>
            <SelectItem value="paypal">PayPal</SelectItem>
            <SelectItem value="card">Card</SelectItem>
            <SelectItem value="due">Due</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <Card>
          <CardContent className="p-6">
            <EmptyState
              icon={Receipt}
              title="No sales found"
              description="Try different filters or make a new sale."
              action={
                <Button asChild>
                  <Link href="/pos">Open POS</Link>
                </Button>
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
                  <th className="text-left font-semibold px-4 py-2.5">Invoice</th>
                  <th className="text-left font-semibold px-4 py-2.5 hidden md:table-cell">
                    Customer
                  </th>
                  <th className="text-left font-semibold px-4 py-2.5 hidden lg:table-cell">
                    Date
                  </th>
                  <th className="text-left font-semibold px-4 py-2.5 hidden xl:table-cell">
                    Method
                  </th>
                  <th className="text-right font-semibold px-4 py-2.5">Total</th>
                  <th className="text-right font-semibold px-4 py-2.5 hidden sm:table-cell">
                    Due
                  </th>
                  <th className="text-center font-semibold px-4 py-2.5">Status</th>
                  <th className="text-right font-semibold px-4 py-2.5"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s) => (
                  <tr
                    key={s.id}
                    className="border-t border-border hover:bg-muted/30 transition cursor-pointer"
                    onClick={() => setDetail(s)}
                  >
                    <td className="px-4 py-2.5">
                      <div className="font-medium">{s.invoiceNo}</div>
                      <div className="text-xs text-muted-foreground">
                        {s.items.length} item{s.items.length > 1 ? 's' : ''}
                      </div>
                    </td>
                    <td className="px-4 py-2.5 hidden md:table-cell truncate max-w-[180px]">
                      {s.customerName}
                    </td>
                    <td className="px-4 py-2.5 hidden lg:table-cell text-xs text-muted-foreground whitespace-nowrap">
                      {formatDateTime(s.date)}
                    </td>
                    <td className="px-4 py-2.5 hidden xl:table-cell">
                      <Badge variant="secondary" className="text-[10px] uppercase">
                        {s.paymentMethod}
                      </Badge>
                    </td>
                    <td className="px-4 py-2.5 text-right font-semibold tabular-nums">
                      {formatCurrency(s.total)}
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums hidden sm:table-cell">
                      {s.due > 0 ? (
                        <span className="text-red-600 dark:text-red-400 font-medium">
                          {formatCurrency(s.due)}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      <StatusBadge variant={statusVariant(s.status)}>
                        {s.status}
                      </StatusBadge>
                    </td>
                    <td
                      className="px-4 py-2.5 text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => setDetail(s)}
                        title="View"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <SaleDetailDialog
        sale={detail}
        open={!!detail}
        onOpenChange={(v) => !v && setDetail(null)}
      />
    </div>
  );
}