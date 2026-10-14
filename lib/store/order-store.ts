// lib/store/order-store.ts

'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Order, OrderItem, OrderStatus, PaymentMethod } from '@/lib/types';
import { demoOrders } from '@/lib/demo-data';
import { uid } from '@/lib/utils';
import { useStockStore } from './stock-store';

interface OrderState {
  orders: Order[];

  /** Place an order from the public website */
  placeOrder: (input: {
    customerName: string;
    customerPhone: string;
    customerEmail?: string;
    items: OrderItem[];
    subtotal: number;
    delivery: number;
    total: number;
    deliveryAddress: string;
    paymentMethod: PaymentMethod;
    notes?: string;
  }) => Order;

  /** Change status. Only 'delivered' deducts stock. Cancel restores stock. */
  updateStatus: (id: string, status: OrderStatus, user?: string) => void;

  cancel: (id: string, user?: string) => void;

  reset: () => void;
}

function nextOrderNo(orders: Order[]): string {
  const nums = orders
    .map((o) => parseInt(o.orderNo.replace(/\D/g, ''), 10))
    .filter((n) => !isNaN(n));
  const max = nums.length ? Math.max(...nums) : 1000;
  return `ORD-${max + 1}`;
}

export const useOrderStore = create<OrderState>()(
  persist(
    (set, get) => ({
      orders: demoOrders,

      placeOrder: (input) => {
        const order: Order = {
          id: uid('order'),
          orderNo: nextOrderNo(get().orders),
          customerName: input.customerName,
          customerPhone: input.customerPhone,
          customerEmail: input.customerEmail,
          items: input.items,
          subtotal: input.subtotal,
          delivery: input.delivery,
          total: input.total,
          status: 'pending',
          deliveryAddress: input.deliveryAddress,
          paymentMethod: input.paymentMethod,
          date: new Date().toISOString(),
          notes: input.notes,
        };
        set((s) => ({ orders: [order, ...s.orders] }));
        return order;
      },

      updateStatus: (id, status, user) => {
        const order = get().orders.find((o) => o.id === id);
        if (!order) return;

        // Stock impact only on transition to delivered (and only once)
        if (status === 'delivered' && order.status !== 'delivered') {
          useStockStore.getState().bulkRecord(
            order.items.map((it) => ({
              productId: it.productId,
              type: 'order-confirm' as const,
              qty: -it.qty,
              reference: order.orderNo,
            })),
            user || 'system'
          );
        }

        set((s) => ({
          orders: s.orders.map((o) => (o.id === id ? { ...o, status } : o)),
        }));
      },

      cancel: (id, user) => {
        const order = get().orders.find((o) => o.id === id);
        if (!order || order.status === 'cancelled') return;

        // If already delivered, restore stock
        if (order.status === 'delivered') {
          useStockStore.getState().bulkRecord(
            order.items.map((it) => ({
              productId: it.productId,
              type: 'order-cancel' as const,
              qty: it.qty,
              reference: order.orderNo,
            })),
            user || 'system'
          );
        }

        set((s) => ({
          orders: s.orders.map((o) => (o.id === id ? { ...o, status: 'cancelled' } : o)),
        }));
      },

      reset: () => set({ orders: demoOrders }),
    }),
    {
      name: 'shopos-orders',
      storage: createJSONStorage(() => localStorage),
      version: 1,
    }
  )
);