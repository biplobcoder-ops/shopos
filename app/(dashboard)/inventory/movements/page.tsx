// app/(dashboard)/inventory/movements/page.tsx

'use client';

import { useMemo, useState } from 'react';
import { ArrowDownToLine, ArrowUpFromLine, History, Download } from 'lucide-react';
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
import { EmptyState } from '@/components/shared/empty-state';
import { useStockStore } from '@/lib/store/stock-store';
import { formatDateTime } from '@/lib/format';
import { downloadCSV } from '@/lib/export';
import { cn } from '@/lib/utils';

const TYPES = [
  'sale',
  'purchase',
  'sale-return',
  'purchase-return',
  'adjustment',
  'stock-in',
  'stock-out',
  'order-confirm',
  'order-cancel',
];

export default function MovementsPage() {
  const movements = useStockStore((s) => s.movements);

  const [query, setQuery] = useState('');
  const [type, setType] = useState<string>('all');
  const [direction, setDirection] = useState<string>('all');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return movements.filter((m) => {
      if (type !== 'all' && m.type !== type) return false;
      if (direction === 'in' && m.qty <= 0) return false;
      if (direction === 'out' && m.qty >= 0) return false;
      if (!q) return true;
      return (
        m.productName.toLowerCase().includes(q) ||
        m.reference.toLowerCase().includes(q) ||
        (m.note ?? '').toLowerCase().includes(q)
      );
    });
  }, [movements, query, type, direction]);

  const handleExport = () => {
    downloadCSV(
      filtered.map((m) => ({
        date: m.date,
        product: m.productName,
        type: m.type,
        qty: m.qty,
        before: m.before,
        after: m.after,
        reference: m.reference,
        note: m.note ?? '',
        user: m.user,
      })),
      `stock-movements-${new Date().toISOString().slice(0, 10)}.csv`
    );
  };

  return (
    <div>
      <PageHeader
        title="Stock Movements"
        description={`${movements.length} total movements · ${filtered.length} shown`}
        actions={
          <Button variant="outline" className="h-9" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        }
      />

      <div className="flex flex-wrap items-center gap-2 mb-4">
        <Input
          placeholder="Search product, reference or note..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="h-9 max-w-xs"
        />
        <Select value={type} onValueChange={setType}>
          <SelectTrigger className="h-9 w-[180px]">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {TYPES.map((t) => (
              <SelectItem key={t} value={t}>
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={direction} onValueChange={setDirection}>
          <SelectTrigger className="h-9 w-[140px]">
            <SelectValue placeholder="Direction" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">In + Out</SelectItem>
            <SelectItem value="in">Stock In</SelectItem>
            <SelectItem value="out">Stock Out</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="p-6">
            <EmptyState
              icon={History}
              title="No movements"
              description="Try different filters or record a new movement."
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
                  <th className="text-left font-semibold px-4 py-2.5">Product</th>
                  <th className="text-left font-semibold px-4 py-2.5 hidden md:table-cell">
                    Type
                  </th>
                  <th className="text-right font-semibold px-4 py-2.5">Change</th>
                  <th className="text-right font-semibold px-4 py-2.5 hidden lg:table-cell">
                    Before
                  </th>
                  <th className="text-right font-semibold px-4 py-2.5 hidden lg:table-cell">
                    After
                  </th>
                  <th className="text-left font-semibold px-4 py-2.5 hidden md:table-cell">
                    Reference
                  </th>
                  <th className="text-left font-semibold px-4 py-2.5 hidden xl:table-cell">
                    Note
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.slice(0, 200).map((m) => (
                  <tr key={m.id} className="border-t border-border hover:bg-muted/30">
                    <td className="px-4 py-2.5 text-xs text-muted-foreground whitespace-nowrap">
                      {formatDateTime(m.date)}
                    </td>
                    <td className="px-4 py-2.5 font-medium truncate max-w-[240px]">
                      {m.productName}
                    </td>
                    <td className="px-4 py-2.5 hidden md:table-cell">
                      <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider">
                        {m.qty >= 0 ? (
                          <ArrowDownToLine className="h-3 w-3 text-emerald-500" />
                        ) : (
                          <ArrowUpFromLine className="h-3 w-3 text-red-500" />
                        )}
                        {m.type}
                      </span>
                    </td>
                    <td
                      className={cn(
                        'px-4 py-2.5 text-right tabular-nums font-semibold',
                        m.qty >= 0
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-red-600 dark:text-red-400'
                      )}
                    >
                      {m.qty > 0 ? '+' : ''}
                      {m.qty}
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums hidden lg:table-cell text-muted-foreground">
                      {m.before}
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums hidden lg:table-cell">
                      {m.after}
                    </td>
                    <td className="px-4 py-2.5 hidden md:table-cell text-xs text-muted-foreground">
                      {m.reference}
                    </td>
                    <td className="px-4 py-2.5 hidden xl:table-cell text-xs text-muted-foreground truncate max-w-[200px]">
                      {m.note ?? '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length > 200 && (
            <div className="px-4 py-2 text-xs text-muted-foreground border-t">
              Showing first 200 of {filtered.length}. Export CSV for full list.
            </div>
          )}
        </Card>
      )}
    </div>
  );
}