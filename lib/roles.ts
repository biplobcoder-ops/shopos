// lib/roles.ts

import type { Role } from './types';

export const ALL_ROLES: Role[] = ['admin', 'manager', 'cashier', 'stockman'];

export const ROLE_DESCRIPTIONS: Record<Role, string> = {
  admin: 'Full system access including users and settings',
  manager: 'Manage operations, catalog, partners and reports',
  cashier: 'Point of sale, own sales and customers',
  stockman: 'Purchase, products, inventory and suppliers',
};

export const ROLE_MENUS: Record<Role, string[]> = {
  admin: [
    'dashboard',
    'pos',
    'sales',
    'purchase',
    'orders',
    'products',
    'inventory',
    'barcode',
    'customers',
    'suppliers',
    'reports',
    'expense',
    'users',
    'settings',
  ],
  manager: [
    'dashboard',
    'pos',
    'sales',
    'purchase',
    'orders',
    'products',
    'inventory',
    'barcode',
    'customers',
    'suppliers',
    'reports',
    'expense',
  ],
  cashier: ['dashboard', 'pos', 'sales', 'customers'],
  stockman: ['dashboard', 'purchase', 'products', 'inventory', 'barcode', 'suppliers'],
};