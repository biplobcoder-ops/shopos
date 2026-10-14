// components/suppliers/supplier-form-dialog.tsx

'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Loader2, Save } from 'lucide-react';

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
import { useSupplierStore } from '@/lib/store/supplier-store';
import type { Supplier } from '@/lib/types';

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  contactPerson: z.string().max(80).optional(),
  phone: z.string().min(4, 'Phone required').max(30),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  address: z.string().max(300).optional(),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  supplier?: Supplier | null;
}

export function SupplierFormDialog({ open, onOpenChange, supplier }: Props) {
  const { add, update } = useSupplierStore();
  const editing = !!supplier;
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', contactPerson: '', phone: '', email: '', address: '' },
  });

  useEffect(() => {
    if (!open) return;
    if (supplier) {
      reset({
        name: supplier.name,
        contactPerson: supplier.contactPerson ?? '',
        phone: supplier.phone,
        email: supplier.email ?? '',
        address: supplier.address ?? '',
      });
    } else {
      reset({ name: '', contactPerson: '', phone: '', email: '', address: '' });
    }
  }, [open, supplier, reset]);

  const onSubmit = (data: FormValues) => {
    setSubmitting(true);
    try {
      const payload = {
        name: data.name,
        contactPerson: data.contactPerson || undefined,
        phone: data.phone,
        email: data.email || undefined,
        address: data.address || undefined,
      };
      if (editing && supplier) {
        update(supplier.id, payload);
        toast.success('Supplier updated');
      } else {
        add({
          ...payload,
          due: 0,
          paid: 0,
          totalPurchase: 0,
        });
        toast.success('Supplier created');
      }
      onOpenChange(false);
    } catch {
      toast.error('Failed to save supplier');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{editing ? 'Edit Supplier' : 'Add Supplier'}</DialogTitle>
          <DialogDescription>
            {editing ? 'Update supplier details.' : 'Create a new supplier record.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="s-name">Company Name *</Label>
            <Input
              id="s-name"
              placeholder="e.g. Bosch Australia"
              {...register('name')}
            />
            {errors.name && (
              <p className="text-xs text-red-500">{errors.name.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="s-contact">Contact Person</Label>
              <Input
                id="s-contact"
                placeholder="Optional"
                {...register('contactPerson')}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="s-phone">Phone *</Label>
              <Input
                id="s-phone"
                placeholder="+61 4XX XXX XXX"
                {...register('phone')}
              />
              {errors.phone && (
                <p className="text-xs text-red-500">{errors.phone.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="s-email">Email</Label>
            <Input
              id="s-email"
              type="email"
              placeholder="Optional"
              {...register('email')}
            />
            {errors.email && (
              <p className="text-xs text-red-500">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="s-address">Address</Label>
            <Textarea
              id="s-address"
              rows={2}
              placeholder="Optional"
              {...register('address')}
            />
          </div>

          <DialogFooter className="gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              <Save className="h-4 w-4 mr-2" />
              {editing ? 'Save' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}