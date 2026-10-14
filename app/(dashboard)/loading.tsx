// app/(dashboard)/loading.tsx

export default function DashboardLoading() {
  return (
    <div className="space-y-4 md:space-y-6 animate-pulse">
      {/* Page header skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div className="space-y-2">
          <div className="h-7 md:h-9 w-48 bg-muted rounded-md" />
          <div className="h-4 w-72 bg-muted rounded-md max-w-full" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-9 w-24 bg-muted rounded-md" />
          <div className="h-9 w-28 bg-muted rounded-md" />
        </div>
      </div>

      {/* Stat cards skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border bg-card p-4 md:p-5"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 space-y-2">
                <div className="h-3 w-20 bg-muted rounded" />
                <div className="h-6 w-32 bg-muted rounded" />
                <div className="h-3 w-16 bg-muted rounded" />
              </div>
              <div className="h-10 w-10 rounded-lg bg-muted shrink-0" />
            </div>
          </div>
        ))}
      </div>

      {/* Main chart skeleton */}
      <div className="rounded-xl border bg-card p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="h-4 w-40 bg-muted rounded" />
          <div className="h-8 w-24 bg-muted rounded" />
        </div>
        <div className="h-[280px] w-full bg-muted/60 rounded-lg" />
      </div>

      {/* Two widget skeleton row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="rounded-xl border bg-card p-5 space-y-3">
          <div className="h-4 w-32 bg-muted rounded mb-3" />
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between gap-3">
              <div className="flex-1 space-y-1.5">
                <div className="h-3.5 w-40 bg-muted rounded max-w-full" />
                <div className="h-3 w-24 bg-muted rounded" />
              </div>
              <div className="h-6 w-16 bg-muted rounded-full shrink-0" />
            </div>
          ))}
        </div>

        <div className="rounded-xl border bg-card p-5 space-y-3">
          <div className="h-4 w-32 bg-muted rounded mb-3" />
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between gap-3">
              <div className="flex-1 space-y-1.5">
                <div className="h-3.5 w-40 bg-muted rounded max-w-full" />
                <div className="h-3 w-24 bg-muted rounded" />
              </div>
              <div className="h-4 w-16 bg-muted rounded shrink-0" />
            </div>
          ))}
        </div>

        <div className="rounded-xl border bg-card p-5 space-y-3">
          <div className="h-4 w-32 bg-muted rounded mb-3" />
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="h-7 w-7 rounded-full bg-muted shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3.5 w-32 bg-muted rounded" />
                <div className="h-3 w-20 bg-muted rounded" />
              </div>
              <div className="h-4 w-16 bg-muted rounded shrink-0" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}