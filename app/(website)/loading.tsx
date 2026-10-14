// app/(website)/loading.tsx

export default function WebsiteLoading() {
  return (
    <div className="animate-pulse">
      {/* Hero skeleton */}
      <section className="relative overflow-hidden border-b border-border bg-gradient-to-br from-brand-600/20 via-brand-700/20 to-brand-800/20">
        <div className="container mx-auto py-14 md:py-20 lg:py-28">
          <div className="max-w-2xl space-y-5">
            <div className="h-6 w-56 bg-white/20 rounded-full" />
            <div className="space-y-3">
              <div className="h-10 md:h-14 w-3/4 bg-white/20 rounded-md" />
              <div className="h-10 md:h-14 w-1/2 bg-white/20 rounded-md" />
            </div>
            <div className="space-y-2">
              <div className="h-4 w-full max-w-lg bg-white/15 rounded" />
              <div className="h-4 w-3/4 max-w-md bg-white/15 rounded" />
            </div>
            <div className="flex gap-2 pt-2">
              <div className="h-11 w-40 bg-white/20 rounded-md" />
              <div className="h-11 w-44 bg-white/10 rounded-md" />
            </div>
            <div className="grid grid-cols-3 gap-4 pt-6 max-w-md">
              {[0, 1, 2].map((i) => (
                <div key={i} className="space-y-2">
                  <div className="h-8 w-16 bg-white/20 rounded" />
                  <div className="h-3 w-20 bg-white/15 rounded" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Trust bar skeleton */}
      <section className="border-b border-border bg-muted/30">
        <div className="container mx-auto py-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-muted shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3.5 w-24 bg-muted rounded" />
                  <div className="h-3 w-32 bg-muted rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories skeleton */}
      <section className="container mx-auto py-10 md:py-14">
        <div className="flex items-end justify-between gap-4 mb-6">
          <div className="space-y-2">
            <div className="h-6 md:h-7 w-48 bg-muted rounded" />
            <div className="h-4 w-64 bg-muted rounded" />
          </div>
          <div className="h-4 w-20 bg-muted rounded" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl border bg-card p-4 md:p-5 space-y-3"
            >
              <div className="h-10 w-10 rounded-lg bg-muted" />
              <div className="h-4 w-24 bg-muted rounded" />
              <div className="h-3 w-16 bg-muted rounded" />
            </div>
          ))}
        </div>
      </section>

      {/* Featured products skeleton */}
      <section className="container mx-auto pb-10 md:pb-14">
        <div className="flex items-end justify-between gap-4 mb-6">
          <div className="space-y-2">
            <div className="h-6 md:h-7 w-40 bg-muted rounded" />
            <div className="h-4 w-56 bg-muted rounded" />
          </div>
          <div className="h-4 w-20 bg-muted rounded" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl border bg-card overflow-hidden"
            >
              <div className="aspect-square bg-muted" />
              <div className="p-3 space-y-2">
                <div className="h-3 w-16 bg-muted rounded" />
                <div className="h-4 w-full bg-muted rounded" />
                <div className="h-4 w-3/4 bg-muted rounded" />
                <div className="h-3 w-20 bg-muted rounded" />
                <div className="pt-2 border-t border-border flex items-center justify-between">
                  <div className="h-5 w-24 bg-muted rounded" />
                  <div className="h-7 w-14 bg-muted rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Promo banner skeleton */}
      <section className="container mx-auto pb-10 md:pb-14">
        <div className="rounded-xl bg-muted h-40 md:h-44" />
      </section>
    </div>
  );
}