// components/shared/page-header.tsx

import { cn } from '@/lib/utils';

interface Props {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({ title, description, actions, className }: Props) {
  return (
    <div
      className={cn(
        'flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4 md:mb-6',
        className
      )}
    >
      <div className="min-w-0">
        <h1 className="text-xl md:text-2xl lg:text-3xl font-bold tracking-tight truncate">
          {title}
        </h1>
        {description && (
          <p className="text-xs md:text-sm text-muted-foreground mt-1">
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2 flex-wrap">{actions}</div>}
    </div>
  );
}