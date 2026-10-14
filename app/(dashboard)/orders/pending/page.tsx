// app/(dashboard)/orders/pending/page.tsx

'use client';

import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Clock } from 'lucide-react';
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

export default function PendingOrdersPage() {
  const { data: session } = useSession();
  const { orders, updateStatus, cancel } = useOrderStore();
  const [detail, setDetail] = useState<Order | null>(null);
  const [cancelTarget, setCancelTarget] = useState<Order | null>(null);

  const filtered = useMemo(
    () => orders.filter((o) => o.status === 'pending'),
    [orders]
  );

  const columns = useMemo(
    () =>
      makeOrderColumns({
        onView: setDetail,
        onStatusChange: (o, status) => {
          updateStatus(o.id, status, session?.user?.email ?? 'system');
          toast.success(`Order ${o.orderNo} → ${status}`);
        },
        onCancel: setCancelTarget,
      }),
    [updateStatus, session]
  );

  return (
    <div>
      <PageHeader
        title="Pending Orders"
        description={`${filtered.length} orders awaiting processing`}
      />
      {filtered.length === 0 ? (
        <Card>
          <CardContent className="p-6">
            <EmptyState
              icon={Clock}
              title="No pending orders"
              description="All caught up!"
            />
          </CardContent>
        </Card>
      ) : (
        <DataTable
          columns={columns}
          data={filtered}
          searchKey="customerName"
          searchPlaceholder="Search pending orders..."
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