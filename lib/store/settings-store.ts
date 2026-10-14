// lib/store/settings-store.ts

'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { BusinessInfo, TaxInfo, ReceiptInfo } from '@/lib/types';

interface SettingsState {
  businessInfo: BusinessInfo;
  taxInfo: TaxInfo;
  receiptInfo: ReceiptInfo;

  updateBusiness: (data: Partial<BusinessInfo>) => void;
  updateTax: (data: Partial<TaxInfo>) => void;
  updateReceipt: (data: Partial<ReceiptInfo>) => void;

  exportAll: () => string;
  importAll: (json: string) => { ok: boolean; error?: string };
  reset: () => void;
}

const DEFAULT_BUSINESS: BusinessInfo = {
  name: 'Southern Cross Tools Pty Ltd',
  address: '123 George Street, Sydney NSW 2000, Australia',
  phone: '+61 2 9876 5432',
  email: 'hello@southerncrosstools.example.com.au',
  vatNumber: 'ABN 12 345 678 901',
};

const DEFAULT_TAX: TaxInfo = {
  enabled: true,
  rate: 10,
  inclusive: true,
  vatNumber: 'GST 10%',
};

const DEFAULT_RECEIPT: ReceiptInfo = {
  headerText: 'Thank you for shopping with us!',
  footerText: 'All prices include GST. Returns accepted within 30 days.',
  showLogo: true,
  showVat: true,
  showCashier: true,
};

const STORE_KEYS = [
  'shopos-products',
  'shopos-customers',
  'shopos-suppliers',
  'shopos-stock',
  'shopos-sales',
  'shopos-purchases',
  'shopos-orders',
  'shopos-expenses',
  'shopos-cart',
  'shopos-settings',
];

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      businessInfo: DEFAULT_BUSINESS,
      taxInfo: DEFAULT_TAX,
      receiptInfo: DEFAULT_RECEIPT,

      updateBusiness: (data) =>
        set((s) => ({ businessInfo: { ...s.businessInfo, ...data } })),

      updateTax: (data) =>
        set((s) => ({ taxInfo: { ...s.taxInfo, ...data } })),

      updateReceipt: (data) =>
        set((s) => ({ receiptInfo: { ...s.receiptInfo, ...data } })),

      exportAll: () => {
        if (typeof window === 'undefined') return '{}';
        const snapshot: Record<string, any> = {
          __meta: { exportedAt: new Date().toISOString(), app: 'Southern Cross Tools' },
        };
        STORE_KEYS.forEach((key) => {
          const raw = localStorage.getItem(key);
          if (raw) snapshot[key] = JSON.parse(raw);
        });
        return JSON.stringify(snapshot, null, 2);
      },

      importAll: (json) => {
        if (typeof window === 'undefined') return { ok: false, error: 'SSR' };
        try {
          const data = JSON.parse(json);
          if (!data || typeof data !== 'object')
            return { ok: false, error: 'Invalid JSON' };
          STORE_KEYS.forEach((key) => {
            if (data[key]) localStorage.setItem(key, JSON.stringify(data[key]));
          });
          return { ok: true };
        } catch (e: any) {
          return { ok: false, error: e?.message || 'Parse error' };
        }
      },

      reset: () =>
        set({
          businessInfo: DEFAULT_BUSINESS,
          taxInfo: DEFAULT_TAX,
          receiptInfo: DEFAULT_RECEIPT,
        }),
    }),
    {
      name: 'shopos-settings',
      storage: createJSONStorage(() => localStorage),
      version: 1,
    }
  )
);