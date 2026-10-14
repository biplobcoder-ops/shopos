// lib/hooks/use-date-filter.ts

'use client';

import { useMemo, useState } from 'react';
import { startOfDay, endOfDay, subDays, startOfMonth, endOfMonth, startOfYear, endOfYear, isWithinInterval, parseISO } from 'date-fns';

export type RangePreset = 'today' | '7d' | '30d' | 'thisMonth' | 'thisYear' | 'custom';

interface Options {
  defaultPreset?: RangePreset;
}

export function useDateFilter({ defaultPreset = '30d' }: Options = {}) {
  const [preset, setPreset] = useState<RangePreset>(defaultPreset);
  const [customFrom, setCustomFrom] = useState<string>('');
  const [customTo, setCustomTo] = useState<string>('');

  const range = useMemo(() => {
    const now = new Date();
    switch (preset) {
      case 'today':
        return { from: startOfDay(now), to: endOfDay(now) };
      case '7d':
        return { from: startOfDay(subDays(now, 6)), to: endOfDay(now) };
      case '30d':
        return { from: startOfDay(subDays(now, 29)), to: endOfDay(now) };
      case 'thisMonth':
        return { from: startOfMonth(now), to: endOfMonth(now) };
      case 'thisYear':
        return { from: startOfYear(now), to: endOfYear(now) };
      case 'custom':
        return {
          from: customFrom ? startOfDay(parseISO(customFrom)) : startOfDay(subDays(now, 29)),
          to: customTo ? endOfDay(parseISO(customTo)) : endOfDay(now),
        };
      default:
        return { from: startOfDay(subDays(now, 29)), to: endOfDay(now) };
    }
  }, [preset, customFrom, customTo]);

  /** Check if a date string falls within range */
  const inRange = (dateStr: string): boolean => {
    try {
      const d = parseISO(dateStr);
      return isWithinInterval(d, { start: range.from, end: range.to });
    } catch {
      return false;
    }
  };

  return {
    preset,
    setPreset,
    customFrom,
    setCustomFrom,
    customTo,
    setCustomTo,
    range,
    inRange,
  };
}