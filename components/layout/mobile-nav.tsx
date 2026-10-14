// components/layout/mobile-nav.tsx

'use client';

import { Sheet, SheetContent } from '@/components/ui/sheet';
import { useSidebar } from '@/lib/hooks/use-sidebar';
import { Sidebar } from './sidebar';

export function MobileNav() {
  const { mobileOpen, setMobileOpen } = useSidebar();

  return (
    <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
      <SheetContent side="left" className="p-0 w-[280px] sm:w-[300px]">
        <Sidebar variant="mobile" />
      </SheetContent>
    </Sheet>
  );
}