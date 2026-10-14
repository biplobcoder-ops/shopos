// components/reports/report-shell.tsx

'use client';

import { Download, FileDown, FileText } from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { DateRangePicker } from './date-range-picker';
import type { RangePreset } from '@/lib/hooks/use-date-filter';
import { formatDate } from '@/lib/format';

interface Props {
  title: string;
  description: string;
  preset: RangePreset;
  setPreset: (p: RangePreset) => void;
  customFrom: string;
  setCustomFrom: (v: string) => void;
  customTo: string;
  setCustomTo: (v: string) => void;
  from: Date;
  to: Date;
  onExportCSV?: () => void;
  onExportPDF?: () => void;
  children: React.ReactNode;
  extraActions?: React.ReactNode;
}

export function ReportShell({
  title,
  description,
  preset,
  setPreset,
  customFrom,
  setCustomFrom,
  customTo,
  setCustomTo,
  from,
  to,
  onExportCSV,
  onExportPDF,
  children,
  extraActions,
}: Props) {
  return (
    <div>
      <PageHeader
        title={title}
        description={description}
        actions={
          <>
            {extraActions}
            {onExportCSV && (
              <Button variant="outline" className="h-9" onClick={onExportCSV}>
                <FileDown className="h-4 w-4 mr-2" />
                CSV
              </Button>
            )}
            {onExportPDF && (
              <Button variant="outline" className="h-9" onClick={onExportPDF}>
                <FileText className="h-4 w-4 mr-2" />
                PDF
              </Button>
            )}
          </>
        }
      />

      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <DateRangePicker
          preset={preset}
          setPreset={setPreset}
          customFrom={customFrom}
          setCustomFrom={setCustomFrom}
          customTo={customTo}
          setCustomTo={setCustomTo}
        />
        <div className="text-xs text-muted-foreground">
          {formatDate(from)} — {formatDate(to)}
        </div>
      </div>

      {children}
    </div>
  );
}