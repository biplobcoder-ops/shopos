// app/(dashboard)/dashboard/page.tsx

import { RoleDashboard } from '@/components/dashboard/role-dashboard';

export const metadata = { title: 'Dashboard — Southern Cross Tools' };

export default function DashboardPage() {
  return <RoleDashboard />;
}