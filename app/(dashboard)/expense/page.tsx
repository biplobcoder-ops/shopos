// app/(dashboard)/expense/page.tsx

'use client';

import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import {
  Wallet,
  Plus,
  Download,
  Pencil,
  Trash2,
  Search,
  TrendingDown,
  Calendar,
} from 'lucide-react';

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
import { EmptyState } from '@/components/shared/empty-state';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { ExpenseFormDialog } from '@/components/expense/expense-form-dialog';
import { useExpenseStore } from '@/lib/store/expense-store';
import { formatCurrency, formatDate } from '@/lib/format';
import { downloadCSV } from '@/lib/export';
import { isToday, isSameMonth, isSameWeek } from 'date-fns';
import type { Expense } from '@/lib/types';

type Period = 'today' | 'week' | 'month' | 'all';

export default function ExpensePage() {
  const { expenses, categories, remove } = useExpenseStore();

  const [query, setQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [period, setPeriod] = useState<Period>('month');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Expense | null>(null);
  const [deleting, setDeleting] = useState<Expense | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return expenses.filter((e) => {
      if (categoryFilter !== 'all' && e.categoryId !== categoryFilter) return false;
      if (period !== 'all') {
        const d = new Date(e.date);
        if (period === 'today' && !isToday(d)) return false;
        if (period === 'week' && !isSameWeek(d, new Date())) return false;
        if (period === 'month' && !isSameMonth(d, new Date())) return false;
      }
      if (!q) return true;
      return (
        e.categoryName.toLowerCase().includes(q) ||
        (e.note ?? '').toLowerCase().includes(q)
      );
    });
  }, [expenses, query, categoryFilter, period]);

  const stats = useMemo(() => {
    const total = filtered.reduce((s, e) => s + e.amount, 0);
    const count = filtered.length;
    const avg = count > 0 ? total / count : 0;

    // Top category
    const map = new Map<string, number>();
    filtered.forEach((e) => {
      map.set(e.categoryName, (map.get(e.categoryName) ?? 0) + e.amount);
    });
    const top = Array.from(map.entries()).sort((a, b) => b[1] - a[1])[0];

    return { total, count, avg, topCategory: top?.[0] ?? '—', topAmount: top?.[1] ?? 0 };
  }, [filtered]);

  const handleExport = () => {
    downloadCSV(
      filtered.map((e) => ({
        date: e.date,
        category: e.categoryName,
        amount: e.amount,
        note: e.note ?? '',
        createdBy: e.createdBy,
      })),
      `expenses-${new Date().toISOString().slice(0, 10)}.csv`
    );
    toast.success('CSV downloaded');
  };

  return (
    <div>
      <PageHeader
        title="Expenses"
        description={`${stats.count} expenses · ${formatCurrency(stats.total)} total`}
        actions={
          <>
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
              Add Expense
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider">
                  Total
                </div>
                <div className="text-lg font-bold mt-1 tabular-nums">
                  {formatCurrency(stats.total)}
                </div>
              </div>
              <Wallet className="h-5 w-5 text-red-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider">
                  Entries
                </div>
                <div className="text-lg font-bold mt-1 tabular-nums">
                  {stats.count}
                </div>
              </div>
              <Calendar className="h-5 w-5 text-brand-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider">
                  Average
                </div>
                <div className="text-lg font-bold mt-1 tabular-nums">
                  {formatCurrency(stats.avg)}
                </div>
              </div>
              <TrendingDown className="h-5 w-5 text-amber-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground uppercase tracking-wider truncate">
              Top Category
            </div>
            <div className="text-sm font-bold mt-1 truncate">
              {stats.topCategory}
            </div>
            <div className="text-xs text-muted-foreground tabular-nums mt-0.5">
              {formatCurrency(stats.topAmount)}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-4">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search category or note..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9 h-9"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="h-9 w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={period} onValueChange={(v) => setPeriod(v as Period)}>
          <SelectTrigger className="h-9 w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
            <SelectItem value="all">All Time</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="p-6">
            <EmptyState
              icon={Wallet}
              title="No expenses found"
              description="Try different filters or add a new expense."
              action={
                <Button onClick={() => setFormOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Expense
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
                  <th className="text-left font-semibold px-4 py-2.5">Date</th>
                  <th className="text-left font-semibold px-4 py-2.5">Category</th>
                  <th className="text-left font-semibold px-4 py-2.5 hidden md:table-cell">
                    Note
                  </th>
                  <th className="text-right font-semibold px-4 py-2.5">Amount</th>
                  <th className="text-right font-semibold px-4 py-2.5 w-24"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((e) => (
                  <tr
                    key={e.id}
                    className="border-t border-border hover:bg-muted/30 transition"
                  >
                    <td className="px-4 py-2.5 text-xs text-muted-foreground whitespace-nowrap">
                      {formatDate(e.date)}
                    </td>
                    <td className="px-4 py-2.5">
                      <Badge variant="secondary" className="text-[10px] font-normal">
                        {e.categoryName}
                      </Badge>
                    </td>
                    <td className="px-4 py-2.5 hidden md:table-cell text-muted-foreground truncate max-w-[300px]">
                      {e.note ?? '—'}
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums font-semibold text-red-600 dark:text-red-400">
                      {formatCurrency(e.amount)}
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => {
                            setEditing(e);
                            setFormOpen(true);
                          }}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-red-500 hover:text-red-500 hover:bg-red-500/10"
                          onClick={() => setDeleting(e)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <ExpenseFormDialog
        open={formOpen}
        onOpenChange={(v) => {
          setFormOpen(v);
          if (!v) setEditing(null);
        }}
        expense={editing}
      />

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(v) => !v && setDeleting(null)}
        title="Delete expense?"
        description="This will remove the expense record permanently."
        onConfirm={() => {
          if (deleting) {
            remove(deleting.id);
            toast.success('Expense deleted');
            setDeleting(null);
          }
        }}
      />
    </div>
  );
}