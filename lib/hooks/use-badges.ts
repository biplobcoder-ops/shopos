// lib/hooks/use-badges.ts

'use client';

import { useMemo } from 'react';
import { useOrderStore } from '@/lib/store/order-store';
import { useProductStore } from '@/lib/store/product-store';
import { useCustomerStore } from '@/lib/store/customer-store';
import { useSupplierStore } from '@/lib/store/supplier-store';

export function useBadges() {
  const orders = useOrderStore((s) => s.orders);
  const products = useProductStore((s) => s.products);
  const customers = useCustomerStore((s) => s.customers);
  const suppliers = useSupplierStore((s) => s.suppliers);

  return useMemo(() => {
    const ordersPending = orders.filter((o) => o.status === 'pending').length;
    const lowStock = products.filter((p) => p.stock > 0 && p.stock <= p.minStock).length;
    const customerDue = customers.filter((c) => c.due > 0).length;
    const supplierDue = suppliers.filter((s) => s.due > 0).length;
    return { ordersPending, lowStock, customerDue, supplierDue };
  }, [orders, products, customers, suppliers]);
}