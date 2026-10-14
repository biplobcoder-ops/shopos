// app/(dashboard)/orders/delivered/page.tsx

'use client';

import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { CheckCircle2 } from 'lucide-react';
import { useSession } from 'next-auth/react';

import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { EmptyState } from '@/components/shared/empty-state';
import { DataTable } from '@/components/shared/data-table';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { OrderDetailDialog } from '@/components/orders/order-detail-dialog';
import { makeOrderColumns } from '@/components/orders/order-columns';
import { useOrderStore } from '@/lib/store/order-store';
import type { Order } from '@/lib/types';

export default function DeliveredOrdersPage() {
  const { data: session } = useSession();
  const { orders, cancel } = useOrderStore();
  const [detail, setDetail] = useState<Order | null>(null);
  const [cancelTarget, setCancelTarget] = useState<Order | null>(null);

  const filtered = useMemo(
    () => orders.filter((o) => o.status === 'delivered'),
    [orders]
  );

  const totalRevenue = useMemo(
    () => filtered.reduce((s, o) => s + o.total, 0),
    [filtered]
  );

  const columns = useMemo(
    () =>
      makeOrderColumns({
        onView: setDetail,
        onStatusChange: () => {
          toast.info('Delivered orders cannot change status');
        },
        onCancel: setCancelTarget,
      }),
    []
  );

  return (
    <div>
      <PageHeader
        title="Delivered Orders"
        description={`${filtered.length} delivered · $${totalRevenue.toLocaleString('en-AU')} revenue`}
      />

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="p-6">
            <EmptyState
              icon={CheckCircle2}
              title="No delivered orders yet"
              description="Completed orders will appear here."
            />
          </CardContent>
        </Card>
      ) : (
        <DataTable
          columns={columns}
          data={filtered}
          searchKey="customerName"
          searchPlaceholder="Search delivered orders..."
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
        title="Cancel delivered order?"
        description={`Order ${cancelTarget?.orderNo} was delivered. Cancelling will restore stock.`}
        confirmLabel="Cancel Order"
        onConfirm={() => {
          if (cancelTarget) {
            cancel(cancelTarget.id, session?.user?.email ?? 'system');
            toast.success('Order cancelled · stock restored');
            setCancelTarget(null);
          }
        }}
      />
    </div>
  );
}