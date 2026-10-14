// components/expense/expense-form-dialog.tsx

'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Loader2, Save } from 'lucide-react';
import { useSession } from 'next-auth/react';

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useExpenseStore } from '@/lib/store/expense-store';
import type { Expense } from '@/lib/types';

const schema = z.object({
  categoryId: z.string().min(1, 'Select a category'),
  amount: z.coerce.number().positive('Amount must be positive'),
  date: z.string().min(1, 'Date is required'),
  note: z.string().max(300).optional(),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  expense?: Expense | null;
}

export function ExpenseFormDialog({ open, onOpenChange, expense }: Props) {
  const { categories, add, update } = useExpenseStore();
  const { data: session } = useSession();
  const editing = !!expense;
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      categoryId: '',
      amount: 0,
      date: new Date().toISOString().slice(0, 10),
      note: '',
    },
  });

  useEffect(() => {
    if (!open) return;
    if (expense) {
      reset({
        categoryId: expense.categoryId,
        amount: expense.amount,
        date: expense.date.slice(0, 10),
        note: expense.note ?? '',
      });
    } else {
      reset({
        categoryId: categories[0]?.id ?? '',
        amount: 0,
        date: new Date().toISOString().slice(0, 10),
        note: '',
      });
    }
  }, [open, expense, reset, categories]);

  const onSubmit = (data: FormValues) => {
    setSubmitting(true);
    try {
      const payload = {
        categoryId: data.categoryId,
        amount: data.amount,
        date: new Date(data.date).toISOString(),
        note: data.note || undefined,
        createdBy: session?.user?.email ?? 'system',
      };

      if (editing && expense) {
        update(expense.id, {
          categoryId: payload.categoryId,
          amount: payload.amount,
          date: payload.date,
          note: payload.note,
        });
        toast.success('Expense updated');
      } else {
        add(payload);
        toast.success('Expense added');
      }
      onOpenChange(false);
    } catch {
      toast.error('Failed to save expense');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{editing ? 'Edit Expense' : 'Add Expense'}</DialogTitle>
          <DialogDescription>
            {editing ? 'Update expense details.' : 'Record a new shop expense.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div className="space-y-1.5">
            <Label>Category *</Label>
            <Select
              value={watch('categoryId')}
              onValueChange={(v) => setValue('categoryId', v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.categoryId && (
              <p className="text-xs text-red-500">{errors.categoryId.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="e-amount">Amount $ *</Label>
              <Input
                id="e-amount"
                type="number"
                step="0.01"
                min={1}
                {...register('amount')}
              />
              {errors.amount && (
                <p className="text-xs text-red-500">{errors.amount.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="e-date">Date *</Label>
              <Input id="e-date" type="date" {...register('date')} />
              {errors.date && (
                <p className="text-xs text-red-500">{errors.date.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="e-note">Note</Label>
            <Textarea
              id="e-note"
              rows={2}
              placeholder="Optional description"
              {...register('note')}
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
              {editing ? 'Save' : 'Add Expense'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}