// lib/mock-users.ts

import bcrypt from 'bcryptjs';
import type { User, Role } from './types';

/**
 * We don't pre-hash the password here because we want to make sure
 * the hash is always valid regardless of environment (Node.js version,
 * build machine, etc). This runs once at module load.
 *
 * For a demo this is fine — in production you would store pre-hashed
 * passwords in a database.
 */
const PLAIN_PASSWORD = '1234';
const PASSWORD_HASH = bcrypt.hashSync(PLAIN_PASSWORD, 10);

export const mockUsers: User[] = [
  {
    id: 'u-admin',
    name: 'Admin User',
    email: 'admin@shop.com',
    password: PASSWORD_HASH,
    role: 'admin' as Role,
    phone: '+61 400 000 001',
    active: true,
    createdAt: '2025-01-01T00:00:00.000Z',
  },
  {
    id: 'u-manager',
    name: 'Manager User',
    email: 'manager@shop.com',
    password: PASSWORD_HASH,
    role: 'manager' as Role,
    phone: '+61 400 000 002',
    active: true,
    createdAt: '2025-01-01T00:00:00.000Z',
  },
  {
    id: 'u-cashier',
    name: 'Cashier User',
    email: 'cashier@shop.com',
    password: PASSWORD_HASH,
    role: 'cashier' as Role,
    phone: '+61 400 000 003',
    active: true,
    createdAt: '2025-01-01T00:00:00.000Z',
  },
  {
    id: 'u-stock',
    name: 'Stock Manager',
    email: 'stock@shop.com',
    password: PASSWORD_HASH,
    role: 'stockman' as Role,
    phone: '+61 400 000 004',
    active: true,
    createdAt: '2025-01-01T00:00:00.000Z',
  },
];

export function findUserByEmail(email: string): User | undefined {
  return mockUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

/** Used by login form to auto-login demo users */
export const demoCredentials = [
  { role: 'admin' as Role, email: 'admin@shop.com', password: '1234', name: 'Admin User' },
  { role: 'manager' as Role, email: 'manager@shop.com', password: '1234', name: 'Manager User' },
  { role: 'cashier' as Role, email: 'cashier@shop.com', password: '1234', name: 'Cashier User' },
  { role: 'stockman' as Role, email: 'stock@shop.com', password: '1234', name: 'Stock Manager' },
];