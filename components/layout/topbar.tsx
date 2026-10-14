// components/layout/topbar.tsx

'use client';

import { Menu, Search, Bell, LogOut, User as UserIcon } from 'lucide-react';
import Link from 'next/link';
import { signOut, useSession } from 'next-auth/react';
import { useSidebar } from '@/lib/hooks/use-sidebar';
import { useBadges } from '@/lib/hooks/use-badges';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { RoleBadge } from '@/components/auth/role-badge';
import { ThemeToggle } from './theme-toggle';
import { getInitials } from '@/lib/format';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';

export function Topbar() {
  const { setMobileOpen } = useSidebar();
  const { data } = useSession();
  const badges = useBadges();
  const user = data?.user;
  const name = user?.name ?? 'User';

  const totalBadge =
    badges.ordersPending + badges.lowStock + badges.customerDue + badges.supplierDue;

  return (
    <header className="sticky top-0 z-30 h-14 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="flex h-full items-center gap-2 px-3 md:px-6">
        {/* Mobile menu */}
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Search */}
        <div className="relative flex-1 max-w-md hidden md:block">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products, invoices, customers..."
            className="pl-9 h-9 bg-muted/40 border-transparent focus-visible:bg-background"
          />
        </div>

        {/* Mobile logo */}
        <Link href="/dashboard" className="md:hidden flex items-center gap-2">
          <div className="h-7 w-7 rounded-md bg-brand-600 text-white flex items-center justify-center text-xs font-bold">
            S
          </div>
          <span className="font-semibold text-sm">Southern Cross Tools</span>
        </Link>

        <div className="ml-auto flex items-center gap-1">
          <Button variant="ghost" size="icon" className="md:hidden" aria-label="Search">
            <Search className="h-4 w-4" />
          </Button>

          <ThemeToggle />

          <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
            <Bell className="h-4 w-4" />
            {totalBadge > 0 && (
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500" />
            )}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="ml-1 rounded-full outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-brand-600 text-white text-xs font-semibold">
                    {getInitials(name)}
                  </AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="flex flex-col gap-1">
                <span className="text-sm font-semibold truncate">{name}</span>
                <span className="text-[11px] text-muted-foreground truncate">
                  {user?.email}
                </span>
                {user?.role && (
                  <Badge variant="secondary" className="w-fit mt-1 text-[10px]">
                    <RoleBadge role={user.role} />
                  </Badge>
                )}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/dashboard" className="cursor-pointer">
                  <UserIcon className="mr-2 h-4 w-4" />
                  Dashboard
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer text-red-600 focus:text-red-600"
                onClick={() => signOut({ callbackUrl: '/login' })}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}