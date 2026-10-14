// components/auth/role-badge.tsx

import { ROLE_COLORS, ROLE_LABELS } from '@/lib/constants';
import type { Role } from '@/lib/types';
import { cn } from '@/lib/utils';

interface Props {
  role: Role;
  className?: string;
}

export function RoleBadge({ role, className }: Props) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider',
        ROLE_COLORS[role] ?? 'bg-zinc-500 text-white',
        className
      )}
    >
      {ROLE_LABELS[role] ?? role}
    </span>
  );
}