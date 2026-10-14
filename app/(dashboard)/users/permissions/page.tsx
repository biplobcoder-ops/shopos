// app/(dashboard)/users/permissions/page.tsx

'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Info, Lock } from 'lucide-react';

import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RoleBadge } from '@/components/auth/role-badge';
import { ALL_ROLES, ROLE_DESCRIPTIONS } from '@/lib/roles';
import { can } from '@/lib/permissions';
import { cn } from '@/lib/utils';
import type { Permission, Role } from '@/lib/types';

const PERMISSIONS: { key: Permission; label: string; group: string }[] = [
  { key: 'dashboard', label: 'Dashboard', group: 'Main' },
  { key: 'pos', label: 'Point of Sale', group: 'Operations' },
  { key: 'sales', label: 'Sales', group: 'Operations' },
  { key: 'sales:own', label: 'Own sales only', group: 'Operations' },
  { key: 'purchase', label: 'Purchase', group: 'Operations' },
  { key: 'orders', label: 'Orders', group: 'Operations' },
  { key: 'products', label: 'Products', group: 'Catalog' },
  { key: 'products:view', label: 'View products', group: 'Catalog' },
  { key: 'products:edit', label: 'Edit products', group: 'Catalog' },
  { key: 'inventory', label: 'Inventory', group: 'Catalog' },
  { key: 'barcode', label: 'Barcode', group: 'Catalog' },
  { key: 'customers', label: 'Customers', group: 'Partners' },
  { key: 'suppliers', label: 'Suppliers', group: 'Partners' },
  { key: 'reports', label: 'Reports', group: 'Reports' },
  { key: 'expense', label: 'Expense', group: 'Reports' },
  { key: 'users', label: 'Users', group: 'System' },
  { key: 'settings', label: 'Settings', group: 'System' },
];

export default function PermissionsPage() {
  const [tab, setTab] = useState<Role>('manager');

  return (
    <div>
      <PageHeader
        title="Permissions"
        description="Fine-grained access control per role (demo view)."
      />

      {/* Info banner */}
      <Card className="mb-4 border-blue-500/20 bg-blue-500/5">
        <CardContent className="p-4 flex items-start gap-3">
          <Info className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
          <div className="text-xs text-blue-700 dark:text-blue-300">
            This is a demonstration view. Role permissions are enforced by the app
            and cannot be modified from here in the demo build.
          </div>
        </CardContent>
      </Card>

      <Tabs value={tab} onValueChange={(v) => setTab(v as Role)}>
        <TabsList className="h-9 mb-4 flex-wrap">
          {ALL_ROLES.map((r) => (
            <TabsTrigger key={r} value={r} className="text-xs">
              {r.charAt(0).toUpperCase() + r.slice(1)}
            </TabsTrigger>
          ))}
        </TabsList>

        {ALL_ROLES.map((r) => (
          <TabsContent key={r} value={r}>
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div>
                    <CardTitle className="text-base flex items-center gap-2">
                      <RoleBadge role={r as Role} />
                      <span className="capitalize">{r}</span>
                      {r === 'admin' && (
                        <Badge
                          variant="secondary"
                          className="text-[10px] bg-purple-500/15 text-purple-600 dark:text-purple-400 border-0"
                        >
                          <Lock className="h-3 w-3 mr-1" />
                          Full Access
                        </Badge>
                      )}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground mt-1">
                      {ROLE_DESCRIPTIONS[r as Role]}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1">
                  {PERMISSIONS.map((p) => {
                    const enabled = can(r, p.key);
                    const locked = r === 'admin';
                    return (
                      <div
                        key={p.key}
                        className="flex items-center justify-between gap-3 py-2.5 border-b border-border last:border-0"
                      >
                        <div className="min-w-0">
                          <div className="text-sm font-medium truncate">
                            {p.label}
                          </div>
                          <div className="text-[10px] text-muted-foreground">
                            {p.group}
                          </div>
                        </div>
                        <Switch
                          checked={enabled}
                          disabled={locked}
                          onCheckedChange={() => {
                            toast.info(
                              'Permissions are managed by the app in this demo.'
                            );
                          }}
                          className={cn(locked && 'cursor-not-allowed')}
                        />
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}