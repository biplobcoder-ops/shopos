// app/(dashboard)/products/units/page.tsx

'use client';

import { useMemo } from 'react';
import { GenericCatalogPage } from '@/components/catalog/generic-catalog-page';
import { useProductStore } from '@/lib/store/product-store';

export default function UnitsPage() {
  const { units, products, addUnit, updateUnit, removeUnit } = useProductStore();

  const usageCounts = useMemo(() => {
    const map: Record<string, number> = {};
    products.forEach((p) => {
      map[p.unit] = (map[p.unit] ?? 0) + 1;
    });
    return map;
  }, [products]);

  return (
    <GenericCatalogPage
      title="Units"
      description={`${units.length} units · measurement units for products`}
      itemLabel="Unit"
      items={units}
      showShortName
      usageCounts={usageCounts}
      onAdd={addUnit}
      onUpdate={updateUnit}
      onRemove={removeUnit}
    />
  );
}