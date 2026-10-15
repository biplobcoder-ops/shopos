// lib/store/customer-auth-store.ts
// Simple localStorage-based customer auth (demo / no backend)
// Login / Register / Logout কাজ করবে without server

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CustomerUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  postcode?: string;
  createdAt: string;
}

interface CustomerAuthState {
  user: CustomerUser | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  register: (data: {
    name: string;
    email: string;
    phone?: string;
    password: string;
  }) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
  updateProfile: (data: Partial<CustomerUser>) => void;
}

export const useCustomerAuth = create<CustomerAuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,

      login: async (email, password) => {
        // Demo: any email + password >= 4 chars will work
        // Check if user exists in localStorage (registered users)
        const registered = getRegisteredUsers();
        const existing = registered.find(
          (u) => u.email.toLowerCase() === email.toLowerCase()
        );

        // If user registered, check password
        if (existing) {
          const stored = getPasswordFor(email);
          if (stored && stored !== password) {
            return { ok: false, error: 'Incorrect password' };
          }
          const { password: _, ...userWithoutPassword } = existing;
          set({ user: userWithoutPassword, isAuthenticated: true });
          return { ok: true };
        }

        // If not registered, allow demo login with any password >= 4 chars
        if (password.length < 4) {
          return { ok: false, error: 'Password must be at least 4 characters' };
        }

        const demoUser: CustomerUser = {
          id: `cust-${Date.now()}`,
          name: email.split('@')[0].replace(/[._]/g, ' ') || 'Customer',
          email,
          createdAt: new Date().toISOString(),
        };
        set({ user: demoUser, isAuthenticated: true });
        return { ok: true };
      },

      register: async ({ name, email, phone, password }) => {
        if (!name.trim() || name.trim().length < 2) {
          return { ok: false, error: 'Please enter your full name' };
        }
        if (!email.includes('@')) {
          return { ok: false, error: 'Please enter a valid email' };
        }
        if (password.length < 4) {
          return { ok: false, error: 'Password must be at least 4 characters' };
        }

        const registered = getRegisteredUsers();
        if (registered.find((u) => u.email.toLowerCase() === email.toLowerCase())) {
          return { ok: false, error: 'An account with this email already exists' };
        }

        const newUser: CustomerUser = {
          id: `cust-${Date.now()}`,
          name: name.trim(),
          email: email.toLowerCase().trim(),
          phone: phone?.trim(),
          createdAt: new Date().toISOString(),
        };

        // Save registered users + password
        saveRegisteredUser(newUser);
        savePasswordFor(email, password);

        set({ user: newUser, isAuthenticated: true });
        return { ok: true };
      },

      logout: () => set({ user: null, isAuthenticated: false }),

      updateProfile: (data) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...data } : null,
        })),
    }),
    {
      name: 'customer-auth', // localStorage key
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

/* ============================================
   Helpers — registered users + passwords
   ============================================ */

interface StoredUser extends CustomerUser {
  password?: string;
}

const REGISTERED_KEY = 'customer-registered-users';
const PASSWORDS_KEY = 'customer-passwords';

function getRegisteredUsers(): StoredUser[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(REGISTERED_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveRegisteredUser(user: CustomerUser) {
  if (typeof window === 'undefined') return;
  const users = getRegisteredUsers();
  users.push(user);
  localStorage.setItem(REGISTERED_KEY, JSON.stringify(users));
}

function getPasswordFor(email: string): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(PASSWORDS_KEY);
    const map = raw ? JSON.parse(raw) : {};
    return map[email.toLowerCase()] ?? null;
  } catch {
    return null;
  }
}

function savePasswordFor(email: string, password: string) {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(PASSWORDS_KEY);
    const map = raw ? JSON.parse(raw) : {};
    map[email.toLowerCase()] = password;
    localStorage.setItem(PASSWORDS_KEY, JSON.stringify(map));
  } catch {
    // ignore
  }
}
