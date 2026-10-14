// app/(dashboard)/inventory/stock-in/page.tsx

import { StockForm } from '@/components/inventory/stock-form';
import { PageHeader } from '@/components/shared/page-header';

export const metadata = { title: 'Stock In — Southern Cross Tools' };

export default function StockInPage() {
  return (
    <div>
      <PageHeader
        title="Stock In"
        description="Record incoming stock for any product."
      />
      <StockForm mode="stock-in" />
    </div>
  );
}