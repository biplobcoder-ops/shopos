// components/auth/permission-gate.tsx

'use client';

import { useSession } from 'next-auth/react';
import type { Permission, Role } from '@/lib/types';
import { can, canAny, canAll } from '@/lib/permissions';

interface CanProps {
  perm?: Permission;
  anyOf?: Permission[];
  allOf?: Permission[];
  role?: Role;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export function Can({
  perm,
  anyOf,
  allOf,
  role: forceRole,
  fallback = null,
  children,
}: CanProps) {
  const { data: session, status } = useSession();
  if (status === 'loading') return null;

  const role = forceRole ?? (session?.user?.role as Role | undefined);
  if (!role) return <>{fallback}</>;

  let allowed = false;
  if (perm) allowed = can(role, perm);
  else if (anyOf) allowed = canAny(role, anyOf);
  else if (allOf) allowed = canAll(role, allOf);
  else allowed = true;

  return allowed ? <>{children}</> : <>{fallback}</>;
}