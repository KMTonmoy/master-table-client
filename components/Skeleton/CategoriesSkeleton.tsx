const CategoriesSkeleton = () => {
  return (
    <section className="section">
      <div className="content-wrap px-5">
        {/* Header skeleton */}
        <div className="flex items-end justify-between gap-4">
          <div className="h-8 w-64 animate-pulse rounded-md bg-border/70 sm:h-9 sm:w-72" />
          <div className="hidden h-4 w-28 animate-pulse rounded-md bg-border/60 sm:block" />
        </div>

        {/* Cards skeleton */}
        <div className="mt-8 flex gap-4 overflow-x-auto pb-2 lg:grid lg:grid-cols-5 lg:overflow-visible">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="w-[160px] shrink-0 lg:w-auto"
            >
              <div className="relative aspect-[4/5] animate-pulse overflow-hidden rounded-2xl border border-border bg-border/50">
                <div
                  className="absolute inset-0 -translate-x-full animate-[shimmer_1.8s_infinite] bg-gradient-to-r from-transparent via-background/40 to-transparent"
                  style={{ animationDelay: `${i * 120}ms` }}
                />
              </div>
              <div
                className="mt-3 h-5 w-24 animate-pulse rounded-md bg-border/70"
                style={{ animationDelay: `${i * 80 + 60}ms` }}
              />
              <div
                className="mt-2 h-4 w-16 animate-pulse rounded-md bg-border/50"
                style={{ animationDelay: `${i * 80 + 120}ms` }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoriesSkeleton;