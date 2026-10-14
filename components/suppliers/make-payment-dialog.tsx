// components/suppliers/make-payment-dialog.tsx

'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Loader2, Wallet, Building2 } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { useSupplierStore } from '@/lib/store/supplier-store';
import { formatCurrency } from '@/lib/format';
import { cn } from '@/lib/utils';

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  supplierId: string | null;
}

export function MakePaymentDialog({ open, onOpenChange, supplierId }: Props) {
  const { suppliers, recordPayment } = useSupplierStore();
  const supplier = suppliers.find((s) => s.id === supplierId);

  const [amountStr, setAmountStr] = useState('');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open && supplier) {
      setAmountStr(String(supplier.due));
      setNote('');
    }
  }, [open, supplier]);

  if (!supplier) return null;

  const amount = Number(amountStr) || 0;
  const newDue = Math.max(0, supplier.due - amount);
  const invalid = amount <= 0 || amount > supplier.due;

  const handleSubmit = () => {
    if (invalid) {
      if (amount <= 0) toast.error('Enter a valid amount');
      else if (amount > supplier.due)
        toast.error('Amount cannot exceed current due');
      return;
    }
    setSubmitting(true);
    try {
      recordPayment(supplier.id, amount);
      toast.success(`Payment of ${formatCurrency(amount)} recorded`);
      onOpenChange(false);
    } catch {
      toast.error('Failed to record payment');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-amber-500" />
            Make Payment
          </DialogTitle>
          <DialogDescription>{supplier.name}</DialogDescription>
        </DialogHeader>

        <div className="rounded-lg border p-3 space-y-1 text-sm">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Contact</span>
            <span className="font-medium">
              {supplier.contactPerson ?? '—'}
            </span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Phone</span>
            <span className="font-medium">{supplier.phone}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Current Due</span>
            <span className="font-semibold tabular-nums text-red-600 dark:text-red-400">
              {formatCurrency(supplier.due)}
            </span>
          </div>
        </div>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="s-pay-amount">Payment Amount *</Label>
            <Input
              id="s-pay-amount"
              type="number"
              min={1}
              max={supplier.due}
              value={amountStr}
              onChange={(e) => setAmountStr(e.target.value)}
              onFocus={(e) => e.target.select()}
              className="h-10 text-right tabular-nums"
              autoFocus
            />
            <div className="flex gap-1.5 flex-wrap">
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="h-7 text-xs"
                onClick={() => setAmountStr(String(supplier.due))}
              >
                Full Due
              </Button>
              {[1000, 5000, 10000].map((v) => (
                <Button
                  key={v}
                  type="button"
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs"
                  onClick={() =>
                    setAmountStr(String(Math.min(supplier.due, amount + v)))
                  }
                >
                  +{v}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="s-pay-note">Note</Label>
            <Textarea
              id="s-pay-note"
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Optional"
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">New Due</span>
            <span
              className={cn(
                'tabular-nums font-semibold',
                newDue > 0
                  ? 'text-red-600 dark:text-red-400'
                  : 'text-emerald-600 dark:text-emerald-400'
              )}
            >
              {formatCurrency(newDue)}
            </span>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={submitting || invalid}>
            {submitting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Wallet className="h-4 w-4 mr-2" />
            )}
            Record Payment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}