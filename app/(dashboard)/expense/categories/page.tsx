// app/(dashboard)/expense/categories/page.tsx

'use client';

import { useMemo } from 'react';
import { GenericCatalogPage } from '@/components/catalog/generic-catalog-page';
import { useExpenseStore } from '@/lib/store/expense-store';

export default function ExpenseCategoriesPage() {
  const {
    categories,
    expenses,
    addCategory,
    updateCategory,
    removeCategory,
  } = useExpenseStore();

  const usageCounts = useMemo(() => {
    const map: Record<string, number> = {};
    expenses.forEach((e) => {
      map[e.categoryName] = (map[e.categoryName] ?? 0) + 1;
    });
    return map;
  }, [expenses]);

  return (
    <GenericCatalogPage
      title="Expense Categories"
      description={`${categories.length} categories · used across expenses`}
      itemLabel="Category"
      items={categories}
      usageCounts={usageCounts}
      onAdd={addCategory}
      onUpdate={updateCategory}
      onRemove={removeCategory}
    />
  );
}