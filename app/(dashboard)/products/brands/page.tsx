// app/(dashboard)/products/brands/page.tsx

'use client';

import { useMemo } from 'react';
import { GenericCatalogPage } from '@/components/catalog/generic-catalog-page';
import { useProductStore } from '@/lib/store/product-store';

export default function BrandsPage() {
  const { brands, products, addBrand, updateBrand, removeBrand } = useProductStore();

  const usageCounts = useMemo(() => {
    const map: Record<string, number> = {};
    products.forEach((p) => {
      map[p.brand] = (map[p.brand] ?? 0) + 1;
    });
    return map;
  }, [products]);

  return (
    <GenericCatalogPage
      title="Brands"
      description={`${brands.length} brands · used across products`}
      itemLabel="Brand"
      items={brands}
      usageCounts={usageCounts}
      onAdd={addBrand}
      onUpdate={updateBrand}
      onRemove={removeBrand}
    />
  );
}