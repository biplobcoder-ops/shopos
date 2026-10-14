// components/dashboard/stat-card.tsx

'use client';

import { useEffect, useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface Props {
  title: string;
  value: number | string;
  icon: LucideIcon;
  prefix?: string;
  suffix?: string;
  delta?: number;
  variant?: 'indigo' | 'emerald' | 'amber' | 'red' | 'blue' | 'purple' | 'cyan' | 'zinc';
  subtitle?: string;
  animate?: boolean;
  format?: 'currency' | 'number' | 'raw';
  className?: string;
  /** Optional mini sparkline data (5-12 points) */
  sparkline?: number[];
}

interface VariantConfig {
  bg: string;
  text: string;
  gradient: string;
  glow: string;
  ring: string;
  iconBg: string;
}

const variantConfig: Record<string, VariantConfig> = {
  indigo: {
    bg: 'bg-brand-500/10',
    text: 'text-brand-600 dark:text-brand-400',
    gradient: 'from-brand-500 to-brand-500',
    glow: 'shadow-brand-500/20',
    ring: 'ring-brand-500/20',
    iconBg: 'bg-gradient-to-br from-brand-500 to-brand-600',
  },
  emerald: {
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-600 dark:text-emerald-400',
    gradient: 'from-emerald-500 to-teal-500',
    glow: 'shadow-emerald-500/20',
    ring: 'ring-emerald-500/20',
    iconBg: 'bg-gradient-to-br from-emerald-500 to-teal-600',
  },
  amber: {
    bg: 'bg-amber-500/10',
    text: 'text-amber-600 dark:text-amber-400',
    gradient: 'from-amber-500 to-orange-500',
    glow: 'shadow-amber-500/20',
    ring: 'ring-amber-500/20',
    iconBg: 'bg-gradient-to-br from-amber-500 to-orange-600',
  },
  red: {
    bg: 'bg-red-500/10',
    text: 'text-red-600 dark:text-red-400',
    gradient: 'from-red-500 to-rose-500',
    glow: 'shadow-red-500/20',
    ring: 'ring-red-500/20',
    iconBg: 'bg-gradient-to-br from-red-500 to-rose-600',
  },
  blue: {
    bg: 'bg-blue-500/10',
    text: 'text-blue-600 dark:text-blue-400',
    gradient: 'from-blue-500 to-cyan-500',
    glow: 'shadow-blue-500/20',
    ring: 'ring-blue-500/20',
    iconBg: 'bg-gradient-to-br from-blue-500 to-cyan-600',
  },
  purple: {
    bg: 'bg-purple-500/10',
    text: 'text-purple-600 dark:text-purple-400',
    gradient: 'from-purple-500 to-fuchsia-500',
    glow: 'shadow-purple-500/20',
    ring: 'ring-purple-500/20',
    iconBg: 'bg-gradient-to-br from-purple-500 to-fuchsia-600',
  },
  cyan: {
    bg: 'bg-cyan-500/10',
    text: 'text-cyan-600 dark:text-cyan-400',
    gradient: 'from-cyan-500 to-sky-500',
    glow: 'shadow-cyan-500/20',
    ring: 'ring-cyan-500/20',
    iconBg: 'bg-gradient-to-br from-cyan-500 to-sky-600',
  },
  zinc: {
    bg: 'bg-zinc-500/10',
    text: 'text-zinc-600 dark:text-zinc-400',
    gradient: 'from-zinc-500 to-slate-500',
    glow: 'shadow-zinc-500/20',
    ring: 'ring-zinc-500/20',
    iconBg: 'bg-gradient-to-br from-zinc-600 to-slate-700',
  },
};

/** Format currency in AUD: $1,234.56 */
function formatAUD(n: number): string {
  if (isNaN(n)) return '$0.00';
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}

/** Format number with thousand separators (Western) */
function formatNum(n: number): string {
  return new Intl.NumberFormat('en-AU').format(Math.round(n));
}

/**
 * Compact form for large numbers: $1.23K, $1.23M
 * Australian standard uses K/M/B (not Lakh/Crore)
 */
function formatCompactAUD(n: number): string {
  const abs = Math.abs(n);
  const sign = n < 0 ? '-' : '';
  if (abs >= 1_000_000_000) return `${sign}$${(abs / 1_000_000_000).toFixed(2)}B`;
  if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(2)}M`;
  if (abs >= 1_000) return `${sign}$${(abs / 1_000).toFixed(1)}K`;
  return `${sign}$${Math.round(abs)}`;
}

/** Mini sparkline SVG */
function Sparkline({ data, className }: { data: number[]; className?: string }) {
  if (!data || data.length < 2) return null;

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const width = 100;
  const height = 28;
  const padding = 2;

  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * (width - padding * 2) + padding;
    const y = height - ((val - min) / range) * (height - padding * 2) - padding;
    return `${x},${y}`;
  });

  const pathD = `M ${points.join(' L ')}`;
  const areaD = `${pathD} L ${width - padding},${height} L ${padding},${height} Z`;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      className={cn('w-full h-7', className)}
    >
      <defs>
        <linearGradient id="sparklineFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.25" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaD} fill="url(#sparklineFill)" />
      <path
        d={pathD}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function StatCard({
  title,
  value,
  icon: Icon,
  prefix = '',
  suffix = '',
  delta,
  variant = 'indigo',
  subtitle,
  animate = true,
  format = 'currency',
  className,
  sparkline,
}: Props) {
  const isNumeric = typeof value === 'number';
  const [display, setDisplay] = useState<number | string>(
    isNumeric && animate ? 0 : value
  );

  useEffect(() => {
    if (!isNumeric || !animate) return;
    const target = value as number;
    const duration = 700;
    const start = performance.now();
    let raf: number;

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(target * eased);
      if (t < 1) raf = requestAnimationFrame(tick);
      else setDisplay(target);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, animate, isNumeric]);

  const config = variantConfig[variant];

  const rendered = (() => {
    if (!isNumeric) return `${prefix}${value}${suffix}`;
    const n = typeof display === 'number' ? display : 0;
    if (format === 'currency') {
      const absN = Math.abs(n);
      // Compact for very large numbers, full for normal
      return absN >= 1_000_000 ? formatCompactAUD(n) : formatAUD(n);
    }
    if (format === 'number') return prefix + formatNum(n) + suffix;
    return `${prefix}${n}${suffix}`;
  })();

  const fullValue =
    isNumeric && format === 'currency'
      ? formatAUD(typeof display === 'number' ? display : 0)
      : undefined;

  return (
    <Card
      className={cn(
        'relative overflow-hidden group',
        'border-border/60 hover:border-border',
        'shadow-sm hover:shadow-lg transition-all duration-300',
        'hover:-translate-y-0.5',
        className
      )}
    >
      {/* Gradient top bar */}
      <div
        className={cn(
          'absolute top-0 left-0 right-0 h-1 bg-gradient-to-r',
          config.gradient
        )}
      />

      {/* Subtle background gradient blob */}
      <div
        className={cn(
          'absolute -top-12 -right-12 h-32 w-32 rounded-full bg-gradient-to-br opacity-[0.07] blur-2xl transition-opacity duration-300 group-hover:opacity-[0.12]',
          config.gradient
        )}
      />

      <CardContent className="relative p-4 md:p-5">
        {/* Top row: icon + delta */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div
            className={cn(
              'h-11 w-11 shrink-0 rounded-xl flex items-center justify-center',
              config.iconBg,
              'shadow-md',
              config.glow
            )}
          >
            <Icon className="h-5 w-5 text-white" />
          </div>

          {typeof delta === 'number' && (
            <div
              className={cn(
                'inline-flex items-center gap-0.5 rounded-full px-2 py-1 text-[10px] font-semibold',
                delta >= 0
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                  : 'bg-red-500/10 text-red-600 dark:text-red-400'
              )}
            >
              {delta >= 0 ? (
                <ArrowUpRight className="h-3 w-3" />
              ) : (
                <ArrowDownRight className="h-3 w-3" />
              )}
              {Math.abs(delta).toFixed(1)}%
            </div>
          )}
        </div>

        {/* Title */}
        <div className="text-[11px] md:text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1">
          {title}
        </div>

        {/* Value */}
        <div
          className="text-xl md:text-2xl lg:text-[26px] font-bold tabular-nums tracking-tight leading-tight"
          title={fullValue}
        >
          {rendered}
        </div>

        {/* Sparkline */}
        {sparkline && sparkline.length > 1 && (
          <div className={cn('mt-3 -mx-1', config.text)}>
            <Sparkline data={sparkline} />
          </div>
        )}

        {/* Subtitle */}
        {subtitle && (
          <div className="mt-2 text-xs text-muted-foreground truncate">
            {subtitle}
          </div>
        )}
      </CardContent>

      {/* Bottom hover accent line */}
      <div
        className={cn(
          'absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-300',
          config.gradient
        )}
      />
    </Card>
  );
}