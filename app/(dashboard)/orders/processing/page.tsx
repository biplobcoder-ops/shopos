// app/(dashboard)/orders/processing/page.tsx

'use client';

import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { PackageSearch } from 'lucide-react';
import { useSession } from 'next-auth/react';

import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EmptyState } from '@/components/shared/empty-state';
import { DataTable } from '@/components/shared/data-table';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { OrderDetailDialog } from '@/components/orders/order-detail-dialog';
import { makeOrderColumns } from '@/components/orders/order-columns';
import { useOrderStore } from '@/lib/store/order-store';
import type { Order } from '@/lib/types';

export default function ProcessingOrdersPage() {
  const { data: session } = useSession();
  const { orders, updateStatus, cancel } = useOrderStore();
  const [tab, setTab] = useState<'processing' | 'shipped'>('processing');
  const [detail, setDetail] = useState<Order | null>(null);
  const [cancelTarget, setCancelTarget] = useState<Order | null>(null);

  const processingCount = orders.filter((o) => o.status === 'processing').length;
  const shippedCount = orders.filter((o) => o.status === 'shipped').length;

  const filtered = useMemo(
    () => orders.filter((o) => o.status === tab),
    [orders, tab]
  );

  const columns = useMemo(
    () =>
      makeOrderColumns({
        onView: setDetail,
        onStatusChange: (o, status) => {
          updateStatus(o.id, status, session?.user?.email ?? 'system');
          toast.success(`Order ${o.orderNo} → ${status}`);
          if (status === 'delivered') toast.info('Stock deducted');
        },
        onCancel: setCancelTarget,
      }),
    [updateStatus, session]
  );

  return (
    <div>
      <PageHeader
        title="In Transit Orders"
        description="Orders being processed or shipped to customers"
      />

      <Tabs value={tab} onValueChange={(v) => setTab(v as any)} className="mb-4">
        <TabsList className="h-9">
          <TabsTrigger value="processing" className="text-xs">
            Processing ({processingCount})
          </TabsTrigger>
          <TabsTrigger value="shipped" className="text-xs">
            Shipped ({shippedCount})
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="p-6">
            <EmptyState
              icon={PackageSearch}
              title={`No ${tab} orders`}
              description={`No orders currently in ${tab} status.`}
            />
          </CardContent>
        </Card>
      ) : (
        <DataTable
          columns={columns}
          data={filtered}
          searchKey="customerName"
          searchPlaceholder="Search orders..."
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
        description={`Order ${cancelTarget?.orderNo} will be cancelled.`}
        onConfirm={() => {
          if (cancelTarget) {
            cancel(cancelTarget.id, session?.user?.email ?? 'system');
            toast.success('Order cancelled');
            setCancelTarget(null);
          }
        }}
      />
    </div>
  );
}