// app/(auth)/admin/login/page.tsx

import { Suspense } from 'react';
import { LoginForm } from '@/components/auth/login-form';

export const metadata = { title: 'Staff Login — Southern Cross Tools' };

export default function AdminLoginPage() {
  return (
    <div className="relative min-h-screen w-full flex items-center justify-center px-4 py-8 sm:px-6 md:px-8 lg:px-10 bg-gradient-to-br from-zinc-50 via-white to-brand-50/30 dark:from-zinc-950 dark:via-zinc-950 dark:to-brand-950/20 overflow-hidden">
      {/* Background dot pattern */}
      <div
        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.04] text-brand-900 dark:text-brand-200 pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(currentColor 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />

      {/* Decorative gradient blobs */}
      <div className="absolute -top-40 -right-40 h-[26rem] w-[26rem] rounded-full bg-gradient-to-br from-brand-500/15 via-brand-500/10 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 h-[26rem] w-[26rem] rounded-full bg-gradient-to-tr from-brand-500/12 via-brand-500/8 to-transparent blur-3xl pointer-events-none" />

      {/* Subtle grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.015] dark:opacity-[0.025] pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      {/* Main content */}
      <div className="relative z-10 w-full max-w-[420px] sm:max-w-[440px] md:max-w-[460px] lg:max-w-[480px]">
        {/* Brand name only — no icon, no subtitle */}
        <div className="mb-6 sm:mb-8 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-700 dark:from-white dark:via-zinc-100 dark:to-zinc-300 bg-clip-text text-transparent">
            Southern Cross Tools
          </h1>
        </div>

        {/* Login card */}
        <div className="relative rounded-2xl sm:rounded-3xl border border-border/60 bg-white dark:bg-zinc-900 shadow-2xl shadow-brand-500/[0.08] dark:shadow-brand-500/[0.12] overflow-hidden">
          {/* Gradient top accent bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-500 via-brand-500 to-brand-500" />

          {/* Card body */}
          <div className="p-6 sm:p-7 md:p-8 lg:p-10">
            <Suspense fallback={null}>
              <LoginForm />
            </Suspense>
          </div>

          {/* Bottom subtle gradient */}
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand-500/30 to-transparent" />
        </div>
      </div>
    </div>
  );
}