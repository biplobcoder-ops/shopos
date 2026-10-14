// components/layout/user-card.tsx

'use client';

import { signOut, useSession } from 'next-auth/react';
import { LogOut } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { RoleBadge } from '@/components/auth/role-badge';
import { getInitials } from '@/lib/format';
import { cn } from '@/lib/utils';

interface Props {
  collapsed?: boolean;
}

export function UserCard({ collapsed }: Props) {
  const { data } = useSession();
  const user = data?.user;
  if (!user) return null;

  const name = user.name ?? 'User';
  const role = user.role;

  return (
    <div
      className={cn(
        'border-t border-border p-2',
        collapsed ? 'flex flex-col items-center gap-2' : ''
      )}
    >
      {collapsed ? (
        <Button
          variant="ghost"
          size="icon"
          title="Sign out"
          onClick={() => signOut({ callbackUrl: '/login' })}
        >
          <LogOut className="h-4 w-4" />
        </Button>
      ) : (
        <div className="flex items-center gap-3 rounded-lg p-2 hover:bg-accent">
          <Avatar className="h-9 w-9">
            <AvatarFallback className="bg-brand-600 text-white text-xs font-semibold">
              {getInitials(name)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-medium truncate">{name}</div>
            <div className="mt-0.5">
              <RoleBadge role={role} />
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            title="Sign out"
            onClick={() => signOut({ callbackUrl: '/login' })}
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}