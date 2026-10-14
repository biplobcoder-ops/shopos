// components/dashboard/role-dashboard.tsx

'use client';

import { useSession } from 'next-auth/react';
import { Loader2 } from 'lucide-react';
import { AdminDashboard } from './admin-dashboard';
import { ManagerDashboard } from './manager-dashboard';
import { CashierDashboard } from './cashier-dashboard';
import { StockmanDashboard } from './stockman-dashboard';

export function RoleDashboard() {
  const { data, status } = useSession();

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const role = data?.user?.role;

  switch (role) {
    case 'admin':
      return <AdminDashboard />;
    case 'manager':
      return <ManagerDashboard />;
    case 'cashier':
      return <CashierDashboard />;
    case 'stockman':
      return <StockmanDashboard />;
    default:
      return (
        <div className="rounded-xl border bg-card p-8 text-center text-sm text-muted-foreground">
          No dashboard available for your role.
        </div>
      );
  }
}