// components/shared/status-badge.tsx

import { cn } from '@/lib/utils';

type Variant = 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'purple';

const variantClasses: Record<Variant, string> = {
  success: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  warning: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
  danger: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
  info: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
  purple: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
  neutral: 'bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/20',
};

interface Props {
  variant?: Variant;
  children: React.ReactNode;
  className?: string;
}

export function StatusBadge({ variant = 'neutral', children, className }: Props) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider',
        variantClasses[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

/** Map order/purchase/sale statuses to a variant */
export function statusVariant(status: string): Variant {
  switch (status) {
    case 'delivered':
    case 'completed':
    case 'received':
    case 'active':
      return 'success';
    case 'pending':
    case 'partial-return':
      return 'warning';
    case 'cancelled':
    case 'returned':
    case 'inactive':
      return 'danger';
    case 'processing':
      return 'info';
    case 'shipped':
      return 'purple';
    default:
      return 'neutral';
  }
}