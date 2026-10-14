// lib/store/user-store.ts

'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import bcrypt from 'bcryptjs';
import type { User, Role } from '@/lib/types';
import { mockUsers } from '@/lib/mock-users';
import { uid } from '@/lib/utils';

interface UserState {
  users: User[];
  add: (data: {
    name: string;
    email: string;
    password: string;
    role: Role;
    phone?: string;
    active?: boolean;
  }) => User | null;
  update: (id: string, data: Partial<User> & { password?: string }) => void;
  remove: (id: string) => void;
  toggleActive: (id: string) => void;
  reset: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      users: mockUsers,

      add: (data) => {
        const email = data.email.trim().toLowerCase();
        if (get().users.some((u) => u.email === email)) return null;

        const hash = bcrypt.hashSync(data.password || '1234', 10);

        const user: User = {
          id: uid('u'),
          name: data.name,
          email,
          password: hash,
          role: data.role,
          phone: data.phone,
          active: data.active ?? true,
          createdAt: new Date().toISOString(),
        };
        set((s) => ({ users: [...s.users, user] }));
        return user;
      },

      update: (id, data) => {
        set((s) => ({
          users: s.users.map((u) => {
            if (u.id !== id) return u;
            const next: User = { ...u, ...data };
            if (data.password) {
              next.password = bcrypt.hashSync(data.password, 10);
            }
            if (data.email) next.email = data.email.trim().toLowerCase();
            return next;
          }),
        }));
      },

      remove: (id) => {
        set((s) => ({ users: s.users.filter((u) => u.id !== id) }));
      },

      toggleActive: (id) => {
        set((s) => ({
          users: s.users.map((u) =>
            u.id === id ? { ...u, active: !u.active } : u
          ),
        }));
      },

      reset: () => set({ users: mockUsers }),
    }),
    {
      name: 'shopos-users',
      storage: createJSONStorage(() => localStorage),
      version: 1,
    }
  )
);