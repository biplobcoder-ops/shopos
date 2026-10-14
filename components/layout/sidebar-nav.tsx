// components/layout/sidebar-nav.tsx

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { NAV_SECTIONS, type NavChild } from '@/lib/nav-config';
import { can } from '@/lib/permissions';
import { useBadges } from '@/lib/hooks/use-badges';
import { cn } from '@/lib/utils';
import type { Role } from '@/lib/types';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface Props {
  role: Role;
  collapsed: boolean;
  onNavigate?: () => void;
}

function isActive(pathname: string, href: string): boolean {
  if (href === '/dashboard') return pathname === '/dashboard';
  return pathname === href || pathname.startsWith(href + '/');
}

function hasActiveChild(pathname: string, children: NavChild[]): boolean {
  return children.some((c) => pathname === c.href);
}

export function SidebarNav({ role, collapsed, onNavigate }: Props) {
  const pathname = usePathname();
  const badges = useBadges();
  const [openKeys, setOpenKeys] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const next: Record<string, boolean> = { ...openKeys };
    NAV_SECTIONS.forEach((section) =>
      section.items.forEach((item) => {
        if (item.children && hasActiveChild(pathname, item.children)) {
          next[item.title] = true;
        }
      })
    );
    setOpenKeys(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const toggleKey = (key: string) =>
    setOpenKeys((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <TooltipProvider delayDuration={200}>
      <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-4">
        {NAV_SECTIONS.map((section) => {
          const visible = section.items.filter((it) => can(role, it.permission));
          if (!visible.length) return null;

          return (
            <div key={section.label}>
              {!collapsed && (
                <div className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                  {section.label}
                </div>
              )}
              <ul className="space-y-0.5">
                {visible.map((item) => {
                  const active =
                    isActive(pathname, item.href) ||
                    (item.children ? hasActiveChild(pathname, item.children) : false);
                  const badge =
                    item.badgeKey && badges[item.badgeKey] > 0
                      ? badges[item.badgeKey]
                      : null;
                  const expanded = !!openKeys[item.title];
                  const hasKids = !!item.children?.length;

                  const content = (
                    <div
                      className={cn(
                        'relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                        active
                          ? 'bg-brand-600 text-white shadow-sm'
                          : 'text-foreground/80 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                      )}
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      {!collapsed && (
                        <>
                          <span className="flex-1 truncate">{item.title}</span>
                          {badge !== null && (
                            <span className="ml-auto inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-semibold text-white">
                              {badge}
                            </span>
                          )}
                          {hasKids && (
                            <ChevronDown
                              className={cn(
                                'h-3.5 w-3.5 shrink-0 transition-transform',
                                expanded && 'rotate-180'
                              )}
                            />
                          )}
                        </>
                      )}
                      {collapsed && badge !== null && (
                        <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500" />
                      )}
                    </div>
                  );

                  const wrapper = (
                    <Link
                      href={item.href}
                      className="block"
                      onClick={(e) => {
                        if (hasKids && !collapsed) {
                          e.preventDefault();
                          toggleKey(item.title);
                        } else {
                          onNavigate?.();
                        }
                      }}
                    >
                      {content}
                    </Link>
                  );

                  return (
                    <li key={item.title}>
                      {collapsed ? (
                        <Tooltip>
                          <TooltipTrigger asChild>{wrapper}</TooltipTrigger>
                          <TooltipContent side="right" className="font-medium">
                            {item.title}
                            {badge !== null ? ` (${badge})` : ''}
                          </TooltipContent>
                        </Tooltip>
                      ) : (
                        wrapper
                      )}

                      <AnimatePresence initial={false}>
                        {!collapsed && hasKids && expanded && (
                          <motion.ul
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.18 }}
                            className="overflow-hidden mt-1 ml-4 border-l border-border/60 pl-2 space-y-0.5"
                          >
                            {item.children!.map((child) => {
                              const childActive = pathname === child.href;
                              const ChildIcon = child.icon;
                              return (
                                <li key={child.href}>
                                  <Link
                                    href={child.href}
                                    onClick={() => onNavigate?.()}
                                    className={cn(
                                      'group flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-all',
                                      childActive
                                        ? 'bg-brand-500/10 text-brand-600 dark:text-brand-400'
                                        : 'text-muted-foreground hover:text-foreground hover:bg-zinc-100 dark:hover:bg-zinc-800'
                                    )}
                                  >
                                    <ChildIcon
                                      className={cn(
                                        'h-3.5 w-3.5 shrink-0 transition-colors',
                                        childActive
                                          ? 'text-brand-600 dark:text-brand-400'
                                          : 'text-muted-foreground/70 group-hover:text-foreground'
                                      )}
                                    />
                                    <span className="truncate">{child.title}</span>
                                  </Link>
                                </li>
                              );
                            })}
                          </motion.ul>
                        )}
                      </AnimatePresence>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </nav>
    </TooltipProvider>
  );
}
