// app/(dashboard)/settings/business/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import {
  Building2,
  Save,
  Loader2,
  MapPin,
  Phone,
  Mail,
  Hash,
} from 'lucide-react';

import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useSettingsStore } from '@/lib/store/settings-store';

const schema = z.object({
  name: z.string().min(2, 'Business name is required').max(120),
  address: z.string().min(5, 'Address is required').max(300),
  phone: z.string().min(4, 'Phone is required').max(30),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  vatNumber: z.string().max(40).optional(),
});

type FormValues = z.infer<typeof schema>;

export default function BusinessInfoPage() {
  const { businessInfo, updateBusiness } = useSettingsStore();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: businessInfo.name,
      address: businessInfo.address,
      phone: businessInfo.phone,
      email: businessInfo.email,
      vatNumber: businessInfo.vatNumber ?? '',
    },
  });

  useEffect(() => {
    reset({
      name: businessInfo.name,
      address: businessInfo.address,
      phone: businessInfo.phone,
      email: businessInfo.email,
      vatNumber: businessInfo.vatNumber ?? '',
    });
  }, [businessInfo, reset]);

  const onSubmit = (data: FormValues) => {
    setSubmitting(true);
    try {
      updateBusiness({
        name: data.name,
        address: data.address,
        phone: data.phone,
        email: data.email ?? '',
        vatNumber: data.vatNumber || undefined,
      });
      toast.success('Business info saved');
      reset(data);
    } catch {
      toast.error('Failed to save');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Business Information"
        description="These details appear on invoices, receipts and statements."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Building2 className="h-4 w-4 text-brand-500" />
                Business Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="b-name">Business Name *</Label>
                  <Input
                    id="b-name"
                    placeholder="e.g. Southern Cross Tools Construction Tools"
                    {...register('name')}
                  />
                  {errors.name && (
                    <p className="text-xs text-red-500">{errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="b-address">Address *</Label>
                  <Textarea
                    id="b-address"
                    rows={3}
                    placeholder="Full business address"
                    {...register('address')}
                  />
                  {errors.address && (
                    <p className="text-xs text-red-500">{errors.address.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="b-phone">Phone *</Label>
                    <Input
                      id="b-phone"
                      placeholder="+61 4XX XXX XXX"
                      {...register('phone')}
                    />
                    {errors.phone && (
                      <p className="text-xs text-red-500">{errors.phone.message}</p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="b-email">Email</Label>
                    <Input
                      id="b-email"
                      type="email"
                      placeholder="hello@shop.com"
                      {...register('email')}
                    />
                    {errors.email && (
                      <p className="text-xs text-red-500">{errors.email.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="b-vat">VAT / BIN Number</Label>
                  <Input
                    id="b-vat"
                    placeholder="e.g. BIN-123456789"
                    {...register('vatNumber')}
                  />
                  {errors.vatNumber && (
                    <p className="text-xs text-red-500">
                      {errors.vatNumber.message}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <Button type="submit" disabled={submitting || !isDirty}>
                    {submitting ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    Save Changes
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      reset({
                        name: businessInfo.name,
                        address: businessInfo.address,
                        phone: businessInfo.phone,
                        email: businessInfo.email,
                        vatNumber: businessInfo.vatNumber ?? '',
                      })
                    }
                    disabled={!isDirty}
                  >
                    Reset
                  </Button>
                  {!isDirty && (
                    <span className="text-xs text-muted-foreground ml-auto">
                      No unsaved changes
                    </span>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Preview */}
        <div>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border p-4 bg-white dark:bg-zinc-900 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-lg bg-brand-600 text-white flex items-center justify-center shrink-0">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-sm truncate">
                      {businessInfo.name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Construction Tools Shop
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t space-y-2 text-xs">
                  <div className="flex items-start gap-2">
                    <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
                    <span className="text-muted-foreground leading-snug">
                      {businessInfo.address}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <span className="text-muted-foreground">
                      {businessInfo.phone}
                    </span>
                  </div>
                  {businessInfo.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      <span className="text-muted-foreground truncate">
                        {businessInfo.email}
                      </span>
                    </div>
                  )}
                  {businessInfo.vatNumber && (
                    <div className="flex items-center gap-2">
                      <Hash className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      <span className="text-muted-foreground">
                        VAT: {businessInfo.vatNumber}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <p className="text-[10px] text-muted-foreground mt-3 text-center">
                This is what appears on invoice & receipt headers.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}