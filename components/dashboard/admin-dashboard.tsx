// components/dashboard/admin-dashboard.tsx

'use client';

import { useMemo } from 'react';
import {
  DollarSign,
  TrendingUp,
  Users,
  Factory,
  Warehouse,
  AlertTriangle,
  ShoppingCart,
} from 'lucide-react';
import { useSaleStore } from '@/lib/store/sale-store';
import { usePurchaseStore } from '@/lib/store/purchase-store';
import { useProductStore } from '@/lib/store/product-store';
import { useCustomerStore } from '@/lib/store/customer-store';
import { useSupplierStore } from '@/lib/store/supplier-store';

import { StatCard } from './stat-card';
import { SalesChart } from './sales-chart';
import { PurchaseSalesChart } from './purchase-sales-chart';
import { CategoryPieChart } from './category-pie-chart';
import { LowStockWidget } from './low-stock-widget';
import { RecentOrdersWidget } from './recent-orders-widget';
import { RecentSalesWidget } from './recent-sales-widget';
import { TopProductsWidget } from './top-products-widget';
import { PageHeader } from '@/components/shared/page-header';

export function AdminDashboard() {
  const sales = useSaleStore((s) => s.sales);
  const purchases = usePurchaseStore((s) => s.purchases);
  const products = useProductStore((s) => s.products);
  const customers = useCustomerStore((s) => s.customers);
  const suppliers = useSupplierStore((s) => s.suppliers);

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
    const supplierDue = suppliers.reduce((s, c) => s + c.due, 0);
    const stockValue = products.reduce((s, p) => s + p.stock * p.purchasePrice, 0);
    const lowStock = products.filter((p) => p.stock > 0 && p.stock <= p.minStock).length;
    const outOfStock = products.filter((p) => p.stock <= 0).length;
    return {
      totalSales,
      totalPurchase,
      profit,
      customerDue,
      supplierDue,
      stockValue,
      lowStock,
      outOfStock,
    };
  }, [sales, purchases, products, customers, suppliers]);

  return (
    <div className="space-y-4 md:space-y-6">
      <PageHeader
        title="Admin Dashboard"
        description="Complete business overview with sales, purchase and inventory health."
      />

      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <StatCard
          title="Total Sales"
          value={stats.totalSales}
          icon={DollarSign}
          variant="indigo"
          delta={12.4}
        />
        <StatCard
          title="Total Purchase"
          value={stats.totalPurchase}
          icon={ShoppingCart}
          variant="amber"
          delta={-4.1}
        />
        <StatCard
          title="Gross Profit"
          value={stats.profit}
          icon={TrendingUp}
          variant="emerald"
          delta={8.7}
        />
        <StatCard
          title="Customer Due"
          value={stats.customerDue}
          icon={Users}
          variant="red"
        />
        <StatCard
          title="Supplier Due"
          value={stats.supplierDue}
          icon={Factory}
          variant="purple"
        />
        <StatCard
          title="Stock Value"
          value={stats.stockValue}
          icon={Warehouse}
          variant="cyan"
        />
        <StatCard
          title="Low Stock Items"
          value={stats.lowStock}
          icon={AlertTriangle}
          variant="amber"
          format="number"
          subtitle={`${stats.outOfStock} out of stock`}
        />
        <StatCard
          title="Total Products"
          value={products.length}
          icon={Warehouse}
          variant="zinc"
          format="number"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <SalesChart />
        </div>
        <CategoryPieChart />
      </div>

      <PurchaseSalesChart />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <LowStockWidget />
        <RecentOrdersWidget />
        <RecentSalesWidget />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TopProductsWidget />
        <RecentSalesWidget title="Latest Transactions" limit={8} />
      </div>
    </div>
  );
}