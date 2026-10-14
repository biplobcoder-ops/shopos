// components/auth/login-form.tsx

'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { Eye, EyeOff, Loader2, Mail, Lock, ArrowRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { demoCredentials } from '@/lib/mock-users';
import type { Role } from '@/lib/types';
import { cn } from '@/lib/utils';

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

type FormValues = z.infer<typeof schema>;

interface RoleConfig {
  label: string;
  gradient: string;
}

const ROLE_CONFIG: Record<Role, RoleConfig> = {
  admin: {
    label: 'Admin',
    gradient: 'from-purple-500 to-brand-600',
  },
  manager: {
    label: 'Manager',
    gradient: 'from-blue-500 to-brand-600',
  },
  cashier: {
    label: 'Cashier',
    gradient: 'from-amber-500 to-orange-600',
  },
  stockman: {
    label: 'Stockman',
    gradient: 'from-emerald-500 to-teal-600',
  },
};

export function LoginForm() {
  const router = useRouter();
  const search = useSearchParams();
  const from = search.get('from') || '/dashboard';

  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (values: FormValues) => {
    setSubmitting(true);
    try {
      const res = await signIn('credentials', {
        email: values.email.trim().toLowerCase(),
        password: values.password,
        redirect: false,
      });

      if (!res || res.error) {
        toast.error('Invalid email or password');
        setSubmitting(false);
        return;
      }

      toast.success('Welcome back');
      router.push(from);
      router.refresh();
    } catch {
      toast.error('Something went wrong');
      setSubmitting(false);
    }
  };

  const fillDemo = (email: string, password: string) => {
    setValue('email', email);
    setValue('password', password);
    toast.info('Demo credentials filled', { duration: 1500 });
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-6 sm:mb-7">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
          Welcome back
        </h2>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
          Sign in to access your staff dashboard
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Email field */}
        <div className="space-y-2">
          <Label
            htmlFor="email"
            className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground"
          >
            Email
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              id="email"
              type="email"
              placeholder="you@shop.com"
              autoComplete="email"
              autoFocus
              className="pl-10 h-11"
              {...register('email')}
            />
          </div>
          {errors.email && (
            <p className="text-xs text-red-500">{errors.email.message}</p>
          )}
        </div>

        {/* Password field */}
        <div className="space-y-2">
          <Label
            htmlFor="password"
            className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground"
          >
            Password
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              autoComplete="current-password"
              className="pl-10 pr-10 h-11"
              {...register('password')}
            />
            <button
              type="button"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              onClick={() => setShowPassword((s) => !s)}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-muted-foreground hover:bg-accent transition-colors"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs text-red-500">{errors.password.message}</p>
          )}
        </div>

        {/* Submit button */}
        <Button
          type="submit"
          disabled={submitting}
          className="w-full h-11 text-sm font-semibold shadow-lg shadow-brand-500/20 hover:shadow-brand-500/30 transition-shadow"
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Signing in...
            </>
          ) : (
            <>
              Sign in
              <ArrowRight className="h-4 w-4 ml-2" />
            </>
          )}
        </Button>
      </form>

      {/* Divider */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border/60" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-white dark:bg-zinc-900 px-3 text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
            Or quick access
          </span>
        </div>
      </div>

      {/* Demo role cards */}
      <div className="grid grid-cols-2 gap-2.5">
        {demoCredentials.map((d) => {
          const config = ROLE_CONFIG[d.role];
          return (
            <button
              type="button"
              key={d.role}
              onClick={() => fillDemo(d.email, d.password)}
              className={cn(
                'group relative flex flex-col items-start gap-1 rounded-xl border border-border bg-white dark:bg-zinc-900 p-3',
                'hover:border-border/80 hover:shadow-md transition-all duration-200',
                'focus:outline-none focus:ring-2 focus:ring-brand-500/30',
                'text-left min-h-[68px] overflow-hidden'
              )}
            >
              {/* Left color accent bar */}
              <div
                className={cn(
                  'absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b',
                  config.gradient
                )}
              />

              {/* Role icon + name */}
              <div className="flex items-center gap-2 w-full">
                <div
                  className={cn(
                    'h-6 w-6 shrink-0 rounded-md bg-gradient-to-br flex items-center justify-center text-white text-[10px] font-bold shadow-sm',
                    config.gradient
                  )}
                >
                  {config.label[0]}
                </div>
                <span className="text-xs font-semibold leading-tight">
                  {config.label}
                </span>
              </div>

              {/* Email preview */}
              <span className="text-[10px] text-muted-foreground truncate w-full leading-tight">
                {d.email}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}