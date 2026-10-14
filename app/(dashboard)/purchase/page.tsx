// app/(dashboard)/purchase/page.tsx

'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  Truck,
  Download,
  Eye,
  Plus,
  Search,
} from 'lucide-react';
import { isToday, isSameMonth, isSameWeek } from 'date-fns';

import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { StatusBadge, statusVariant } from '@/components/shared/status-badge';
import { EmptyState } from '@/components/shared/empty-state';
import { PurchaseDetailDialog } from '@/components/purchase/purchase-detail-dialog';
import { usePurchaseStore } from '@/lib/store/purchase-store';
import { formatCurrency, formatDateTime } from '@/lib/format';
import { downloadCSV } from '@/lib/export';
import type { Purchase } from '@/lib/types';

type Period = 'today' | 'week' | 'month' | 'all';

export default function PurchasePage() {
  const purchases = usePurchaseStore((s) => s.purchases);

  const [query, setQuery] = useState('');
  const [period, setPeriod] = useState<Period>('all');
  const [status, setStatus] = useState<string>('all');
  const [detail, setDetail] = useState<Purchase | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return purchases.filter((p) => {
      if (status !== 'all' && p.status !== status) return false;
      if (period !== 'all') {
        const d = new Date(p.date);
        if (period === 'today' && !isToday(d)) return false;
        if (period === 'week' && !isSameWeek(d, new Date())) return false;
        if (period === 'month' && !isSameMonth(d, new Date())) return false;
      }
      if (!q) return true;
      return (
        p.purchaseNo.toLowerCase().includes(q) ||
        p.supplierName.toLowerCase().includes(q)
      );
    });
  }, [purchases, query, period, status]);

  const stats = useMemo(() => {
    const total = filtered.reduce((sum, p) => sum + p.total, 0);
    const due = filtered.reduce((sum, p) => sum + p.due, 0);
    const count = filtered.length;
    return { total, due, count };
  }, [filtered]);

  const handleExport = () => {
    downloadCSV(
      filtered.map((p) => ({
        purchaseNo: p.purchaseNo,
        date: p.date,
        supplier: p.supplierName,
        items: p.items.length,
        subtotal: p.subtotal,
        discount: p.discount,
        tax: p.tax,
        total: p.total,
        paid: p.paid,
        due: p.due,
        status: p.status,
      })),
      `purchases-${new Date().toISOString().slice(0, 10)}.csv`
    );
    toast.success('CSV downloaded');
  };

  return (
    <div>
      <PageHeader
        title="Purchases"
        description={`${stats.count} purchases · ${formatCurrency(stats.total)} total · ${formatCurrency(stats.due)} due`}
        actions={
          <>
            <Button variant="outline" className="h-9" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button asChild className="h-9">
              <Link href="/purchase/create">
                <Plus className="h-4 w-4 mr-2" />
                Create Purchase
              </Link>
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground uppercase tracking-wider">
              Purchase Count
            </div>
            <div className="text-lg font-bold mt-1 tabular-nums">{stats.count}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground uppercase tracking-wider">
              Total Value
            </div>
            <div className="text-lg font-bold mt-1 tabular-nums">
              {formatCurrency(stats.total)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground uppercase tracking-wider">
              Outstanding Due
            </div>
            <div className="text-lg font-bold mt-1 tabular-nums text-red-600 dark:text-red-400">
              {formatCurrency(stats.due)}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-4">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search purchase no or supplier..."
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
            <SelectItem value="received">Received</SelectItem>
            <SelectItem value="partial-return">Partial Return</SelectItem>
            <SelectItem value="returned">Returned</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="p-6">
            <EmptyState
              icon={Truck}
              title="No purchases found"
              description="Create your first purchase to get started."
              action={
                <Button asChild>
                  <Link href="/purchase/create">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Purchase
                  </Link>
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
                  <th className="text-left font-semibold px-4 py-2.5">Purchase</th>
                  <th className="text-left font-semibold px-4 py-2.5 hidden md:table-cell">
                    Supplier
                  </th>
                  <th className="text-left font-semibold px-4 py-2.5 hidden lg:table-cell">
                    Date
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
                {filtered.map((p) => (
                  <tr
                    key={p.id}
                    className="border-t border-border hover:bg-muted/30 transition cursor-pointer"
                    onClick={() => setDetail(p)}
                  >
                    <td className="px-4 py-2.5">
                      <div className="font-medium">{p.purchaseNo}</div>
                      <div className="text-xs text-muted-foreground">
                        {p.items.length} item{p.items.length > 1 ? 's' : ''}
                      </div>
                    </td>
                    <td className="px-4 py-2.5 hidden md:table-cell truncate max-w-[180px]">
                      {p.supplierName}
                    </td>
                    <td className="px-4 py-2.5 hidden lg:table-cell text-xs text-muted-foreground whitespace-nowrap">
                      {formatDateTime(p.date)}
                    </td>
                    <td className="px-4 py-2.5 text-right font-semibold tabular-nums">
                      {formatCurrency(p.total)}
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums hidden sm:table-cell">
                      {p.due > 0 ? (
                        <span className="text-red-600 dark:text-red-400 font-medium">
                          {formatCurrency(p.due)}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      <StatusBadge variant={statusVariant(p.status)}>
                        {p.status}
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
                        onClick={() => setDetail(p)}
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

      <PurchaseDetailDialog
        purchase={detail}
        open={!!detail}
        onOpenChange={(v) => !v && setDetail(null)}
      />
    </div>
  );
}