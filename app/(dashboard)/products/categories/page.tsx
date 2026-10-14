// app/(dashboard)/products/categories/page.tsx

'use client';

import { useMemo } from 'react';
import { GenericCatalogPage } from '@/components/catalog/generic-catalog-page';
import { useProductStore } from '@/lib/store/product-store';

export default function CategoriesPage() {
  const { categories, products, addCategory, updateCategory, removeCategory } =
    useProductStore();

  const usageCounts = useMemo(() => {
    const map: Record<string, number> = {};
    products.forEach((p) => {
      map[p.category] = (map[p.category] ?? 0) + 1;
    });
    return map;
  }, [products]);

  return (
    <GenericCatalogPage
      title="Categories"
      description={`${categories.length} categories · used across products`}
      itemLabel="Category"
      items={categories}
      usageCounts={usageCounts}
      onAdd={addCategory}
      onUpdate={updateCategory}
      onRemove={removeCategory}
    />
  );
}