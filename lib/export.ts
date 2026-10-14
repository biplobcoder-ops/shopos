// lib/export.ts

import { downloadText, downloadBlob } from './utils';

/** Convert array of objects to CSV string */
export function toCSV<T extends Record<string, any>>(rows: T[], columns?: (keyof T)[]): string {
  if (!rows.length) return '';
  const cols = columns ?? (Object.keys(rows[0]) as (keyof T)[]);
  const header = cols.map((c) => `"${String(c)}"`).join(',');
  const body = rows
    .map((row) =>
      cols
        .map((c) => {
          const val = row[c];
          if (val === null || val === undefined) return '""';
          const str = String(val).replace(/"/g, '""');
          return `"${str}"`;
        })
        .join(',')
    )
    .join('\n');
  return header + '\n' + body;
}

/** Download CSV */
export function downloadCSV<T extends Record<string, any>>(
  rows: T[],
  filename: string,
  columns?: (keyof T)[]
) {
  const csv = toCSV(rows, columns);
  downloadText(csv, filename, 'text/csv;charset=utf-8;');
}

/** Download Excel-compatible (actually CSV with .xls extension, works in Excel) */
export function downloadExcel<T extends Record<string, any>>(
  rows: T[],
  filename: string,
  columns?: (keyof T)[]
) {
  const csv = toCSV(rows, columns);
  // Excel needs BOM for UTF-8
  const bom = '\uFEFF';
  downloadText(bom + csv, filename, 'application/vnd.ms-excel');
}

/** Download JSON */
export function downloadJSON(data: any, filename: string) {
  downloadText(JSON.stringify(data, null, 2), filename, 'application/json');
}

/** Copy to clipboard */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}