// lib/permissions.ts

import type { Permission, Role } from './types';

const ROLE_PERMISSIONS: Record<Role, Permission[] | ['*']> = {
  admin: ['*'],
  manager: [
    'dashboard',
    'pos',
    'sales',
    'purchase',
    'orders',
    'products',
    'products:view',
    'products:edit',
    'inventory',
    'barcode',
    'customers',
    'suppliers',
    'reports',
    'expense',
  ],
  cashier: ['dashboard', 'pos', 'sales', 'sales:own', 'customers'],
  stockman: [
    'dashboard',
    'purchase',
    'products',
    'products:view',
    'products:edit',
    'inventory',
    'barcode',
    'suppliers',
  ],
};

/** Check if a role has a permission */
export function can(role: Role | undefined | null, permission: Permission): boolean {
  if (!role) return false;
  const perms = ROLE_PERMISSIONS[role];
  if (!perms) return false;

  // Admin has wildcard access
  if (perms.length === 1 && perms[0] === '*') return true;

  return (perms as Permission[]).includes(permission);
}

/** Check any of multiple permissions */
export function canAny(role: Role | undefined | null, permissions: Permission[]): boolean {
  return permissions.some((p) => can(role, p));
}

/** Check all permissions */
export function canAll(role: Role | undefined | null, permissions: Permission[]): boolean {
  return permissions.every((p) => can(role, p));
}

/** Get all permissions for a role */
export function getPermissions(role: Role): Permission[] | ['*'] {
  return ROLE_PERMISSIONS[role] ?? [];
}

/** Route → required permission mapping */
export const ROUTE_PERMISSIONS: Record<string, Permission> = {
  '/dashboard': 'dashboard',
  '/pos': 'pos',
  '/sales': 'sales',
  '/purchase': 'purchase',
  '/orders': 'orders',
  '/products': 'products',
  '/inventory': 'inventory',
  '/barcode': 'barcode',
  '/customers': 'customers',
  '/suppliers': 'suppliers',
  '/reports': 'reports',
  '/expense': 'expense',
  '/users': 'users',
  '/settings': 'settings',
};

/** Get required permission for a pathname */
export function getRoutePermission(pathname: string): Permission | null {
  for (const route of Object.keys(ROUTE_PERMISSIONS)) {
    if (pathname === route || pathname.startsWith(route + '/')) {
      return ROUTE_PERMISSIONS[route];
    }
  }
  return null;
}