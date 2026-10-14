// components/dashboard/cashier-dashboard.tsx

'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { ShoppingCart, Receipt, DollarSign, TrendingUp } from 'lucide-react';
import { isToday, isSameMonth } from 'date-fns';
import { useSaleStore } from '@/lib/store/sale-store';
import { StatCard } from './stat-card';
import { HourlySalesChart } from './hourly-sales-chart';
import { RecentSalesWidget } from './recent-sales-widget';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export function CashierDashboard() {
  const { data } = useSession();
  const sales = useSaleStore((s) => s.sales);

  const cashier = data?.user?.email ?? '';

  const stats = useMemo(() => {
    const mine = sales.filter((s) => s.cashier === cashier);
    const todaySales = mine
      .filter((s) => isToday(new Date(s.date)))
      .reduce((sum, s) => sum + s.total, 0);
    const monthSales = mine
      .filter((s) => isSameMonth(new Date(s.date), new Date()))
      .reduce((sum, s) => sum + s.total, 0);
    return {
      todaySales,
      monthSales,
      transactions: mine.length,
    };
  }, [sales, cashier]);

  return (
    <div className="space-y-4 md:space-y-6">
      <PageHeader
        title="Cashier Dashboard"
        description="Your sales performance and quick POS access."
        actions={
          <Button asChild className="h-9">
            <Link href="/pos">
              <ShoppingCart className="h-4 w-4 mr-2" />
              Open POS
            </Link>
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
        <StatCard
          title="Today's Sales"
          value={stats.todaySales}
          icon={DollarSign}
          variant="indigo"
        />
        <StatCard
          title="My Sales This Month"
          value={stats.monthSales}
          icon={TrendingUp}
          variant="emerald"
        />
        <StatCard
          title="My Transactions"
          value={stats.transactions}
          icon={Receipt}
          variant="purple"
          format="number"
        />
      </div>

      {/* Quick POS banner */}
      <Card className="bg-gradient-to-br from-brand-600 via-brand-700 to-brand-800 border-0 text-white overflow-hidden">
        <CardContent className="p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="text-lg md:text-xl font-bold">Ready to ring up a sale?</div>
            <div className="text-sm text-white/80">
              Jump into the POS screen — barcode scan, cart, payment and receipt.
            </div>
          </div>
          <Button
            asChild
            size="lg"
            className="bg-white text-brand-700 hover:bg-white/90 h-10"
          >
            <Link href="/pos">
              <ShoppingCart className="h-4 w-4 mr-2" />
              Open POS
            </Link>
          </Button>
        </CardContent>
      </Card>

      <HourlySalesChart cashierEmail={cashier} />

      <RecentSalesWidget
        title="My Recent Sales"
        cashierEmail={cashier}
        limit={8}
      />
    </div>
  );
}