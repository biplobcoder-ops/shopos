// app/(dashboard)/settings/receipt/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import {
  Save,
  Loader2,
  Printer,
  Receipt,
  Info,
  Building2,
} from 'lucide-react';

import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useSettingsStore } from '@/lib/store/settings-store';

const schema = z.object({
  headerText: z.string().max(200).optional(),
  footerText: z.string().max(200).optional(),
});

type FormValues = z.infer<typeof schema>;

export default function ReceiptSettingsPage() {
  const { receiptInfo, businessInfo, updateReceipt } = useSettingsStore();
  const [submitting, setSubmitting] = useState(false);

  const [showLogo, setShowLogo] = useState(receiptInfo.showLogo);
  const [showVat, setShowVat] = useState(receiptInfo.showVat);
  const [showCashier, setShowCashier] = useState(receiptInfo.showCashier);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      headerText: receiptInfo.headerText,
      footerText: receiptInfo.footerText,
    },
  });

  useEffect(() => {
    reset({
      headerText: receiptInfo.headerText,
      footerText: receiptInfo.footerText,
    });
    setShowLogo(receiptInfo.showLogo);
    setShowVat(receiptInfo.showVat);
    setShowCashier(receiptInfo.showCashier);
  }, [receiptInfo, reset]);

  const onSubmit = (data: FormValues) => {
    setSubmitting(true);
    try {
      updateReceipt({
        headerText: data.headerText ?? '',
        footerText: data.footerText ?? '',
        showLogo,
        showVat,
        showCashier,
      });
      toast.success('Receipt settings saved');
    } catch {
      toast.error('Failed to save');
    } finally {
      setSubmitting(false);
    }
  };

  const headerText = watch('headerText');
  const footerText = watch('footerText');

  return (
    <div>
      <PageHeader
        title="Receipt Settings"
        description="Customize the printed receipt that customers receive."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Form */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Receipt className="h-4 w-4 text-brand-500" />
                Receipt Content
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="r-header">Header Text</Label>
                  <Input
                    id="r-header"
                    placeholder="e.g. Thank you for shopping with us!"
                    {...register('headerText')}
                  />
                  <p className="text-[10px] text-muted-foreground">
                    Shown at the top of every receipt.
                  </p>
                  {errors.headerText && (
                    <p className="text-xs text-red-500">
                      {errors.headerText.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="r-footer">Footer Text</Label>
                  <Textarea
                    id="r-footer"
                    rows={3}
                    placeholder="e.g. Goods once sold are not returnable without receipt."
                    {...register('footerText')}
                  />
                  <p className="text-[10px] text-muted-foreground">
                    Shown at the bottom of every receipt.
                  </p>
                  {errors.footerText && (
                    <p className="text-xs text-red-500">
                      {errors.footerText.message}
                    </p>
                  )}
                </div>

                <Separator />

                {/* Toggles */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-3 rounded-lg border p-3">
                    <div className="min-w-0">
                      <Label className="text-sm font-medium">
                        Show Shop Logo
                      </Label>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Display logo (icon) at top of receipt
                      </p>
                    </div>
                    <Switch checked={showLogo} onCheckedChange={setShowLogo} />
                  </div>

                  <div className="flex items-center justify-between gap-3 rounded-lg border p-3">
                    <div className="min-w-0">
                      <Label className="text-sm font-medium">
                        Show VAT / BIN
                      </Label>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Display VAT registration number on receipt
                      </p>
                    </div>
                    <Switch checked={showVat} onCheckedChange={setShowVat} />
                  </div>

                  <div className="flex items-center justify-between gap-3 rounded-lg border p-3">
                    <div className="min-w-0">
                      <Label className="text-sm font-medium">
                        Show Cashier Name
                      </Label>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Display cashier email on receipt
                      </p>
                    </div>
                    <Switch
                      checked={showCashier}
                      onCheckedChange={setShowCashier}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <Button type="submit" disabled={submitting}>
                    {submitting ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    Save Receipt Settings
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      reset({
                        headerText: receiptInfo.headerText,
                        footerText: receiptInfo.footerText,
                      });
                      setShowLogo(receiptInfo.showLogo);
                      setShowVat(receiptInfo.showVat);
                      setShowCashier(receiptInfo.showCashier);
                    }}
                  >
                    Reset
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card className="border-blue-500/20 bg-blue-500/5">
            <CardContent className="p-4 flex items-start gap-3">
              <Info className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
              <div className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
                These settings apply to POS receipts (thermal 80mm). The full A4
                invoice uses these settings for the header, footer, and toggles
                as well.
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Live preview */}
        <div>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Printer className="h-4 w-4 text-brand-500" />
                Receipt Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mx-auto max-w-[260px] bg-white dark:bg-zinc-900 rounded-lg border p-3 text-[10px] font-mono text-zinc-800 dark:text-zinc-200 shadow-sm">
                {/* Logo */}
                {showLogo && (
                  <div className="flex flex-col items-center mb-2">
                    <div className="h-8 w-8 rounded-md bg-brand-600 text-white flex items-center justify-center">
                      <Building2 className="h-4 w-4" />
                    </div>
                  </div>
                )}

                {/* Shop name */}
                <div className="text-center">
                  <div className="font-bold text-sm leading-tight">
                    {businessInfo.name}
                  </div>
                  <div className="text-[9px] text-zinc-500 leading-tight mt-0.5">
                    {businessInfo.phone}
                  </div>
                  {showVat && businessInfo.vatNumber && (
                    <div className="text-[9px] text-zinc-500 leading-tight">
                      VAT: {businessInfo.vatNumber}
                    </div>
                  )}
                </div>

                {/* Header text */}
                {headerText && (
                  <div className="text-center text-[9px] text-zinc-600 mt-2">
                    {headerText}
                  </div>
                )}

                <div className="border-t border-dashed border-zinc-400 my-2" />

                {/* Meta */}
                <div className="flex justify-between text-[9px]">
                  <span>Invoice</span>
                  <span>INV-5001</span>
                </div>
                <div className="flex justify-between text-[9px]">
                  <span>Date</span>
                  <span>12 Oct 2026</span>
                </div>
                <div className="flex justify-between text-[9px]">
                  <span>Customer</span>
                  <span>Walk-in</span>
                </div>
                {showCashier && (
                  <div className="flex justify-between text-[9px]">
                    <span>Cashier</span>
                    <span>cashier</span>
                  </div>
                )}

                <div className="border-t border-dashed border-zinc-400 my-2" />

                {/* Items */}
                <div className="space-y-1">
                  <div>
                    <div className="font-semibold">Bosch Impact Drill</div>
                    <div className="flex justify-between text-[9px] text-zinc-600">
                      <span>1 x $8,500</span>
                      <span>$8,500</span>
                    </div>
                  </div>
                  <div>
                    <div className="font-semibold">Stanley Hammer</div>
                    <div className="flex justify-between text-[9px] text-zinc-600">
                      <span>2 x $850</span>
                      <span>$1,700</span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-dashed border-zinc-400 my-2" />

                {/* Totals */}
                <div className="flex justify-between text-[9px]">
                  <span>Subtotal</span>
                  <span>$10,200</span>
                </div>
                <div className="flex justify-between text-[9px]">
                  <span>VAT</span>
                  <span>$510</span>
                </div>

                <div className="border-t border-dashed border-zinc-400 my-2" />

                <div className="flex justify-between font-bold text-xs">
                  <span>TOTAL</span>
                  <span>$10,710</span>
                </div>
                <div className="flex justify-between text-[9px] mt-1">
                  <span>Paid</span>
                  <span>$10,710</span>
                </div>

                <div className="border-t border-dashed border-zinc-400 my-2" />

                {/* Footer text */}
                <div className="text-center text-[9px] text-zinc-500 leading-relaxed">
                  {footerText || 'Thank you!'}
                </div>
                <div className="text-center text-[8px] text-zinc-400 mt-1">
                  Powered by Southern Cross Tools
                </div>
              </div>

              <p className="text-[10px] text-muted-foreground mt-3 text-center">
                80mm thermal receipt preview
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}