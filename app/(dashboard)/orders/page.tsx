// app/(dashboard)/orders/page.tsx

'use client';

import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Download, PackageCheck, ScanBarcode, X } from 'lucide-react';

import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DataTable } from '@/components/shared/data-table';
import { EmptyState } from '@/components/shared/empty-state';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { OrderDetailDialog } from '@/components/orders/order-detail-dialog';
import { makeOrderColumns } from '@/components/orders/order-columns';
import { BarcodeScanButton } from '@/components/shared/barcode-scan-button';
import { useOrderStore } from '@/lib/store/order-store';
import { useProductStore } from '@/lib/store/product-store';
import { useSession } from 'next-auth/react';
import { downloadCSV } from '@/lib/export';
import type { Order, OrderStatus } from '@/lib/types';

type TabKey =
  | 'all'
  | 'pending'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

export default function OrdersPage() {
  const { data: session } = useSession();
  const { orders, updateStatus, cancel } = useOrderStore();
  const products = useProductStore((s) => s.products);

  const [tab, setTab] = useState<TabKey>('all');
  const [detail, setDetail] = useState<Order | null>(null);
  const [cancelTarget, setCancelTarget] = useState<Order | null>(null);
  const [scannedProductId, setScannedProductId] = useState<string>('');

  const counts = useMemo(() => {
    const c: Record<string, number> = {
      all: orders.length,
      pending: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
    };
    orders.forEach((o) => {
      c[o.status] = (c[o.status] ?? 0) + 1;
    });
    return c;
  }, [orders]);

  const filtered = useMemo(() => {
    let list = orders;
    if (tab !== 'all') {
      list = list.filter((o) => o.status === tab);
    }
    // If scanned product filter is active
    if (scannedProductId) {
      list = list.filter((o) =>
        o.items.some((it) => it.productId === scannedProductId)
      );
    }
    return list;
  }, [orders, tab, scannedProductId]);

  const columns = useMemo(
    () =>
      makeOrderColumns({
        onView: (o) => setDetail(o),
        onStatusChange: (o, status) => {
          updateStatus(o.id, status, session?.user?.email ?? 'system');
          toast.success(`Order ${o.orderNo} → ${status}`);
          if (status === 'delivered') {
            toast.info('Stock deducted');
          }
        },
        onCancel: (o) => setCancelTarget(o),
      }),
    [updateStatus, session]
  );

  /** Handle barcode scan — find orders containing that product */
  const handleBarcodeScan = (code: string) => {
    const trimmed = code.trim();
    const product =
      products.find((p) => p.barcode === trimmed) ||
      products.find((p) => p.sku.toLowerCase() === trimmed.toLowerCase());

    if (!product) {
      toast.error(`No product found for "${trimmed}"`);
      return;
    }

    const matchCount = orders.filter((o) =>
      o.items.some((it) => it.productId === product.id)
    ).length;

    if (matchCount === 0) {
      toast.error(`No orders found containing ${product.name}`);
      return;
    }

    setScannedProductId(product.id);
    setTab('all');
    toast.success(`Found: ${product.name}`, {
      description: `${matchCount} order${matchCount === 1 ? '' : 's'} contain this product.`,
    });
  };

  const clearScan = () => setScannedProductId('');

  const handleExport = () => {
    downloadCSV(
      filtered.map((o) => ({
        orderNo: o.orderNo,
        date: o.date,
        customer: o.customerName,
        phone: o.customerPhone,
        items: o.items.length,
        subtotal: o.subtotal,
        delivery: o.delivery,
        total: o.total,
        status: o.status,
        paymentMethod: o.paymentMethod,
        address: o.deliveryAddress,
      })),
      `orders-${tab}-${new Date().toISOString().slice(0, 10)}.csv`
    );
    toast.success('CSV downloaded');
  };

  return (
    <div>
      <PageHeader
        title="Orders"
        description={`${orders.length} total orders · ${counts.pending} pending · ${counts.delivered} delivered`}
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
          </>
        }
      />

      {/* Scan Alert */}
      {scannedProductId && (
        <div className="mb-4 rounded-lg border border-brand-500/30 bg-brand-500/5 p-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm min-w-0">
            <ScanBarcode className="h-4 w-4 text-brand-600 dark:text-brand-400 shrink-0" />
            <span className="font-medium truncate">
              Showing orders with:{' '}
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

      <Tabs
        value={tab}
        onValueChange={(v) => setTab(v as TabKey)}
        className="mb-4"
      >
        <TabsList className="h-9 flex-wrap">
          <TabsTrigger value="all" className="text-xs">
            All ({counts.all})
          </TabsTrigger>
          <TabsTrigger value="pending" className="text-xs">
            Pending ({counts.pending})
          </TabsTrigger>
          <TabsTrigger value="processing" className="text-xs">
            Processing ({counts.processing})
          </TabsTrigger>
          <TabsTrigger value="shipped" className="text-xs">
            Shipped ({counts.shipped})
          </TabsTrigger>
          <TabsTrigger value="delivered" className="text-xs">
            Delivered ({counts.delivered})
          </TabsTrigger>
          <TabsTrigger value="cancelled" className="text-xs">
            Cancelled ({counts.cancelled})
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="p-6">
            <EmptyState
              icon={PackageCheck}
              title={
                scannedProductId
                  ? 'No orders contain this product'
                  : tab === 'all'
                  ? 'No orders yet'
                  : `No ${tab} orders`
              }
              description={
                scannedProductId
                  ? 'Clear the scan filter to see all orders.'
                  : tab === 'all'
                  ? 'Website orders will show up here as customers place them.'
                  : `No orders in ${tab} status right now.`
              }
            />
          </CardContent>
        </Card>
      ) : (
        <DataTable
          columns={columns}
          data={filtered}
          searchKey="customerName"
          searchPlaceholder="Search by customer, order no..."
          emptyTitle="No orders"
          pageSize={10}
        />
      )}

      <OrderDetailDialog
        order={detail}
        open={!!detail}
        onOpenChange={(v) => !v && setDetail(null)}
      />

      <ConfirmDialog
        open={!!cancelTarget}
        onOpenChange={(v) => !v && setCancelTarget(null)}
        title="Cancel order?"
        description={`Order ${cancelTarget?.orderNo} will be marked as cancelled. ${
          cancelTarget?.status === 'delivered' ? 'Stock will be restored.' : ''
        }`}
        confirmLabel="Cancel Order"
        onConfirm={() => {
          if (cancelTarget) {
            cancel(
              cancelTarget.id,
              session?.user?.email ?? 'system'
            );
            toast.success('Order cancelled');
            if (cancelTarget.status === 'delivered') {
              toast.info('Stock restored');
            }
            setCancelTarget(null);
          }
        }}
      />
    </div>
  );
}