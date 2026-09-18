import { cn } from "@/lib/utils";

const ProductCardSkeleton = () => {
  return (
    <div
      aria-hidden
      className={cn(
        // ✅ w-full ensures it fills the grid cell at every breakpoint
        "relative flex w-full flex-col overflow-hidden rounded-2xl border border-white/70 bg-white/15",
        "shadow-[0_10px_45px_-16px_rgba(30,64,110,0.28)] backdrop-blur-2xl backdrop-saturate-150",
        "dark:border-white/10 dark:bg-white/5",
      )}
    >
      {/* Ambient smoke blobs */}
      <div className="pointer-events-none absolute -left-10 -top-10 h-36 w-36 rounded-full bg-[radial-gradient(circle,rgba(236,244,255,0.85),transparent_70%)] blur-2xl dark:bg-[radial-gradient(circle,rgba(255,255,255,0.15),transparent_70%)]" />
      <div className="pointer-events-none absolute -bottom-14 -right-10 h-40 w-40 rounded-full bg-[radial-gradient(circle,rgba(220,235,255,0.7),transparent_70%)] blur-2xl dark:bg-[radial-gradient(circle,rgba(255,255,255,0.12),transparent_70%)]" />

      {/* Glass edge highlights */}
      <div className="pointer-events-none absolute inset-x-4 top-0 z-10 h-px bg-gradient-to-r from-transparent via-white/90 to-transparent" />
      <div className="pointer-events-none absolute inset-[1px] z-10 rounded-[calc(1rem-1px)] ring-1 ring-inset ring-white/40" />

      {/* ✅ Image area — full width, matches aspect-[4/3] of real card */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-white/20">
        <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-white/40 via-white/10 to-transparent" />

        {/* Category pill placeholder */}
        <div className="absolute left-2 top-2 h-6 w-16 animate-pulse rounded-full border border-white/50 bg-white/30 backdrop-blur-md" />

        {/* Featured badge placeholder */}
        <div className="absolute right-2 top-2 h-6 w-20 animate-pulse rounded-full border border-white/40 bg-white/25 backdrop-blur-md" />

        {/* Quick-add button placeholder */}
        <div className="absolute bottom-2 right-2 h-9 w-9 animate-pulse rounded-full border border-white/40 bg-white/25 backdrop-blur-md" />
      </div>

      {/* Body — matches real card padding + content stack */}
      <div className="relative flex flex-1 flex-col p-4">
        {/* Title + diet mark */}
        <div className="flex items-start justify-between gap-2">
          <div className="h-5 w-3/4 animate-pulse rounded-md bg-white/30" />
          <div className="h-4 w-4 shrink-0 animate-pulse rounded-[3px] border border-white/40 bg-white/20" />
        </div>

        {/* Description (2 lines) */}
        <div className="mt-2 space-y-1.5">
          <div className="h-3 w-full animate-pulse rounded bg-white/20" />
          <div className="h-3 w-2/3 animate-pulse rounded bg-white/20" />
        </div>

        {/* Rating + spice row */}
        <div className="mt-3 flex items-center gap-3">
          <div className="h-3.5 w-10 animate-pulse rounded bg-white/20" />
          <div className="flex items-center gap-0.5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-3 w-3 animate-pulse rounded-sm bg-white/20"
              />
            ))}
          </div>
        </div>

        {/* Price row */}
        <div className="mt-3 flex items-center justify-between">
          <div className="h-4 w-14 animate-pulse rounded bg-white/30" />
        </div>
      </div>
    </div>
  );
};

export default ProductCardSkeleton;