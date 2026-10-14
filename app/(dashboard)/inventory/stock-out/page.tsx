// app/(dashboard)/inventory/stock-out/page.tsx

import { StockForm } from '@/components/inventory/stock-form';
import { PageHeader } from '@/components/shared/page-header';

export const metadata = { title: 'Stock Out — Southern Cross Tools' };

export default function StockOutPage() {
  return (
    <div>
      <PageHeader
        title="Stock Out"
        description="Record outgoing stock (damage, wastage, transfer)."
      />
      <StockForm mode="stock-out" />
    </div>
  );
}