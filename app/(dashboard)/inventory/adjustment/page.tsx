// app/(dashboard)/inventory/adjustment/page.tsx

import { StockForm } from '@/components/inventory/stock-form';
import { PageHeader } from '@/components/shared/page-header';

export const metadata = { title: 'Adjustment — Southern Cross Tools' };

export default function AdjustmentPage() {
  return (
    <div>
      <PageHeader
        title="Stock Adjustment"
        description="Correct stock levels to match a physical count. Reason is required."
      />
      <StockForm mode="adjustment" />
    </div>
  );
}