// app/(website)/layout.tsx

import { WebsiteNavbar } from '@/components/website/navbar';
import { WebsiteFooter } from '@/components/website/footer';
import { WebsiteCartDrawer } from '@/components/website/cart-drawer';

export default function WebsiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <WebsiteNavbar />
      <main className="flex-1">{children}</main>
      <WebsiteFooter />
      <WebsiteCartDrawer />
    </div>
  );
}
