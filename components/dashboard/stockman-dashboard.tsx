// components/dashboard/stockman-dashboard.tsx

'use client';

import { useMemo } from 'react';
import { Package, Warehouse, AlertTriangle, PackageX } from 'lucide-react';
import { useProductStore } from '@/lib/store/product-store';
import { StatCard } from './stat-card';
import { CategoryStockChart } from './category-stock-chart';
import { LowStockWidget } from './low-stock-widget';
import { RecentMovementsWidget } from './recent-movements-widget';
import { PageHeader } from '@/components/shared/page-header';

export function StockmanDashboard() {
  const products = useProductStore((s) => s.products);

  const stats = useMemo(() => {
    const stockValue = products.reduce((s, p) => s + p.stock * p.purchasePrice, 0);
    const lowStock = products.filter((p) => p.stock > 0 && p.stock <= p.minStock).length;
    const outOfStock = products.filter((p) => p.stock <= 0).length;
    return {
      totalProducts: products.length,
      stockValue,
      lowStock,
      outOfStock,
    };
  }, [products]);

  return (
    <div className="space-y-4 md:space-y-6">
      <PageHeader
        title="Stock Manager Dashboard"
        description="Monitor stock levels, movements and inventory value."
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <StatCard
          title="Total Products"
          value={stats.totalProducts}
          icon={Package}
          variant="indigo"
          format="number"
        />
        <StatCard
          title="Stock Value"
          value={stats.stockValue}
          icon={Warehouse}
          variant="cyan"
        />
        <StatCard
          title="Low Stock"
          value={stats.lowStock}
          icon={AlertTriangle}
          variant="amber"
          format="number"
        />
        <StatCard
          title="Out of Stock"
          value={stats.outOfStock}
          icon={PackageX}
          variant="red"
          format="number"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <CategoryStockChart />
        <LowStockWidget limit={10} />
      </div>

      <RecentMovementsWidget limit={10} />
    </div>
  );
}