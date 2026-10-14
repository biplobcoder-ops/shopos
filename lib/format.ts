// lib/format.ts

import { format as formatDateFns, parseISO } from 'date-fns';

/**
 * Format currency in AUD: $1,234.56
 * Western numbering with comma every 3 digits
 */
export function formatCurrency(amount: number | undefined | null): string {
  if (amount === undefined || amount === null || isNaN(amount)) return '$0.00';
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format currency for PDF — "AUD 1,234.56" (no symbol, Helvetica safe)
 * Use this in all PDF templates to avoid glyph rendering issues
 */
export function formatCurrencyPDF(amount: number | undefined | null): string {
  if (amount === undefined || amount === null || isNaN(amount)) return 'AUD 0.00';
  const formatted = new Intl.NumberFormat('en-AU', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
  return `AUD ${formatted}`;
}

/** Format number with thousand separators (Western) */
export function formatNumber(value: number | undefined | null): string {
  if (value === undefined || value === null || isNaN(value)) return '0';
  return new Intl.NumberFormat('en-AU').format(value);
}

/** Format date: 12 Oct 2026 */
export function formatDate(date: string | Date | undefined | null): string {
  if (!date) return '—';
  try {
    const d = typeof date === 'string' ? parseISO(date) : date;
    return formatDateFns(d, 'dd MMM yyyy');
  } catch {
    return '—';
  }
}

/** Format date+time: 12 Oct 2026, 14:30 */
export function formatDateTime(date: string | Date | undefined | null): string {
  if (!date) return '—';
  try {
    const d = typeof date === 'string' ? parseISO(date) : date;
    return formatDateFns(d, 'dd MMM yyyy, HH:mm');
  } catch {
    return '—';
  }
}

/** Short date: 12 Oct */
export function formatDateShort(date: string | Date | undefined | null): string {
  if (!date) return '—';
  try {
    const d = typeof date === 'string' ? parseISO(date) : date;
    return formatDateFns(d, 'dd MMM');
  } catch {
    return '—';
  }
}

/** ISO date string: 2026-10-12T10:30:00.000Z */
export function toISODate(date: Date = new Date()): string {
  return date.toISOString();
}

/** Get initials from name — "Admin User" → "AU" */
export function getInitials(name: string): string {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/** Truncate long text with ellipsis */
export function truncate(text: string, len = 40): string {
  if (!text) return '';
  return text.length > len ? text.slice(0, len) + '...' : text;
}

/** Percentage: 12.5% */
export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}