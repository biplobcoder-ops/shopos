// app/(dashboard)/settings/tax/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import {
  Percent,
  Save,
  Loader2,
  Calculator,
  Receipt,
  Info,
} from 'lucide-react';

import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useSettingsStore } from '@/lib/store/settings-store';
import { formatCurrency } from '@/lib/format';
import { cn } from '@/lib/utils';

const schema = z.object({
  rate: z.coerce
    .number()
    .min(0, 'Rate must be 0 or greater')
    .max(50, 'Rate seems too high (max 50%)'),
  vatNumber: z.string().max(40).optional(),
});

type FormValues = z.infer<typeof schema>;

export default function TaxSettingsPage() {
  const { taxInfo, updateTax } = useSettingsStore();
  const [submitting, setSubmitting] = useState(false);

  // Local state for switches (applied on save)
  const [enabled, setEnabled] = useState(taxInfo.enabled);
  const [inclusive, setInclusive] = useState(taxInfo.inclusive);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      rate: taxInfo.rate,
      vatNumber: taxInfo.vatNumber ?? '',
    },
  });

  useEffect(() => {
    reset({
      rate: taxInfo.rate,
      vatNumber: taxInfo.vatNumber ?? '',
    });
    setEnabled(taxInfo.enabled);
    setInclusive(taxInfo.inclusive);
  }, [taxInfo, reset]);

  const onSubmit = (data: FormValues) => {
    setSubmitting(true);
    try {
      updateTax({
        rate: data.rate,
        vatNumber: data.vatNumber || undefined,
        enabled,
        inclusive,
      });
      toast.success('Tax settings saved');
    } catch {
      toast.error('Failed to save tax settings');
    } finally {
      setSubmitting(false);
    }
  };

  // Live sample calc
  const rate = Number(watch('rate')) || 0;
  const sampleAmount = 1000;
  const sampleTax = inclusive
    ? sampleAmount - sampleAmount / (1 + rate / 100)
    : (sampleAmount * rate) / 100;
  const sampleTotal = inclusive ? sampleAmount : sampleAmount + sampleTax;

  return (
    <div>
      <PageHeader
        title="Tax & VAT Settings"
        description="Configure VAT percentage applied to sales and purchases."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Percent className="h-4 w-4 text-brand-500" />
                Tax Configuration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                {/* Enable toggle */}
                <div className="flex items-center justify-between gap-3 rounded-lg border p-3">
                  <div className="min-w-0">
                    <Label className="text-sm font-medium">Enable VAT</Label>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Apply VAT to new sales and purchase entries
                    </p>
                  </div>
                  <Switch checked={enabled} onCheckedChange={setEnabled} />
                </div>

                {/* Inclusive toggle */}
                <div
                  className={cn(
                    'flex items-center justify-between gap-3 rounded-lg border p-3 transition-opacity',
                    !enabled && 'opacity-50 pointer-events-none'
                  )}
                >
                  <div className="min-w-0">
                    <Label className="text-sm font-medium">
                      Inclusive Pricing
                    </Label>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      If on, VAT is already included in product prices
                    </p>
                  </div>
                  <Switch
                    checked={inclusive}
                    onCheckedChange={setInclusive}
                    disabled={!enabled}
                  />
                </div>

                <Separator />

                {/* Rate + VAT Number */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="t-rate">VAT Rate (%) *</Label>
                    <Input
                      id="t-rate"
                      type="number"
                      step="0.01"
                      min={0}
                      max={50}
                      {...register('rate')}
                    />
                    {errors.rate && (
                      <p className="text-xs text-red-500">{errors.rate.message}</p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="t-vatno">VAT Registration Number</Label>
                    <Input
                      id="t-vatno"
                      placeholder="e.g. VAT-99887766"
                      {...register('vatNumber')}
                    />
                    {errors.vatNumber && (
                      <p className="text-xs text-red-500">
                        {errors.vatNumber.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <Button type="submit" disabled={submitting}>
                    {submitting ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    Save Tax Settings
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      reset({
                        rate: taxInfo.rate,
                        vatNumber: taxInfo.vatNumber ?? '',
                      });
                      setEnabled(taxInfo.enabled);
                      setInclusive(taxInfo.inclusive);
                    }}
                  >
                    Reset
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Sample + Info */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Calculator className="h-4 w-4 text-brand-500" />
                Sample Calculation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Sample amount</span>
                  <span className="tabular-nums font-medium">
                    {formatCurrency(sampleAmount)}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">
                    VAT ({rate}%)
                  </span>
                  <span className="tabular-nums font-medium">
                    {formatCurrency(sampleTax)}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span className="tabular-nums text-brand-600 dark:text-brand-400">
                    {formatCurrency(sampleTotal)}
                  </span>
                </div>

                <div className="rounded-md bg-muted/60 px-3 py-2 text-[10px] text-muted-foreground leading-relaxed mt-3">
                  {!enabled
                    ? 'VAT is currently disabled. No tax applied.'
                    : inclusive
                    ? `Price of ${formatCurrency(sampleAmount)} already includes ${rate}% VAT.`
                    : `VAT of ${rate}% added on top of the price.`}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-blue-500/20 bg-blue-500/5">
            <CardContent className="p-4 flex items-start gap-3">
              <Info className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
              <div className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
                VAT is applied automatically in POS, purchases and orders when
                enabled. Invoices display the VAT breakdown with your
                registration number.
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Receipt className="h-4 w-4 text-brand-500" />
                Current Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">VAT Enabled</span>
                  <span
                    className={cn(
                      'font-semibold',
                      enabled
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-muted-foreground'
                    )}
                  >
                    {enabled ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Rate</span>
                  <span className="font-semibold tabular-nums">{rate}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Inclusive</span>
                  <span className="font-semibold">
                    {inclusive ? 'Yes' : 'No'}
                  </span>
                </div>
                {taxInfo.vatNumber && (
                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-border">
                    <span className="text-muted-foreground shrink-0">
                      Reg. No
                    </span>
                    <span className="font-mono truncate">
                      {taxInfo.vatNumber}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}