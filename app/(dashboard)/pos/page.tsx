// app/(dashboard)/pos/page.tsx

'use client';

import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { ShoppingCart, X } from 'lucide-react';
import { useProductStore } from '@/lib/store/product-store';
import { useCartStore } from '@/lib/store/cart-store';
import { ProductGrid } from '@/components/pos/product-grid';
import { CartPanel } from '@/components/pos/cart-panel';
import { PaymentModal } from '@/components/pos/payment-modal';
import { SaleSuccessModal } from '@/components/pos/sale-success-modal';
import { BarcodeInput } from '@/components/pos/barcode-input';
import { HeldCarts } from '@/components/pos/held-carts';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { PageHeader } from '@/components/shared/page-header';
import { formatCurrency } from '@/lib/format';
import type { Sale } from '@/lib/types';
import { cn } from '@/lib/utils';

export default function POSPage() {
  const products = useProductStore((s) => s.products);
  const { addItem, items, clear, holdCart, total } = useCartStore();

  const [paymentOpen, setPaymentOpen] = useState(false);
  const [successSale, setSuccessSale] = useState<Sale | null>(null);
  const [successOpen, setSuccessOpen] = useState(false);
  const [mobileCartOpen, setMobileCartOpen] = useState(false);

  const cartCount = items.reduce((s, i) => s + i.qty, 0);
  const cartTotal = total();

  // Barcode scan handler
  const handleScan = useCallback(
    (code: string) => {
      const trimmed = code.trim();
      const found = products.find(
        (p) =>
          p.barcode === trimmed ||
          p.sku.toLowerCase() === trimmed.toLowerCase()
      );
      if (!found) {
        toast.error(`No product found for "${trimmed}"`);
        return;
      }
      if (found.stock <= 0) {
        toast.error(`${found.name} is out of stock`);
        return;
      }
      addItem(found);
      toast.success(`Added ${found.name}`);
    },
    [products, addItem]
  );

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Ignore when typing inside inputs (except barcode which handles its own Enter)
      const target = e.target as HTMLElement;
      const inInput =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable;

      if (e.key === 'F2' && items.length > 0) {
        e.preventDefault();
        setPaymentOpen(true);
      } else if (e.key === 'F4' && items.length > 0) {
        e.preventDefault();
        holdCart();
        toast.success('Cart held');
      } else if (e.key === 'Escape' && !inInput && items.length > 0) {
        e.preventDefault();
        clear();
        toast.info('Cart cleared');
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [items, clear, holdCart]);

  return (
    <div className="h-[calc(100vh-3.5rem)] md:h-[calc(100vh-3.5rem)] lg:h-[calc(100vh-3.5rem)] flex flex-col -m-3 md:-m-4 lg:-m-6">
      {/* Top bar */}
      <div className="px-3 md:px-4 lg:px-6 py-3 border-b bg-background shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-brand-500" />
            <h1 className="text-lg font-bold">Point of Sale</h1>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 sm:w-72 lg:w-96">
              <BarcodeInput onScan={handleScan} />
            </div>
            <HeldCarts />
          </div>
        </div>
      </div>

      {/* Main split */}
      <div className="flex-1 flex min-h-0">
        {/* Product grid */}
        <div className="flex-1 p-3 md:p-4 lg:p-6 min-w-0 flex flex-col">
          <ProductGrid
            onSelect={(p) => {
              if (p.stock <= 0) {
                toast.error(`${p.name} is out of stock`);
                return;
              }
              addItem(p);
            }}
          />
        </div>

        {/* Cart — desktop */}
        <aside className="hidden lg:flex w-[380px] xl:w-[420px] shrink-0 border-l bg-card p-4 flex-col">
          <CartPanel
            onPay={() => setPaymentOpen(true)}
            onHold={() => {
              holdCart();
              toast.success('Cart held');
            }}
            onClear={() => {
              clear();
              toast.info('Cart cleared');
            }}
          />
        </aside>
      </div>

      {/* Mobile cart button */}
      {cartCount > 0 && (
        <div className="lg:hidden sticky bottom-0 border-t bg-background p-3 shrink-0">
          <Button
            className="w-full h-12 text-base"
            onClick={() => setMobileCartOpen(true)}
          >
            <ShoppingCart className="h-5 w-5 mr-2" />
            View Cart · {cartCount} item{cartCount > 1 ? 's' : ''} ·{' '}
            {formatCurrency(cartTotal)}
          </Button>
        </div>
      )}

      {/* Mobile cart sheet */}
      <Sheet open={mobileCartOpen} onOpenChange={setMobileCartOpen}>
        <SheetContent side="bottom" className="h-[85vh] p-4 flex flex-col">
          <span className="sr-only">Shopping cart</span>
          <div className="flex-1 min-h-0">
            <CartPanel
              compact
              onPay={() => {
                setMobileCartOpen(false);
                setPaymentOpen(true);
              }}
              onHold={() => {
                holdCart();
                toast.success('Cart held');
                setMobileCartOpen(false);
              }}
              onClear={() => {
                clear();
                toast.info('Cart cleared');
              }}
            />
          </div>
        </SheetContent>
      </Sheet>

      {/* Payment modal */}
      <PaymentModal
        open={paymentOpen}
        onOpenChange={setPaymentOpen}
        onComplete={(sale) => {
          setSuccessSale(sale);
          setSuccessOpen(true);
        }}
      />

      {/* Success modal */}
      <SaleSuccessModal
        sale={successSale}
        open={successOpen}
        onOpenChange={(v) => {
          setSuccessOpen(v);
          if (!v) setSuccessSale(null);
        }}
      />
    </div>
  );
}