// lib/store/reset-all.ts

'use client';

import { useProductStore } from './product-store';
import { useCustomerStore } from './customer-store';
import { useSupplierStore } from './supplier-store';
import { useStockStore } from './stock-store';
import { useSaleStore } from './sale-store';
import { usePurchaseStore } from './purchase-store';
import { useOrderStore } from './order-store';
import { useExpenseStore } from './expense-store';
import { useCartStore } from './cart-store';
import { useSettingsStore } from './settings-store';
import { useUserStore } from './user-store';

/**
 * Reset ALL persisted stores back to demo data.
 * Used on the Backup/Restore settings page.
 */
export function resetAllStores() {
  useProductStore.getState().reset();
  useCustomerStore.getState().reset();
  useSupplierStore.getState().reset();
  useStockStore.getState().reset();
  useSaleStore.getState().reset();
  usePurchaseStore.getState().reset();
  useOrderStore.getState().reset();
  useExpenseStore.getState().reset();
  useCartStore.getState().clear();
  useSettingsStore.getState().reset();
  useUserStore.getState().reset();
}