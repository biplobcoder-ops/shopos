// lib/store/expense-store.ts

'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Expense, ExpenseCategory } from '@/lib/types';
import { demoExpenses, demoExpenseCategories } from '@/lib/demo-data';
import { uid } from '@/lib/utils';

interface ExpenseState {
  expenses: Expense[];
  categories: ExpenseCategory[];

  add: (input: {
    categoryId: string;
    amount: number;
    note?: string;
    date?: string;
    createdBy: string;
  }) => void;
  update: (id: string, data: Partial<Expense>) => void;
  remove: (id: string) => void;

  addCategory: (data: Omit<ExpenseCategory, 'id' | 'createdAt'>) => void;
  updateCategory: (id: string, data: Partial<ExpenseCategory>) => void;
  removeCategory: (id: string) => void;

  reset: () => void;
}

export const useExpenseStore = create<ExpenseState>()(
  persist(
    (set, get) => ({
      expenses: demoExpenses,
      categories: demoExpenseCategories,

      add: (input) => {
        const cat = get().categories.find((c) => c.id === input.categoryId);
        const expense: Expense = {
          id: uid('exp'),
          categoryId: input.categoryId,
          categoryName: cat?.name ?? 'Uncategorized',
          amount: input.amount,
          note: input.note,
          date: input.date || new Date().toISOString(),
          createdBy: input.createdBy,
        };
        set((s) => ({ expenses: [expense, ...s.expenses] }));
      },

      update: (id, data) => {
        set((s) => ({
          expenses: s.expenses.map((e) => (e.id === id ? { ...e, ...data } : e)),
        }));
      },

      remove: (id) => {
        set((s) => ({ expenses: s.expenses.filter((e) => e.id !== id) }));
      },

      addCategory: (data) => {
        const cat: ExpenseCategory = {
          ...data,
          id: uid('expcat'),
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

      reset: () =>
        set({ expenses: demoExpenses, categories: demoExpenseCategories }),
    }),
    {
      name: 'shopos-expenses',
      storage: createJSONStorage(() => localStorage),
      version: 1,
    }
  )
);