// components/dashboard/manager-dashboard.tsx

'use client';

import { useMemo } from 'react';
import {
  DollarSign,
  ShoppingCart,
  TrendingUp,
  Users,
  Warehouse,
  AlertTriangle,
  Clock,
} from 'lucide-react';
import { useSaleStore } from '@/lib/store/sale-store';
import { usePurchaseStore } from '@/lib/store/purchase-store';
import { useProductStore } from '@/lib/store/product-store';
import { useCustomerStore } from '@/lib/store/customer-store';
import { useOrderStore } from '@/lib/store/order-store';

import { StatCard } from './stat-card';
import { SalesChart } from './sales-chart';
import { CategoryPieChart } from './category-pie-chart';
import { LowStockWidget } from './low-stock-widget';
import { RecentSalesWidget } from './recent-sales-widget';
import { PageHeader } from '@/components/shared/page-header';

export function ManagerDashboard() {
  const sales = useSaleStore((s) => s.sales);
  const purchases = usePurchaseStore((s) => s.purchases);
  const products = useProductStore((s) => s.products);
  const customers = useCustomerStore((s) => s.customers);
  const orders = useOrderStore((s) => s.orders);

  const stats = useMemo(() => {
    const totalSales = sales.reduce((s, x) => s + x.total, 0);
    const totalPurchase = purchases.reduce((s, x) => s + x.total, 0);
    const profit = sales.reduce((s, sale) => {
      const cost = sale.items.reduce(
        (cs, it) => cs + it.purchasePrice * it.qty,
        0
      );
      return s + (sale.subtotal - sale.discount - cost);
    }, 0);
    const customerDue = customers.reduce((s, c) => s + c.due, 0);
    const stockValue = products.reduce((s, p) => s + p.stock * p.purchasePrice, 0);
    const lowStock = products.filter((p) => p.stock > 0 && p.stock <= p.minStock).length;
    return { totalSales, totalPurchase, profit, customerDue, stockValue, lowStock };
  }, [sales, purchases, products, customers]);

  const pendingOrders = orders.filter((o) => o.status === 'pending').slice(0, 6);

  return (
    <div className="space-y-4 md:space-y-6">
      <PageHeader
        title="Manager Dashboard"
        description="Operations at a glance — sales, purchase, dues and stock."
      />

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
        <StatCard title="Total Sales" value={stats.totalSales} icon={DollarSign} variant="indigo" />
        <StatCard title="Total Purchase" value={stats.totalPurchase} icon={ShoppingCart} variant="amber" />
        <StatCard title="Profit" value={stats.profit} icon={TrendingUp} variant="emerald" />
        <StatCard title="Customer Due" value={stats.customerDue} icon={Users} variant="red" />
        <StatCard title="Stock Value" value={stats.stockValue} icon={Warehouse} variant="cyan" />
        <StatCard
          title="Low Stock"
          value={stats.lowStock}
          icon={AlertTriangle}
          variant="purple"
          format="number"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <SalesChart days={30} />
        </div>
        <CategoryPieChart />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <RecentSalesWidget title="Recent Sales" />
        <div className="lg:col-span-1 rounded-xl border bg-card">
          <div className="p-4 flex items-center justify-between border-b border-border">
            <div className="text-sm font-semibold flex items-center gap-2">
              <Clock className="h-4 w-4 text-amber-500" />
              Pending Orders
            </div>
            <span className="text-xs text-muted-foreground">{pendingOrders.length}</span>
          </div>
          <ul className="divide-y divide-border">
            {pendingOrders.length === 0 ? (
              <li className="p-6 text-center text-sm text-muted-foreground">
                No pending orders
              </li>
            ) : (
              pendingOrders.map((o) => (
                <li key={o.id} className="p-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate">
                      {o.orderNo} · {o.customerName}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {o.items.length} item{o.items.length > 1 ? 's' : ''}
                    </div>
                  </div>
                  <div className="text-sm font-semibold tabular-nums">
                    ${o.total.toLocaleString()}
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
        <LowStockWidget />
      </div>
    </div>
  );
}