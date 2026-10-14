// app/(dashboard)/users/roles/page.tsx

'use client';

import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, X, ShieldCheck } from 'lucide-react';
import { RoleBadge } from '@/components/auth/role-badge';
import { ROLE_DESCRIPTIONS, ALL_ROLES } from '@/lib/roles';
import { can } from '@/lib/permissions';
import type { Permission, Role } from '@/lib/types';

const PERMISSIONS: { key: Permission; label: string; group: string }[] = [
  { key: 'dashboard', label: 'Dashboard', group: 'Main' },
  { key: 'pos', label: 'Point of Sale', group: 'Operations' },
  { key: 'sales', label: 'All Sales', group: 'Operations' },
  { key: 'sales:own', label: 'Own Sales Only', group: 'Operations' },
  { key: 'purchase', label: 'Purchase', group: 'Operations' },
  { key: 'orders', label: 'Orders', group: 'Operations' },
  { key: 'products', label: 'Products', group: 'Catalog' },
  { key: 'products:view', label: 'View Products', group: 'Catalog' },
  { key: 'products:edit', label: 'Edit Products', group: 'Catalog' },
  { key: 'inventory', label: 'Inventory', group: 'Catalog' },
  { key: 'barcode', label: 'Barcode', group: 'Catalog' },
  { key: 'customers', label: 'Customers', group: 'Partners' },
  { key: 'suppliers', label: 'Suppliers', group: 'Partners' },
  { key: 'reports', label: 'Reports', group: 'Reports' },
  { key: 'expense', label: 'Expense', group: 'Reports' },
  { key: 'users', label: 'Users', group: 'System' },
  { key: 'settings', label: 'Settings', group: 'System' },
];

export default function RolesPage() {
  const groups = Array.from(new Set(PERMISSIONS.map((p) => p.group)));

  return (
    <div>
      <PageHeader
        title="Roles & Permissions"
        description="Overview of what each role can access in Southern Cross Tools."
      />

      {/* Role overview cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {ALL_ROLES.map((r) => {
          const count =
            r === 'admin'
              ? PERMISSIONS.length
              : PERMISSIONS.filter((p) => can(r, p.key)).length;
          return (
            <Card key={r}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <RoleBadge role={r as Role} />
                  <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="text-sm font-semibold capitalize">{r}</div>
                <p className="text-xs text-muted-foreground mt-1 leading-snug">
                  {ROLE_DESCRIPTIONS[r as Role]}
                </p>
                <div className="mt-3 pt-3 border-t text-xs">
                  <span className="text-muted-foreground">Access: </span>
                  <span className="font-semibold tabular-nums">
                    {count} / {PERMISSIONS.length}
                  </span>
                  {r === 'admin' && (
                    <span className="ml-1 text-purple-600 dark:text-purple-400 font-medium">
                      (full)
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Matrix */}
      <Card className="overflow-hidden">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Permission Matrix</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40">
                <tr className="text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="text-left font-semibold px-4 py-2.5 min-w-[200px]">
                    Permission
                  </th>
                  {ALL_ROLES.map((r) => (
                    <th
                      key={r}
                      className="text-center font-semibold px-4 py-2.5 capitalize"
                    >
                      {r}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {groups.map((g) => (
                  <>
                    <tr key={g} className="bg-muted/20">
                      <td
                        colSpan={ALL_ROLES.length + 1}
                        className="px-4 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground"
                      >
                        {g}
                      </td>
                    </tr>
                    {PERMISSIONS.filter((p) => p.group === g).map((p) => (
                      <tr key={p.key} className="border-t border-border">
                        <td className="px-4 py-2.5 font-medium">{p.label}</td>
                        {ALL_ROLES.map((r) => {
                          const allowed = can(r, p.key);
                          return (
                            <td key={r} className="px-4 py-2.5 text-center">
                              {allowed ? (
                                <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                                  <Check className="h-3.5 w-3.5" />
                                </span>
                              ) : (
                                <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-red-500/10 text-red-500/60">
                                  <X className="h-3.5 w-3.5" />
                                </span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}