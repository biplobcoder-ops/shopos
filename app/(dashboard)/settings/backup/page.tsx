// app/(dashboard)/settings/backup/page.tsx

'use client';

import { useRef, useState } from 'react';
import { toast } from 'sonner';
import {
  Database,
  Download,
  Upload,
  AlertTriangle,
  Loader2,
  FileJson,
  RefreshCw,
  HardDrive,
  Info,
} from 'lucide-react';

import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { useSettingsStore } from '@/lib/store/settings-store';
import { resetAllStores } from '@/lib/store/reset-all';
import { downloadText } from '@/lib/utils';

export default function BackupSettingsPage() {
  const { exportAll, importAll } = useSettingsStore();
  const fileRef = useRef<HTMLInputElement>(null);

  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [resetting, setResetting] = useState(false);

  const handleExport = () => {
    setExporting(true);
    try {
      const json = exportAll();
      const date = new Date().toISOString().slice(0, 10);
      downloadText(json, `shopos-backup-${date}.json`, 'application/json');
      toast.success('Backup downloaded');
    } catch {
      toast.error('Failed to export backup');
    } finally {
      setExporting(false);
    }
  };

  const handleImportClick = () => {
    fileRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.json')) {
      toast.error('Please select a .json backup file');
      e.target.value = '';
      return;
    }

    setImporting(true);
    try {
      const text = await file.text();
      const result = importAll(text);
      if (!result.ok) {
        toast.error(result.error || 'Invalid backup file');
      } else {
        toast.success('Backup restored — reloading...');
        setTimeout(() => window.location.reload(), 800);
      }
    } catch {
      toast.error('Failed to read backup file');
    } finally {
      setImporting(false);
      e.target.value = '';
    }
  };

  const handleReset = () => {
    setResetting(true);
    try {
      resetAllStores();
      toast.success('All data reset to demo defaults — reloading...');
      setTimeout(() => window.location.reload(), 800);
    } catch {
      toast.error('Failed to reset');
      setResetting(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Backup & Restore"
        description="Export or restore all ShopOS data. Stored as a single JSON file."
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Export */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Download className="h-4 w-4 text-brand-500" />
              Export Backup
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center shrink-0">
                <FileJson className="h-5 w-5" />
              </div>
              <div className="text-sm leading-relaxed">
                Download all products, sales, purchases, orders, customers,
                suppliers, expenses, stock movements and settings as a single
                JSON file.
              </div>
            </div>

            <div className="rounded-lg border bg-muted/40 p-3 text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Format</span>
                <span className="font-medium">JSON</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Stores included</span>
                <span className="font-medium tabular-nums">11</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Filename</span>
                <span className="font-mono text-[10px] truncate">
                  shopos-backup-YYYY-MM-DD.json
                </span>
              </div>
            </div>

            <Button
              onClick={handleExport}
              disabled={exporting}
              className="w-full h-10"
            >
              {exporting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              Download Backup
            </Button>
          </CardContent>
        </Card>

        {/* Import */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Upload className="h-4 w-4 text-emerald-500" />
              Restore Backup
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <HardDrive className="h-5 w-5" />
              </div>
              <div className="text-sm leading-relaxed">
                Restore data from a previously exported backup file. This
                will replace your current data.
              </div>
            </div>

            <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 flex items-start gap-2 text-xs text-amber-700 dark:text-amber-300">
              <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
              <span>
                Restoring will overwrite all current data. Export a backup
                first if you might need the current state.
              </span>
            </div>

            <input
              ref={fileRef}
              type="file"
              accept="application/json,.json"
              onChange={handleFileChange}
              className="hidden"
            />

            <Button
              variant="outline"
              onClick={handleImportClick}
              disabled={importing}
              className="w-full h-10"
            >
              {importing ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Upload className="h-4 w-4 mr-2" />
              )}
              {importing ? 'Restoring...' : 'Choose Backup File'}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Reset */}
      <Card className="mt-4 border-red-500/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2 text-red-600 dark:text-red-400">
            <RefreshCw className="h-4 w-4" />
            Reset to Demo Data
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Erase all changes and restore the original ShopOS demo data: 55
            products, 22 customers, 12 suppliers, 30 orders, 52 sales, 30
            purchases, 25 expenses and 100+ stock movements.
          </p>
          <Button
            variant="destructive"
            onClick={() => setResetOpen(true)}
            disabled={resetting}
            className="h-10"
          >
            {resetting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Reset All Data
          </Button>
        </CardContent>
      </Card>

      {/* Info */}
      <Card className="mt-4 border-blue-500/20 bg-blue-500/5">
        <CardContent className="p-4 flex items-start gap-3">
          <Info className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
          <div className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
            ShopOS stores everything in your browser's localStorage. Backups
            are a snapshot of that data. In production, this would connect to
            a real database with server-side backups.
          </div>
        </CardContent>
      </Card>

      {/* Reset confirm */}
      <ConfirmDialog
        open={resetOpen}
        onOpenChange={setResetOpen}
        title="Reset all data?"
        description="This will permanently erase all your changes and restore the demo data. This action cannot be undone."
        confirmLabel="Reset Everything"
        loading={resetting}
        onConfirm={handleReset}
      />
    </div>
  );
}