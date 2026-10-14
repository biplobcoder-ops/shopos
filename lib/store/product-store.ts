// lib/store/product-store.ts

'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Product, Category, Brand, Unit } from '@/lib/types';
import {
  demoProducts,
  demoCategories,
  demoBrands,
  demoUnits,
} from '@/lib/demo-data';
import { uid } from '@/lib/utils';

interface ProductState {
  products: Product[];
  categories: Category[];
  brands: Brand[];
  units: Unit[];
  // products
  addProduct: (data: Omit<Product, 'id' | 'createdAt'>) => Product;
  updateProduct: (id: string, data: Partial<Product>) => void;
  removeProduct: (id: string) => void;
  bulkRemove: (ids: string[]) => void;
  /** Increment / decrement stock directly (used by sale/purchase/order flows) */
  adjustStock: (id: string, delta: number) => void;
  // categories
  addCategory: (data: Omit<Category, 'id' | 'createdAt'>) => void;
  updateCategory: (id: string, data: Partial<Category>) => void;
  removeCategory: (id: string) => void;
  // brands
  addBrand: (data: Omit<Brand, 'id' | 'createdAt'>) => void;
  updateBrand: (id: string, data: Partial<Brand>) => void;
  removeBrand: (id: string) => void;
  // units
  addUnit: (data: Omit<Unit, 'id' | 'createdAt'>) => void;
  updateUnit: (id: string, data: Partial<Unit>) => void;
  removeUnit: (id: string) => void;
  reset: () => void;
}

export const useProductStore = create<ProductState>()(
  persist(
    (set, get) => ({
      products: demoProducts,
      categories: demoCategories,
      brands: demoBrands,
      units: demoUnits,

      addProduct: (data) => {
        const prod: Product = {
          ...data,
          id: uid('prod'),
          createdAt: new Date().toISOString(),
        };
        set((s) => ({ products: [prod, ...s.products] }));
        return prod;
      },

      updateProduct: (id, data) => {
        set((s) => ({
          products: s.products.map((p) => (p.id === id ? { ...p, ...data } : p)),
        }));
      },

      removeProduct: (id) => {
        set((s) => ({ products: s.products.filter((p) => p.id !== id) }));
      },

      bulkRemove: (ids) => {
        const setIds = new Set(ids);
        set((s) => ({ products: s.products.filter((p) => !setIds.has(p.id)) }));
      },

      adjustStock: (id, delta) => {
        set((s) => ({
          products: s.products.map((p) =>
            p.id === id ? { ...p, stock: Math.max(0, p.stock + delta) } : p
          ),
        }));
      },

      addCategory: (data) => {
        const cat: Category = {
          ...data,
          id: uid('cat'),
          createdAt: new Date().toISOString(),
        };
        set((s) => ({ categories: [...s.categories, cat] }));
      },

      updateCategory: (id, data) => {
        set((s) => ({
          categories: s.categories.map((c) => (c.id === id ? { ...c, ...data } : c)),
        }));
      },

      removeCategory: (id) => {
        set((s) => ({ categories: s.categories.filter((c) => c.id !== id) }));
      },

      addBrand: (data) => {
        const b: Brand = {
          ...data,
          id: uid('brand'),
          createdAt: new Date().toISOString(),
        };
        set((s) => ({ brands: [...s.brands, b] }));
      },

      updateBrand: (id, data) => {
        set((s) => ({
          brands: s.brands.map((b) => (b.id === id ? { ...b, ...data } : b)),
        }));
      },

      removeBrand: (id) => {
        set((s) => ({ brands: s.brands.filter((b) => b.id !== id) }));
      },

      addUnit: (data) => {
        const u: Unit = {
          ...data,
          id: uid('unit'),
          createdAt: new Date().toISOString(),
        };
        set((s) => ({ units: [...s.units, u] }));
      },

      updateUnit: (id, data) => {
        set((s) => ({
          units: s.units.map((u) => (u.id === id ? { ...u, ...data } : u)),
        }));
      },

      removeUnit: (id) => {
        set((s) => ({ units: s.units.filter((u) => u.id !== id) }));
      },

      reset: () =>
        set({
          products: demoProducts,
          categories: demoCategories,
          brands: demoBrands,
          units: demoUnits,
        }),
    }),
    {
      name: 'shopos-products',
      storage: createJSONStorage(() => localStorage),
      version: 1,
    }
  )
);