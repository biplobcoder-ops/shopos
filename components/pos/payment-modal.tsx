// components/pos/payment-modal.tsx

'use client';

import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import {
  Check,
  Loader2,
  Banknote,
  CreditCard,
  Wallet,
  Smartphone,
  Landmark,
} from 'lucide-react';
import { useCartStore } from '@/lib/store/cart-store';
import { useSaleStore } from '@/lib/store/sale-store';
import { useSession } from 'next-auth/react';
import { formatCurrency } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { PaymentMethod, SaleItem } from '@/lib/types';
import { PAYMENT_METHODS } from '@/lib/constants';

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onComplete: (sale: any) => void;
}

/** Icons per payment method */
const METHOD_ICONS: Record<string, typeof Banknote> = {
  cash: Banknote,
  card: CreditCard,
  paypal: Wallet,
  afterpay: Smartphone,
  applepay: Smartphone,
  bank: Landmark,
};

export function PaymentModal({ open, onOpenChange, onComplete }: Props) {
  const { data: session } = useSession();
  const cart = useCartStore();
  const createSale = useSaleStore((s) => s.createSale);

  const total = cart.total();
  const [method, setMethod] = useState<PaymentMethod>('cash');
  const [paidStr, setPaidStr] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const paid = paidStr === '' ? total : Number(paidStr) || 0;
  const change = Math.max(0, paid - total);
  const due = Math.max(0, total - paid);

  useEffect(() => {
    if (open) {
      setPaidStr(total.toFixed(2));
      setMethod('cash');
    }
  }, [open, total]);

  const handleConfirm = async () => {
    if (cart.items.length === 0) {
      toast.error('Cart is empty');
      return;
    }
    if (paid < 0) {
      toast.error('Invalid paid amount');
      return;
    }
    if (due > 0 && !cart.customer) {
      toast.error('Select a customer to record due');
      return;
    }

    setSubmitting(true);
    try {
      const items: SaleItem[] = cart.items.map((it) => ({
        productId: it.productId,
        name: it.name,
        sku: it.sku,
        price: it.price,
        purchasePrice: it.purchasePrice,
        qty: it.qty,
        discount: it.discount,
        subtotal: it.price * it.qty - it.discount,
      }));

      const sale = createSale({
        customerId: cart.customer?.id ?? null,
        customerName: cart.customer?.name ?? 'Walk-in Customer',
        items,
        subtotal: cart.subtotal(),
        discount: cart.discount + cart.itemDiscountTotal(),
        tax: 0,
        total,
        paid,
        paymentMethod: due > 0 ? 'due' : method,
        cashier: session?.user?.email ?? 'unknown',
      });

      toast.success(`Sale complete · ${sale.invoiceNo}`);
      cart.clear();
      onOpenChange(false);
      onComplete(sale);
    } catch (err) {
      toast.error('Failed to complete sale');
    } finally {
      setSubmitting(false);
    }
  };

  const quickAmounts = [20, 50, 100, 200];

  // Filter out 'due' from method buttons — it's auto-set
  const methodOptions = PAYMENT_METHODS.filter((m) => m.value !== 'due');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Complete Payment</DialogTitle>
          <DialogDescription>
            {cart.items.length} item{cart.items.length > 1 ? 's' : ''} ·{' '}
            {cart.customer?.name ?? 'Walk-in Customer'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Total */}
          <div className="rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 text-white p-4 text-center">
            <div className="text-xs uppercase tracking-wider opacity-80">
              Total Payable
            </div>
            <div className="text-3xl font-bold tabular-nums mt-1">
              {formatCurrency(total)}
            </div>
          </div>

          {/* Payment Method */}
          <div className="space-y-2">
            <Label>Payment Method</Label>
            <div className="grid grid-cols-3 gap-2">
              {methodOptions.map((m) => {
                const Icon = METHOD_ICONS[m.value] ?? CreditCard;
                const selected = method === m.value;
                return (
                  <button
                    key={m.value}
                    type="button"
                    onClick={() => setMethod(m.value as PaymentMethod)}
                    className={cn(
                      'flex flex-col items-center justify-center gap-1 rounded-lg border py-3 transition-colors',
                      selected
                        ? 'border-brand-500 bg-brand-500/10 text-brand-600 dark:text-brand-400'
                        : 'border-border hover:bg-accent'
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="text-[11px] font-medium">{m.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Paid Amount */}
          <div className="space-y-2">
            <Label htmlFor="paid">Paid Amount</Label>
            <Input
              id="paid"
              type="number"
              min={0}
              step="0.01"
              value={paidStr}
              onChange={(e) => setPaidStr(e.target.value)}
              onFocus={(e) => e.target.select()}
              className="h-11 text-lg tabular-nums text-right"
              autoFocus
            />
            <div className="flex gap-1.5 flex-wrap">
              {quickAmounts.map((amt) => (
                <Button
                  key={amt}
                  type="button"
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs"
                  onClick={() =>
                    setPaidStr((Number(paidStr || total) + amt).toFixed(2))
                  }
                >
                  +${amt}
                </Button>
              ))}
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="h-7 text-xs"
                onClick={() => setPaidStr(total.toFixed(2))}
              >
                Exact
              </Button>
            </div>
          </div>

          {/* Change / Due */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border p-3">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Change
              </div>
              <div className="text-base font-bold tabular-nums text-emerald-600 dark:text-emerald-400 mt-0.5">
                {formatCurrency(change)}
              </div>
            </div>
            <div className="rounded-lg border p-3">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Due
              </div>
              <div
                className={cn(
                  'text-base font-bold tabular-nums mt-0.5',
                  due > 0
                    ? 'text-red-600 dark:text-red-400'
                    : 'text-muted-foreground'
                )}
              >
                {formatCurrency(due)}
              </div>
            </div>
          </div>

          {due > 0 && !cart.customer && (
            <div className="rounded-md bg-red-500/10 border border-red-500/20 px-3 py-2 text-xs text-red-600 dark:text-red-400">
              Select a customer before completing a sale with due amount.
            </div>
          )}

          <div className="flex gap-2 pt-1">
            <Button
              type="button"
              variant="outline"
              className="flex-1 h-11"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="flex-1 h-11"
              onClick={handleConfirm}
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Confirm Payment
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}