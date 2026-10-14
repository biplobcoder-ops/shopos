// components/products/product-form-dialog.tsx

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useProductStore } from '@/lib/store/product-store';
import { nanoid } from 'nanoid';
import type { Product } from '@/lib/types';

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(120),
  sku: z.string().min(2, 'SKU required').max(40),
  barcode: z
    .string()
    .min(4, 'Barcode too short')
    .max(20, 'Barcode too long')
    .regex(/^[0-9A-Za-z-]+$/, 'Only letters, digits and dashes'),
  category: z.string().min(1, 'Select a category'),
  brand: z.string().min(1, 'Select a brand'),
  unit: z.string().min(1, 'Select a unit'),
  purchasePrice: z.coerce.number().min(0, 'Cannot be negative'),
  sellingPrice: z.coerce.number().min(0, 'Cannot be negative'),
  stock: z.coerce.number().int().min(0),
  minStock: z.coerce.number().int().min(0),
  grade: z.string().optional(),
  description: z.string().max(500).optional(),
  status: z.enum(['active', 'inactive']).default('active'),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  product?: Product | null;
}

function genBarcode() {
  return '890' + Date.now().toString().slice(-10);
}

export function ProductFormDialog({ open, onOpenChange, product }: Props) {
  const { addProduct, updateProduct, categories, brands, units } = useProductStore();
  const editing = !!product;
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
      name: '',
      sku: '',
      barcode: '',
      category: categories[0]?.name ?? '',
      brand: brands[0]?.name ?? '',
      unit: units[0]?.shortName ?? units[0]?.name ?? '',
      purchasePrice: 0,
      sellingPrice: 0,
      stock: 0,
      minStock: 5,
      grade: '',
      description: '',
      status: 'active',
    },
  });

  useEffect(() => {
    if (!open) return;
    if (product) {
      reset({
        name: product.name,
        sku: product.sku,
        barcode: product.barcode,
        category: product.category,
        brand: product.brand,
        unit: product.unit,
        purchasePrice: product.purchasePrice,
        sellingPrice: product.sellingPrice,
        stock: product.stock,
        minStock: product.minStock,
        grade: product.grade ?? '',
        description: product.description ?? '',
        status: product.status,
      });
    } else {
      reset({
        name: '',
        sku: 'SKU-' + nanoid(6).toUpperCase(),
        barcode: genBarcode(),
        category: categories[0]?.name ?? '',
        brand: brands[0]?.name ?? '',
        unit: units[0]?.shortName ?? units[0]?.name ?? '',
        purchasePrice: 0,
        sellingPrice: 0,
        stock: 0,
        minStock: 5,
        grade: '',
        description: '',
        status: 'active',
      });
    }
  }, [open, product, reset, categories, brands, units]);

  const onSubmit = (data: FormValues) => {
    setSubmitting(true);
    try {
      if (editing && product) {
        updateProduct(product.id, data);
        toast.success('Product updated');
      } else {
        addProduct(data as any);
        toast.success('Product created');
      }
      onOpenChange(false);
    } catch {
      toast.error('Failed to save product');
    } finally {
      setSubmitting(false);
    }
  };

  const watchName = watch('name');
  const watchBarcode = watch('barcode');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editing ? 'Edit Product' : 'Add New Product'}</DialogTitle>
          <DialogDescription>
            {editing
              ? 'Update product details and save changes.'
              : 'Fill in the product details. SKU and barcode are auto-generated but editable.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-2 space-y-1.5">
              <Label htmlFor="name">Product Name *</Label>
              <Input id="name" placeholder="e.g. Bosch Impact Drill 500W" {...register('name')} />
              {errors.name && (
                <p className="text-xs text-red-500">{errors.name.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sku">SKU *</Label>
              <Input id="sku" placeholder="SKU-XXXXXX" {...register('sku')} />
              {errors.sku && (
                <p className="text-xs text-red-500">{errors.sku.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="barcode">Barcode / EAN *</Label>
            <div className="flex gap-2">
              <Input
                id="barcode"
                className="flex-1"
                placeholder="8901234567890"
                {...register('barcode')}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => setValue('barcode', genBarcode())}
              >
                Generate
              </Button>
            </div>
            {errors.barcode && (
              <p className="text-xs text-red-500">{errors.barcode.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label>Category *</Label>
              <Select
                value={watch('category')}
                onValueChange={(v) => setValue('category', v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.name}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && (
                <p className="text-xs text-red-500">{errors.category.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label>Brand *</Label>
              <Select value={watch('brand')} onValueChange={(v) => setValue('brand', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {brands.map((b) => (
                    <SelectItem key={b.id} value={b.name}>
                      {b.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.brand && (
                <p className="text-xs text-red-500">{errors.brand.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label>Unit *</Label>
              <Select value={watch('unit')} onValueChange={(v) => setValue('unit', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {units.map((u) => {
                    const unitKey = u.shortName ?? u.name;
                    return (
                      <SelectItem key={u.id} value={unitKey}>
                        {u.name} ({u.shortName ?? '—'})
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              {errors.unit && (
                <p className="text-xs text-red-500">{errors.unit.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="purchasePrice">Purchase $ *</Label>
              <Input
                id="purchasePrice"
                type="number"
                step="0.01"
                {...register('purchasePrice')}
              />
              {errors.purchasePrice && (
                <p className="text-xs text-red-500">{errors.purchasePrice.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sellingPrice">Selling $ *</Label>
              <Input
                id="sellingPrice"
                type="number"
                step="0.01"
                {...register('sellingPrice')}
              />
              {errors.sellingPrice && (
                <p className="text-xs text-red-500">{errors.sellingPrice.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="stock">Stock *</Label>
              <Input id="stock" type="number" {...register('stock')} />
              {errors.stock && (
                <p className="text-xs text-red-500">{errors.stock.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="minStock">Min Stock *</Label>
              <Input id="minStock" type="number" {...register('minStock')} />
              {errors.minStock && (
                <p className="text-xs text-red-500">{errors.minStock.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="grade">Grade</Label>
              <Select
                value={watch('grade') || 'none'}
                onValueChange={(v) => setValue('grade', v === 'none' ? '' : v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Optional" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="A">A (Premium)</SelectItem>
                  <SelectItem value="B">B (Standard)</SelectItem>
                  <SelectItem value="C">C (Economy)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select
                value={watch('status')}
                onValueChange={(v) => setValue('status', v as 'active' | 'inactive')}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              rows={3}
              placeholder="Optional short description..."
              {...register('description')}
            />
            {errors.description && (
              <p className="text-xs text-red-500">{errors.description.message}</p>
            )}
          </div>

          {watchName && (
            <div className="rounded-lg border bg-muted/40 p-3 flex items-center justify-between text-xs">
              <div className="min-w-0">
                <div className="font-medium truncate">{watchName}</div>
                <div className="text-muted-foreground truncate">
                  {watch('sku')} · {watchBarcode}
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold tabular-nums">
                  ${Number(watch('sellingPrice') || 0).toLocaleString()}
                </div>
                <div className="text-muted-foreground">
                  Stock {watch('stock') || 0}
                </div>
              </div>
            </div>
          )}

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
              {editing ? 'Save Changes' : 'Create Product'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}