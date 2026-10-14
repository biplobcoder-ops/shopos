// components/users/user-form-dialog.tsx

'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Loader2, Save, Eye, EyeOff } from 'lucide-react';

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useUserStore } from '@/lib/store/user-store';
import { ROLE_DESCRIPTIONS, ALL_ROLES } from '@/lib/roles';
import { RoleBadge } from '@/components/auth/role-badge';
import type { User, Role } from '@/lib/types';

const baseSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(80),
  email: z.string().email('Invalid email'),
  phone: z.string().max(30).optional(),
  role: z.enum(['admin', 'manager', 'cashier', 'stockman']),
  active: z.boolean().default(true),
});

const createSchema = baseSchema.extend({
  password: z.string().min(4, 'Minimum 4 characters'),
});

const editSchema = baseSchema.extend({
  password: z.string().min(4, 'Minimum 4 characters').optional().or(z.literal('')),
});

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  user?: User | null;
}

export function UserFormDialog({ open, onOpenChange, user }: Props) {
  const { add, update } = useUserStore();
  const editing = !!user;
  const [submitting, setSubmitting] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  const schema = editing ? editSchema : createSchema;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<any>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      role: 'cashier',
      password: '',
      active: true,
    },
  });

  useEffect(() => {
    if (!open) return;
    if (user) {
      reset({
        name: user.name,
        email: user.email,
        phone: user.phone ?? '',
        role: user.role,
        password: '',
        active: user.active,
      });
    } else {
      reset({
        name: '',
        email: '',
        phone: '',
        role: 'cashier',
        password: '',
        active: true,
      });
    }
    setShowPwd(false);
  }, [open, user, reset]);

  const onSubmit = (data: any) => {
    setSubmitting(true);
    try {
      if (editing && user) {
        const patch: any = {
          name: data.name,
          email: data.email,
          phone: data.phone || undefined,
          role: data.role,
          active: data.active,
        };
        if (data.password) patch.password = data.password;
        update(user.id, patch);
        toast.success('User updated');
      } else {
        const created = add({
          name: data.name,
          email: data.email,
          password: data.password,
          role: data.role,
          phone: data.phone || undefined,
          active: data.active,
        });
        if (!created) {
          toast.error('A user with this email already exists');
          setSubmitting(false);
          return;
        }
        toast.success('User created');
      }
      onOpenChange(false);
    } catch {
      toast.error('Failed to save user');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{editing ? 'Edit User' : 'Add User'}</DialogTitle>
          <DialogDescription>
            {editing
              ? 'Update user details. Leave password blank to keep unchanged.'
              : 'Create a new staff account.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="u-name">Full Name *</Label>
            <Input id="u-name" placeholder="e.g. John Doe" {...register('name')} />
            {errors.name && (
              <p className="text-xs text-red-500">{errors.name.message as string}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="u-email">Email *</Label>
              <Input
                id="u-email"
                type="email"
                placeholder="user@shop.com"
                {...register('email')}
              />
              {errors.email && (
                <p className="text-xs text-red-500">{errors.email.message as string}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="u-phone">Phone</Label>
              <Input id="u-phone" placeholder="Optional" {...register('phone')} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Role *</Label>
              <Select
                value={watch('role')}
                onValueChange={(v) => setValue('role', v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ALL_ROLES.map((r) => (
                    <SelectItem key={r} value={r}>
                      <div className="flex items-center gap-2">
                        <RoleBadge role={r as Role} />
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-[10px] text-muted-foreground">
                {ROLE_DESCRIPTIONS[watch('role') as Role]}
              </p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="u-pwd">
                Password {editing ? '(leave blank to keep)' : '*'}
              </Label>
              <div className="relative">
                <Input
                  id="u-pwd"
                  type={showPwd ? 'text' : 'password'}
                  placeholder="••••"
                  className="pr-10"
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md text-muted-foreground hover:bg-accent"
                >
                  {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-500">
                  {errors.password.message as string}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              id="u-active"
              type="checkbox"
              className="h-4 w-4 rounded border-border"
              {...register('active')}
            />
            <Label htmlFor="u-active" className="text-sm cursor-pointer">
              Active account
            </Label>
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